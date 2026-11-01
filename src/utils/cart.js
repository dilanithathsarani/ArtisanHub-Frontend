import api, { getApiError } from "./api.js";
import { AUTH_EVENT, getToken, getUser } from "./auth.js";

const GUEST_KEY = "artisanhub-cart";
const listeners = new Set();
let session;
let inFlight;
let state = { items: [], loading: true, pending: false, error: "" };

export function readGuestCart() {
  try {
    const value = JSON.parse(localStorage.getItem(GUEST_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item) => item?.productId &&
      Number.isInteger(Number(item.quantity)) && Number(item.quantity) > 0)
      .map((item) => ({ ...item, quantity: Number(item.quantity) })) : [];
  } catch { return []; }
}

export function normalizeCart(data) {
  if (!Array.isArray(data?.cart?.items)) throw new Error("Invalid cart response from the server.");
  return data.cart.items.filter((item) => item.product?._id).map(({ product, quantity }) => ({
    productId: product._id, name: product.name, price: Number(product.price), quantity,
    stock: product.stock, unavailable: product.isActive === false || product.status !== "approved",
    image: typeof product.images?.[0] === "string" ? product.images[0] : product.images?.[0]?.url || "",
  }));
}

function publish(update) {
  state = { ...state, ...update };
  listeners.forEach((listener) => listener());
}

function saveGuest(items) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(items));
}

export function discardGuestCart() {
  saveGuest([]);
}

function checkSession(token) {
  if (getToken() !== token) throw new Error("Your session changed. Please try again.");
}

export const subscribeCart = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const getCartSnapshot = () => state;

export function loadCart() {
  const token = getToken();
  if (session === token && inFlight) return inFlight;
  session = token;
  publish({ items: [], loading: true, error: "" });
  const request = (async () => {
    try {
      if (!token) {
        publish({ items: readGuestCart(), loading: false });
        return;
      }
      if (getUser()?.role && getUser().role !== "buyer") {
        throw new Error("Shopping carts are available to buyer accounts only.");
      }
      let items = normalizeCart((await api.get("/cart")).data);
      checkSession(token);
      // Merge by the larger quantity, so retries after a lost response cannot
      // add the same guest quantity twice. Never delete the existing server cart.
      for (const guest of readGuestCart()) {
        const existing = items.find((item) => item.productId === guest.productId);
        const target = Math.max(Number(guest.quantity), existing?.quantity || 0);
        if (!existing || existing.quantity < target) {
          const response = existing
            ? await api.put(`/cart/items/${encodeURIComponent(guest.productId)}`, { quantity: target })
            : await api.post("/cart/items", { productId: guest.productId, quantity: target });
          checkSession(token);
          items = normalizeCart(response.data);
        }
        checkSession(token);
        saveGuest(readGuestCart().filter((item) => item.productId !== guest.productId));
      }
      publish({ items, loading: false, error: "" });
    } catch (error) {
      if (getToken() === token) publish({ loading: false,
        error: getApiError(error, error.message || "Unable to load your cart.") });
      throw error;
    }
  })();
  inFlight = request;
  void request.finally(() => { if (inFlight === request) inFlight = null; }).catch(() => {});
  return request;
}

async function mutate(operation) {
  if (state.pending) throw new Error("Please wait for the current cart update.");
  publish({ pending: true });
  const token = getToken();
  try {
    if (inFlight) await inFlight;
    if (session !== token || state.loading || state.error) await loadCart();
    checkSession(token);
    const items = await operation(token);
    checkSession(token);
    publish({ items, error: "" });
  } finally {
    if (getToken() === token) publish({ pending: false });
  }
}

export function addCartItem(product, quantity = 1) {
  return mutate(async (token) => {
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error("Choose a positive whole quantity.");
    const productId = product._id || product.productId;
    if (!productId) throw new Error("This product cannot be added to the cart.");
    if (token) return normalizeCart((await api.post("/cart/items", { productId, quantity })).data);
    const items = readGuestCart();
    const existing = items.find((item) => item.productId === productId);
    const nextQuantity = (existing?.quantity || 0) + quantity;
    if (product.stock != null && nextQuantity > Number(product.stock)) {
      throw new Error(`Only ${product.stock} item(s) are available.`);
    }
    if (existing) existing.quantity = nextQuantity;
    else items.push({ productId, quantity, name: product.name, price: product.price,
      stock: product.stock, image: typeof product.images?.[0] === "string"
        ? product.images[0] : product.images?.[0]?.url || product.image || "" });
    saveGuest(items);
    return items;
  });
}

export function updateCartItem(productId, quantity) {
  return mutate(async (token) => {
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error("Choose a positive whole quantity.");
    if (token) return normalizeCart((await api.put(`/cart/items/${encodeURIComponent(productId)}`, { quantity })).data);
    const items = readGuestCart();
    const item = items.find((entry) => entry.productId === productId);
    if (!item) throw new Error("This item is no longer in your cart.");
    if (item.stock != null && quantity > Number(item.stock)) throw new Error(`Only ${item.stock} item(s) are available.`);
    item.quantity = quantity;
    saveGuest(items);
    return items;
  });
}

export function removeCartItem(productId) {
  return mutate(async (token) => {
    if (token) return normalizeCart((await api.delete(`/cart/items/${encodeURIComponent(productId)}`)).data);
    const items = readGuestCart().filter((item) => item.productId !== productId);
    saveGuest(items);
    return items;
  });
}

if (typeof window !== "undefined") {
  window.addEventListener(AUTH_EVENT, () => {
    session = undefined;
    inFlight = null;
    publish({ items: [], loading: true, pending: false, error: "" });
    void loadCart().catch(() => {});
  });
  window.addEventListener("storage", (event) => {
    if (event.key === "token" || event.key === null) {
      session = undefined;
      inFlight = null;
      publish({ items: [], loading: true, pending: false, error: "" });
      void loadCart().catch(() => {});
    } else if (!getToken() && event.key === GUEST_KEY) {
      void loadCart().catch(() => {});
    }
  });
}
