import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import api from "./api.js";
import { AUTH_EVENT } from "./auth.js";

globalThis.window = new EventTarget();
const { loadWishlist, toggleWishlistItem, clearWishlist, readGuestWishlist,
  normalizeWishlist, getWishlistSnapshot, subscribeWishlist, discardGuestWishlist } = await import("./wishlist.js");
const product = { _id: "bowl", name: "Clay bowl", price: 1200, stock: 5 };
let server;
let fail;
let requests;
let duplicate;
let unavailable;

beforeEach(async () => {
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  };
  server = [];
  fail = false;
  duplicate = false;
  unavailable = false;
  requests = [];
  api.defaults.adapter = async (config) => {
    requests.push([config.method, config.url]);
    if (fail) throw { config, response: { status: 500, data: { message: "Wishlist unavailable" } } };
    if (config.method === "post") {
      const { productId } = JSON.parse(config.data);
      if (unavailable) throw { config, response: { status: 404, data: { message: "Product is unavailable" } } };
      if (duplicate) {
        server = [product];
        throw { config, response: { status: 400, data: { message: "Product is already in the Wishlist" } } };
      }
      server.push({ ...product, _id: productId });
    }
    if (config.method === "delete") server = config.url === "/wishlist" ? []
      : server.filter((item) => item._id !== decodeURIComponent(config.url.split("/").pop()));
    return { status: 200, config, data: { wishlist: { products: structuredClone(server) } } };
  };
  window.dispatchEvent(new Event(AUTH_EVENT));
  await loadWishlist();
});

test("guests save, remove, and clear only device storage", async () => {
  assert.equal(await toggleWishlistItem(product), true);
  assert.equal(readGuestWishlist()[0]._id, "bowl");
  assert.equal(await toggleWishlistItem(product), false);
  assert.deepEqual(readGuestWishlist(), []);
  await toggleWishlistItem(product);
  await clearWishlist();
  assert.deepEqual(readGuestWishlist(), []);
  assert.equal(requests.length, 0);
});

test("buyer state uses server products and notifies every subscribed surface", async () => {
  localStorage.setItem("token", "buyer");
  await loadWishlist();
  let notifications = 0;
  const unsubscribe = subscribeWishlist(() => notifications++);
  await toggleWishlistItem({ ...product, price: 1 });
  assert.equal(getWishlistSnapshot().items[0].price, 1200);
  await loadWishlist({ force: true });
  assert.equal(getWishlistSnapshot().items.length, 1);
  await toggleWishlistItem(product);
  assert.deepEqual(getWishlistSnapshot().items, []);
  await toggleWishlistItem(product);
  await clearWishlist();
  assert.deepEqual(getWishlistSnapshot().items, []);
  assert.ok(notifications > 0);
  unsubscribe();
});

test("failed remove and clear preserve saved state", async () => {
  localStorage.setItem("token", "buyer");
  server = [product];
  await loadWishlist();
  fail = true;
  await assert.rejects(toggleWishlistItem(product));
  await assert.rejects(clearWishlist());
  assert.equal(getWishlistSnapshot().items[0]._id, "bowl");
  assert.equal(getWishlistSnapshot().pending, false);
});

test("guest union deduplicates existing products and preserves failures for retry", async () => {
  localStorage.setItem("artisanhub-wishlist", JSON.stringify([product, product, { _id: "vase" }]));
  localStorage.setItem("token", "buyer");
  server = [product];
  unavailable = true;
  await assert.rejects(loadWishlist());
  assert.deepEqual(readGuestWishlist().map((item) => item._id), ["vase"]);
  assert.equal(getWishlistSnapshot().items[0]._id, "bowl");
  assert.match(getWishlistSnapshot().error, /unavailable/);
  unavailable = false;
  await loadWishlist({ force: true });
  assert.equal(server.length, 2);
  assert.deepEqual(readGuestWishlist(), []);
  assert.ok(!requests.some(([method]) => method === "delete"));
});

test("duplicate server adds reconcile without a false failure", async () => {
  localStorage.setItem("token", "buyer");
  await loadWishlist();
  duplicate = true;
  assert.equal(await toggleWishlistItem(product), true);
  assert.equal(getWishlistSnapshot().items.length, 1);
});

test("repeated clicks cannot submit concurrent wishlist mutations", async () => {
  localStorage.setItem("token", "buyer");
  await loadWishlist();
  const first = toggleWishlistItem(product);
  await assert.rejects(toggleWishlistItem(product), /wait/);
  await first;
  assert.equal(requests.filter(([method]) => method === "post").length, 1);
});

test("logout hides the buyer list and rejects the previous session response", async () => {
  localStorage.setItem("token", "buyer");
  let resolve;
  let started;
  const adapterStarted = new Promise((done) => { started = done; });
  api.defaults.adapter = (config) => new Promise((done) => {
    resolve = () => done({ status: 200, config, data: { wishlist: { products: [product] } } });
    started();
  });
  const request = loadWishlist();
  await adapterStarted;
  localStorage.removeItem("token");
  window.dispatchEvent(new Event(AUTH_EVENT));
  resolve();
  await assert.rejects(request, /session changed/);
  await loadWishlist();
  assert.deepEqual(getWishlistSnapshot().items, []);
});

test("unavailable populated products are filtered and malformed responses fail explicitly", () => {
  assert.deepEqual(normalizeWishlist({ wishlist: { products: [null, "id", product] } }), [product]);
  assert.throws(() => normalizeWishlist({}), /Invalid wishlist/);
});

test("discarding failed guest entries preserves the saved buyer wishlist", async () => {
  localStorage.setItem("token", "buyer");
  localStorage.setItem("artisanhub-wishlist", JSON.stringify([{ _id: "missing" }]));
  server = [product];
  unavailable = true;
  await assert.rejects(loadWishlist());
  await discardGuestWishlist();
  assert.deepEqual(readGuestWishlist(), []);
  assert.equal(getWishlistSnapshot().items[0]._id, "bowl");
  assert.equal(getWishlistSnapshot().error, "");
});
