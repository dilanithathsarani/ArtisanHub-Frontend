import api, { getApiError } from "./api.js";
import { AUTH_EVENT, getToken, getUser } from "./auth.js";

const GUEST_KEY = "artisanhub-wishlist";
const listeners = new Set();
const idOf = (product) => product?._id || product?.productId || product?.id;
let session;
let generation = 0;
let inFlight;
let state = { items: [], loading: true, pending: false, error: "" };

export function readGuestWishlist() {
  try {
    const saved = JSON.parse(localStorage.getItem(GUEST_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    return [...new Map(saved.filter(idOf).map((item) => [idOf(item), { ...item, _id: idOf(item) }])).values()];
  } catch { return []; }
}

export function normalizeWishlist(data) {
  if (!Array.isArray(data?.wishlist?.products)) throw new Error("Invalid wishlist response from the server.");
  return data.wishlist.products.filter((product) => product && typeof product === "object" && product._id);
}

function publish(update) {
  state = { ...state, ...update };
  listeners.forEach((listener) => listener());
}

function checkSession(token, version) {
  if (token !== getToken() || version !== generation) throw new Error("Your session changed. Please try again.");
}

const writeGuest = (items) => localStorage.setItem(GUEST_KEY, JSON.stringify(items));
export const getWishlistSnapshot = () => state;
export const subscribeWishlist = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

async function fetchServer(token, version) {
  const response = await api.get("/wishlist");
  checkSession(token, version);
  return normalizeWishlist(response.data);
}

async function addServer(productId, token, version) {
  try {
    const response = await api.post("/wishlist", { productId });
    checkSession(token, version);
    return normalizeWishlist(response.data);
  } catch (error) {
    checkSession(token, version);
    // A different tab or a lost response may have already saved this product.
    if (error.response?.status === 400) {
      const items = await fetchServer(token, version);
      if (items.some((item) => idOf(item) === productId)) return items;
    }
    throw error;
  }
}

export function loadWishlist({ force = false } = {}) {
  const token = getToken();
  if (session === token) {
    if (inFlight) return inFlight;
    if (!force && !state.loading) return Promise.resolve();
    if (state.pending) return Promise.resolve();
  }
  const changedSession = session !== token;
  session = token;
  const version = generation;
  publish({ loading: true, error: "", ...(changedSession || !token ? { items: [] } : {}) });
  const request = (async () => {
    try {
      if (!token) {
        publish({ items: readGuestWishlist(), loading: false });
        return;
      }
      if (getUser()?.role && getUser().role !== "buyer") {
        throw new Error("Wishlists are available to buyer accounts only.");
      }
      let items = await fetchServer(token, version);
      publish({ items });
      for (const guest of readGuestWishlist()) {
        if (!items.some((item) => idOf(item) === idOf(guest))) {
          items = await addServer(idOf(guest), token, version);
        }
        checkSession(token, version);
        writeGuest(readGuestWishlist().filter((item) => idOf(item) !== idOf(guest)));
        publish({ items });
      }
      publish({ items, loading: false });
    } catch (error) {
      if (token === getToken() && version === generation) publish({ loading: false,
        error: getApiError(error, error.message || "Unable to load your wishlist.") });
      throw error;
    }
  })();
  inFlight = request;
  void request.finally(() => { if (inFlight === request) inFlight = null; }).catch(() => {});
  return request;
}

async function mutate(operation) {
  if (state.pending) throw new Error("Please wait for the current wishlist update.");
  const token = getToken();
  const version = generation;
  publish({ pending: true });
  try {
    if (inFlight) await inFlight;
    if (session !== token || state.loading) await loadWishlist();
    checkSession(token, version);
    const result = await operation(token, version);
    checkSession(token, version);
    publish({ items: result.items });
    return result.saved;
  } finally {
    if (token === getToken() && version === generation) publish({ pending: false });
  }
}

export function toggleWishlistItem(product) {
  return mutate(async (token, version) => {
    const productId = idOf(product);
    if (!productId) throw new Error("This product cannot be saved.");
    if (state.error) throw new Error("Refresh your wishlist before changing saved items.");
    const exists = state.items.some((item) => idOf(item) === productId);
    if (!token) {
      const items = exists ? state.items.filter((item) => idOf(item) !== productId)
        : [...state.items, { ...product, _id: productId }];
      writeGuest(items);
      return { items, saved: !exists };
    }
    if (!exists) return { items: await addServer(productId, token, version), saved: true };
    try {
      const response = await api.delete(`/wishlist/${encodeURIComponent(productId)}`);
      checkSession(token, version);
      return { items: normalizeWishlist(response.data), saved: false };
    } catch (error) {
      checkSession(token, version);
      if (error.response?.status === 404) {
        const items = await fetchServer(token, version);
        if (!items.some((item) => idOf(item) === productId)) return { items, saved: false };
      }
      throw error;
    }
  });
}

export function clearWishlist() {
  return mutate(async (token, version) => {
    let items = [];
    if (token) {
      const response = await api.delete("/wishlist");
      checkSession(token, version);
      items = normalizeWishlist(response.data);
    }
    writeGuest([]);
    publish({ error: "" });
    return { items };
  });
}

export function discardGuestWishlist() {
  writeGuest([]);
  return loadWishlist({ force: true });
}

function reset() {
  generation += 1;
  session = undefined;
  inFlight = null;
  publish({ items: [], loading: true, pending: false, error: "" });
  void loadWishlist().catch(() => {});
}

if (typeof window !== "undefined") {
  window.addEventListener(AUTH_EVENT, reset);
  window.addEventListener("storage", (event) => {
    if (event.key === "token" || event.key === null) reset();
    else if (!getToken() && event.key === GUEST_KEY) void loadWishlist({ force: true }).catch(() => {});
  });
}
