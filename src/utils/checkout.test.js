import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import api from "./api.js";
import { validateAddress, getAddressErrors, normalizeReceipt, placeOrder, hasUncertainOrder, acknowledgeOrderCheck } from "./checkout.js";

const address = { fullName: " Buyer ", phone: "0771234567", addressLine1: "1 Main Street", addressLine2: "", city: "Galle", district: "Galle", postalCode: "80000" };
const order = { _id: "one", orderId: "ORD-00001", subtotal: 1000, deliveryFee: 350, totalAmount: 1350,
  shippingAddress: address, items: [{ productId: "bowl", name: "Bowl", quantity: 1, price: 1000, subtotal: 1000 }], paymentStatus: "pending" };
let counter = 0;
let calls;

beforeEach(() => {
  const storage = new Map([["token", `buyer-${++counter}`]]);
  globalThis.localStorage = { getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)), removeItem: (key) => storage.delete(key) };
  globalThis.window = new EventTarget();
  calls = [];
  api.defaults.adapter = async (config) => {
    calls.push(config);
    return { status: 201, config, data: { success: true, orders: [order] } };
  };
});

test("delivery validation covers required fields, district, phone and postal format", () => {
  assert.deepEqual(validateAddress(address), {});
  assert.deepEqual(validateAddress({ ...address, phone: "+94 77 123 4567" }), {});
  const errors = validateAddress({ ...address, fullName: " ", phone: "123", postalCode: "abc", district: "Unknown" });
  assert.deepEqual(Object.keys(errors).sort(), ["district", "fullName", "phone", "postalCode"]);
});

test("invalid and unauthenticated checkout makes no order request", async () => {
  await assert.rejects(placeOrder({}), /delivery details/);
  localStorage.removeItem("token");
  await assert.rejects(placeOrder(address), /sign in/);
  assert.equal(calls.length, 0);
});

test("request sends only trimmed delivery fields and COD, never card data or client totals", async () => {
  const receipt = await placeOrder({ ...address, cardNumber: "secret", totalAmount: 1 });
  const payload = JSON.parse(calls[0].data);
  assert.equal(payload.paymentMethod, "cash-on-delivery");
  assert.equal(payload.shippingAddress.fullName, "Buyer");
  assert.equal(payload.shippingAddress.country, "Sri Lanka");
  assert.equal(JSON.stringify(payload).includes("secret"), false);
  assert.equal(payload.totalAmount, undefined);
  assert.equal(receipt.totalAmount, 1350);
});

test("receipt sums server delivery fees for multiple artisan orders", () => {
  const receipt = normalizeReceipt({ success: true, orders: [order, { ...order, _id: "two", orderId: "ORD-00002" }] });
  assert.equal(receipt.totalAmount, 2700);
  assert.equal(receipt.deliveryFee, 700);
  assert.throws(() => normalizeReceipt({ success: true, orders: [] }), /incomplete/);
  assert.throws(() => normalizeReceipt({ success: true, orders: [{ ...order, totalAmount: "invalid" }] }), /incomplete/);
});

test("concurrent checkout submissions send exactly one request", async () => {
  let resolve;
  let start;
  const started = new Promise((done) => { start = done; });
  api.defaults.adapter = (config) => new Promise((done) => {
    resolve = () => done({ status: 201, config, data: { success: true, orders: [order] } });
    start();
  });
  const first = placeOrder(address);
  await started;
  await assert.rejects(placeOrder(address), /already in progress/);
  resolve();
  await first;
});

test("server validation exposes field messages and allows correction", async () => {
  api.defaults.adapter = async (config) => { throw { config, response: { status: 400, data: { message: "city is required" } } }; };
  await assert.rejects(placeOrder(address));
  assert.equal(hasUncertainOrder(), false);
  assert.equal(getAddressErrors({ response: { data: { message: "city is required" } } }).city, "City / town is required.");
  assert.equal(getAddressErrors({ response: { data: { errors: { "shippingAddress.phone": { message: "Invalid number" } } } } }).phone, "Invalid number");
});

test("uncertain order results block retries until the buyer checks order history", async () => {
  api.defaults.adapter = async (config) => { throw { config, request: {}, code: "ECONNABORTED" }; };
  await assert.rejects(placeOrder(address), (error) => error.orderUncertain === true);
  assert.equal(hasUncertainOrder(), true);
  await assert.rejects(placeOrder(address), /Check My Orders/);
  acknowledgeOrderCheck();
  assert.equal(hasUncertainOrder(), false);
});

test("malformed success cannot produce a false receipt or automatic retry", async () => {
  api.defaults.adapter = async (config) => ({ status: 201, config, data: { success: true, orders: [] } });
  await assert.rejects(placeOrder(address), (error) => error.orderUncertain === true);
  assert.equal(hasUncertainOrder(), true);
});

test("a response after an account change is not shown as the new buyer's receipt", async () => {
  api.defaults.adapter = async (config) => {
    localStorage.setItem("token", "different-buyer");
    return { status: 201, config, data: { success: true, orders: [order] } };
  };
  await assert.rejects(placeOrder(address), /session changed/);
});
