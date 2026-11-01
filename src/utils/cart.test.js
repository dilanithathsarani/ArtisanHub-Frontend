import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import api from "./api.js";
import { addCartItem, updateCartItem, removeCartItem, loadCart, getCartSnapshot, readGuestCart } from "./cart.js";

let server;
let requests;
let fail;
const product = { _id: "product-1", name: "Clay bowl", price: 1200, stock: 5,
  status: "approved", isActive: true, images: ["bowl.jpg"] };

beforeEach(async () => {
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  };
  globalThis.window = new EventTarget();
  server = [];
  requests = [];
  fail = false;
  api.defaults.adapter = async (config) => {
    requests.push([config.method, config.url]);
    if (fail) throw { config, response: { status: 400, data: { message: "Only 5 item(s) are available" } } };
    const body = config.data ? JSON.parse(config.data) : {};
    if (config.method === "post") {
      const item = server.find((entry) => entry.product._id === body.productId);
      if (item) item.quantity += body.quantity;
      else server.push({ product, quantity: body.quantity });
    }
    if (config.method === "put") server[0].quantity = body.quantity;
    if (config.method === "delete") server = [];
    return { status: 200, config, data: { cart: { items: structuredClone(server) } } };
  };
  await loadCart();
});

test("guest cart persists, rejects zero stock, and supports removal", async () => {
  await addCartItem(product, 2);
  assert.equal(readGuestCart()[0].quantity, 2);
  await assert.rejects(addCartItem({ ...product, stock: 0 }), /Only 0/);
  await assert.rejects(updateCartItem(product._id, 6), /Only 5/);
  assert.equal(getCartSnapshot().items[0].quantity, 2);
  await removeCartItem(product._id);
  assert.deepEqual(readGuestCart(), []);
  assert.equal(requests.length, 0);
});

test("buyer cart loads server prices and persists quantity/removal operations", async () => {
  localStorage.setItem("token", "buyer");
  await loadCart();
  await addCartItem({ ...product, price: 1 }, 2);
  assert.equal(getCartSnapshot().items[0].price, 1200);
  await updateCartItem(product._id, 3);
  await loadCart();
  assert.equal(getCartSnapshot().items[0].quantity, 3);
  await removeCartItem(product._id);
  assert.deepEqual(getCartSnapshot().items, []);
  assert.ok(requests.some(([method, path]) => method === "put" && path === "/cart/items/product-1"));
});

test("failed server updates preserve the displayed cart", async () => {
  localStorage.setItem("token", "buyer");
  server = [{ product, quantity: 2 }];
  await loadCart();
  fail = true;
  await assert.rejects(updateCartItem(product._id, 6));
  assert.equal(getCartSnapshot().items[0].quantity, 2);
  assert.equal(getCartSnapshot().pending, false);
});

test("guest merge retains server items, uses larger quantities, and can retry safely", async () => {
  await addCartItem(product, 3);
  localStorage.setItem("token", "buyer");
  server = [{ product, quantity: 2 }];
  fail = true;
  await assert.rejects(loadCart());
  assert.equal(readGuestCart()[0].quantity, 3);
  fail = false;
  await loadCart();
  assert.equal(server[0].quantity, 3);
  assert.deepEqual(readGuestCart(), []);
  await loadCart();
  assert.equal(server[0].quantity, 3);
  assert.ok(!requests.some(([method]) => method === "delete"));
});

test("a previous session response cannot expose its cart to the next user", async () => {
  localStorage.setItem("token", "first");
  api.defaults.adapter = async (config) => {
    localStorage.setItem("token", "second");
    return { status: 200, config, data: { cart: { items: [{ product, quantity: 2 }] } } };
  };
  await assert.rejects(loadCart(), /session changed/);
  assert.deepEqual(getCartSnapshot().items, []);
});
