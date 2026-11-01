import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import api from "./api.js";
import { canCancelOrder, trackingStages, pageOrders, fetchBuyerOrders, fetchBuyerOrder, cancelBuyerOrder, formatOrderDate, statusLabel } from "./orders.js";

const order = { _id: "order-one", orderId: "ORD-00001", buyer: { _id: "buyer" }, orderStatus: "placed", createdAt: "2026-10-01T00:00:00Z",
  items: [{ name: "Bowl", product: "product-id", quantity: 1, price: 1000, subtotal: 1000 }], totalAmount: 1350 };
let server;
let calls;
let fail;
beforeEach(() => {
  const storage = new Map([["token", "buyer-token"], ["user", JSON.stringify({ id: "buyer", role: "buyer" })]]);
  globalThis.localStorage = { getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)), removeItem: (key) => storage.delete(key) };
  globalThis.window = new EventTarget();
  server = structuredClone(order);
  calls = [];
  fail = false;
  api.defaults.adapter = async (config) => {
    calls.push([config.method, config.url]);
    if (fail && config.method === "put") throw { config, response: { status: 400, data: { message: "Status changed" } } };
    if (config.method === "put") server = { ...server, orderStatus: "cancelled", cancellationReason: "Cancelled by buyer" };
    return { status: 200, config, data: config.url === "/orders/mine" ? { success: true, orders: [structuredClone(server)] } : { success: true, order: structuredClone(server) } };
  };
});

test("cancellation follows backend placed/confirmed rules and respects explicit denial", () => {
  assert.equal(canCancelOrder(order), true);
  assert.equal(canCancelOrder({ ...order, orderStatus: "confirmed" }), true);
  for (const orderStatus of ["processing", "shipped", "delivered", "cancelled", "failed", "pending", "unknown"]) {
    assert.equal(canCancelOrder({ ...order, orderStatus }), false);
  }
  assert.equal(canCancelOrder({ ...order, canCancel: false }), false);
});

test("tracking marks only confirmed stages and never completes cancelled or failed delivery", () => {
  assert.deepEqual(trackingStages("shipped").filter((step) => step.complete).map((step) => step.stage), ["placed", "confirmed", "processing", "shipped"]);
  assert.equal(trackingStages("delivered").filter((step) => step.complete).length, 5);
  for (const status of ["cancelled", "failed", "unknown"]) assert.equal(trackingStages(status).some((step) => step.complete), false);
  assert.equal(statusLabel("unknown"), "Unknown status");
});

test("filters page using orderStatus and clamp after cancellation changes counts", () => {
  const orders = Array.from({ length: 12 }, (_, index) => ({ ...order, _id: String(index), orderStatus: index < 7 ? "placed" : "delivered" }));
  assert.equal(pageOrders(orders, "all", 2).items.length, 5);
  assert.equal(pageOrders(orders, "placed", 99).page, 2);
  assert.equal(pageOrders(orders, "placed", 99).items.length, 2);
  assert.equal(pageOrders(orders, "cancelled", 9).page, 1);
  assert.deepEqual(pageOrders(orders, "cancelled").items, []);
});

test("history and details use confirmed API shapes and preserve item snapshots", async () => {
  const orders = await fetchBuyerOrders();
  const details = await fetchBuyerOrder("ORD-00001");
  assert.equal(orders[0].orderStatus, "placed");
  assert.equal(details.items[0].product, "product-id");
  assert.deepEqual(calls, [["get", "/orders/mine"], ["get", "/orders/ORD-00001"]]);
});

test("cancellation rechecks current server eligibility before sending PUT", async () => {
  server.orderStatus = "shipped";
  await assert.rejects(cancelBuyerOrder(order._id), /cannot be cancelled/);
  assert.equal(calls.some(([method]) => method === "put"), false);
  assert.equal(server.orderStatus, "shipped");
});

test("confirmed orders cancel using the server result rather than optimistic status", async () => {
  server.orderStatus = "confirmed";
  const result = await cancelBuyerOrder(order._id);
  assert.equal(result.orderStatus, "cancelled");
  assert.equal(result.cancellationReason, "Cancelled by buyer");
  assert.deepEqual(calls, [["get", "/orders/order-one"], ["put", "/orders/order-one/cancel"]]);
});

test("failed cancellation does not report a false cancelled state", async () => {
  fail = true;
  await assert.rejects(cancelBuyerOrder(order._id));
  assert.equal(server.orderStatus, "placed");
});

test("concurrent cancellation requests are blocked", async () => {
  const first = cancelBuyerOrder(order._id);
  await assert.rejects(cancelBuyerOrder(order._id), /already in progress/);
  await first;
  assert.equal(calls.filter(([method]) => method === "put").length, 1);
});

test("requests cannot expose another buyer's order or a previous session response", async () => {
  server.buyer = { _id: "someone-else" };
  await assert.rejects(fetchBuyerOrder(order._id), /permission/);
  api.defaults.adapter = async (config) => {
    localStorage.setItem("token", "another-session");
    return { status: 200, config, data: { orders: [order] } };
  };
  await assert.rejects(fetchBuyerOrders(), /session changed/);
});

test("malformed history is rejected and invalid dates have a readable fallback", async () => {
  api.defaults.adapter = async (config) => ({ status: 200, config, data: { orders: [{}] } });
  await assert.rejects(fetchBuyerOrders(), /Invalid order/);
  assert.equal(formatOrderDate("bad-date"), "Date unavailable");
  assert.equal(formatOrderDate(null), "Date unavailable");
});
