import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import api, { getApiError } from "./api.js";
import { saveSession, getToken, getUser, clearSession } from "./auth.js";

beforeEach(() => {
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
  globalThis.window = new EventTarget();
});

test("login rejects missing tokens and replaces stale user details", () => {
  assert.throws(() => saveSession({ user: { name: "Buyer" } }), /valid login token/);
  assert.equal(getToken(), "");
  saveSession({ data: { accessToken: "first", user: { name: "Buyer" } } });
  assert.equal(getUser().name, "Buyer");
  saveSession({ token: "second" });
  assert.equal(getUser(), null);
  clearSession();
  assert.equal(getToken(), "");
});

test("requests use the latest token and auth endpoints omit it", async () => {
  const adapter = async (config) => ({ data: config.headers.get("Authorization"), config, status: 200 });
  saveSession({ token: "first" });
  assert.equal((await api.get("/orders/mine", { adapter })).data, "Bearer first");
  saveSession({ token: "second" });
  assert.equal((await api.get("/orders/mine", { adapter })).data, "Bearer second");
  assert.equal((await api.post("/auth/login", {}, { adapter })).data, undefined);
});

test("401 expires its session without clearing a newer login", async () => {
  saveSession({ token: "old" });
  const adapter = async (config) => {
    saveSession({ token: "new" });
    throw { config, response: { status: 401 } };
  };
  await assert.rejects(api.get("/orders/mine", { adapter }));
  assert.equal(getToken(), "new");
  await assert.rejects(api.get("/orders/mine", { adapter: async (config) => {
    throw { config, response: { status: 401 } };
  } }));
  assert.equal(getToken(), "");
});

test("errors produce readable messages rather than server objects", () => {
  assert.equal(getApiError({ response: { data: { error: { code: "INVALID" } } } }, "Try again"), "Try again");
  assert.equal(getApiError({ response: { data: { message: "Out of stock" } } }), "Out of stock");
  assert.match(getApiError({ request: {} }), /connection/);
  assert.match(getApiError({ code: "ECONNABORTED" }), /timed out/);
});
