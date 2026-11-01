import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import api from "./api.js";
import { validateReview, eligibleReviewOrders, fetchProductReviews, submitReview } from "./reviews.js";

const productId = "product-one";
const order = { _id: "order-one", orderId: "ORD-00001", buyer: { _id: "buyer" }, orderStatus: "delivered", items: [{ product: productId, name: "Bowl", quantity: 1 }] };
const review = { _id: "review-one", product: productId, buyer: { _id: "buyer", name: "Buyer" }, order: order._id, rating: 5, comment: "Beautiful bowl", isVisible: true };
const fields = { orderId: order._id, rating: "5", comment: " Beautiful bowl " };
let calls;
let currentOrder;
let failure;
beforeEach(() => {
  const storage = new Map([["token", "buyer-token"], ["user", JSON.stringify({ id: "buyer", role: "buyer" })]]);
  globalThis.localStorage = { getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)), removeItem: (key) => storage.delete(key) };
  globalThis.window = new EventTarget();
  calls = [];
  currentOrder = structuredClone(order);
  failure = null;
  api.defaults.adapter = async (config) => {
    calls.push(config);
    if (config.method === "post" && failure) throw { config, response: { status: failure.status, data: { message: failure.message } } };
    return { status: 200, config, data: config.method === "post" ? { success: true, review }
      : config.url.startsWith("/orders/") ? { success: true, order: currentOrder }
        : { success: true, product: { _id: productId, averageRating: 5, reviewCount: 1 }, reviews: [review] } };
  };
});

test("rating and trimmed comment validation matches backend bounds", () => {
  assert.deepEqual(validateReview(fields), {});
  for (const rating of [0, 6, 2.5, "", "invalid"]) assert.ok(validateReview({ ...fields, rating }).rating);
  for (const comment of ["    ", "four", "x".repeat(1001)]) assert.ok(validateReview({ ...fields, comment }).comment);
  assert.ok(validateReview({ ...fields, orderId: "" }).orderId);
});

test("only delivered purchases containing the actual product are eligible", () => {
  const wrongProduct = { ...order, _id: "wrong", items: [{ product: "different" }] };
  const pending = { ...order, _id: "pending", orderStatus: "shipped" };
  assert.deepEqual(eligibleReviewOrders([order, wrongProduct, pending], productId).map((item) => item._id), [order._id]);
  assert.equal(eligibleReviewOrders([{ ...order, items: [{ product: { _id: productId } }] }], productId).length, 1);
});

test("visible existing reviews exclude only that buyer's reviewed order", () => {
  assert.deepEqual(eligibleReviewOrders([order], productId, [review], "buyer"), []);
  assert.equal(eligibleReviewOrders([order], productId, [review], "another-buyer").length, 1);
});

test("public reviews load authoritative aggregates and omit hidden entries", async () => {
  api.defaults.adapter = async (config) => ({ status: 200, config, data: { product: { _id: productId, averageRating: 5, reviewCount: 1 }, reviews: [review, { ...review, _id: "hidden", isVisible: false }] } });
  const result = await fetchProductReviews(productId);
  assert.equal(result.reviews.length, 1);
  assert.equal(result.product.averageRating, 5);
  assert.equal(result.product.reviewCount, 1);
});

test("review submission rechecks eligibility and sends only validated fields", async () => {
  const result = await submitReview(productId, { ...fields, isVisible: true, buyer: "forged" });
  assert.equal(result._id, review._id);
  assert.equal(calls[0].url, "/orders/order-one");
  assert.deepEqual(JSON.parse(calls[1].data), { productId, orderId: order._id, rating: 5, comment: "Beautiful bowl" });
});

test("invalid, guest and seller submissions do not reach the backend", async () => {
  await assert.rejects(submitReview(productId, { ...fields, rating: 0 }), /highlighted/);
  localStorage.removeItem("token");
  await assert.rejects(submitReview(productId, fields), /sign in/);
  localStorage.setItem("token", "seller");
  localStorage.setItem("user", JSON.stringify({ role: "seller" }));
  await assert.rejects(submitReview(productId, fields), /Only buyers/);
  assert.equal(calls.length, 0);
});

test("a stale delivered-order selection cannot submit a review", async () => {
  currentOrder.orderStatus = "cancelled";
  await assert.rejects(submitReview(productId, fields), /delivered orders/);
  assert.equal(calls.some((config) => config.method === "post"), false);
});

test("duplicate and moderation responses are surfaced without claiming success", async () => {
  failure = { status: 409, message: "You have already reviewed this Product for this Order" };
  await assert.rejects(submitReview(productId, fields), (error) => error.response.status === 409);
  failure = { status: 403, message: "Review submission is not permitted" };
  await assert.rejects(submitReview(productId, fields), (error) => error.response.status === 403);
});

test("concurrent submissions for the same purchase are blocked", async () => {
  const first = submitReview(productId, fields);
  await assert.rejects(submitReview(productId, fields), /already being submitted/);
  await first;
  assert.equal(calls.filter((config) => config.method === "post").length, 1);
});

test("account changes cannot submit a previous buyer's review", async () => {
  api.defaults.adapter = async (config) => {
    localStorage.setItem("token", "other-buyer");
    return { status: 200, config, data: { order } };
  };
  await assert.rejects(submitReview(productId, fields), /session changed/);
});

test("malformed review responses fail explicitly", async () => {
  api.defaults.adapter = async (config) => ({ status: 200, config, data: { reviews: [] } });
  await assert.rejects(fetchProductReviews(productId), /Invalid reviews response/);
});
