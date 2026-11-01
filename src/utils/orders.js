import api from "./api.js";
import { getToken, getUser } from "./auth.js";

export const ORDER_STAGES = ["placed", "confirmed", "processing", "shipped", "delivered"];
export const ORDER_FILTERS = ["all", ...ORDER_STAGES, "cancelled", "failed"];
export const statusLabel = (status) => ({ placed: "Placed", confirmed: "Confirmed", processing: "Processing", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled", failed: "Failed" })[status] || "Unknown status";

export function trackingStages(status) {
  const current = ORDER_STAGES.indexOf(status);
  return ORDER_STAGES.map((stage, index) => ({ stage, complete: current >= index,
    current: current === index }));
}

export function canCancelOrder(order) {
  return order?.canCancel !== false && ["placed", "confirmed"].includes(order?.orderStatus);
}

export function normalizeOrder(order) {
  if (!order || typeof order._id !== "string" || !order.orderId || !Array.isArray(order.items) ||
      order.items.some((item) => !item || typeof item.name !== "string" || !Number.isInteger(item.quantity) || item.quantity < 1) ||
      typeof order.orderStatus !== "string") throw new Error("Invalid order data received from the server.");
  return order;
}

function checkSession(token) {
  if (!token || token !== getToken()) throw new Error("Your session changed. Please sign in again.");
}

function buyerToken() {
  const token = getToken();
  checkSession(token);
  if (getUser()?.role && getUser().role !== "buyer") throw new Error("Order history is available to buyer accounts only.");
  return token;
}

export async function fetchBuyerOrders({ signal } = {}) {
  const token = buyerToken();
  const { data } = await api.get("/orders/mine", { signal });
  checkSession(token);
  if (!Array.isArray(data?.orders)) throw new Error("Invalid order history received from the server.");
  return data.orders.map(normalizeOrder).sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));
}

export async function fetchBuyerOrder(id, { signal } = {}) {
  const token = buyerToken();
  const { data } = await api.get(`/orders/${encodeURIComponent(id)}`, { signal });
  checkSession(token);
  const order = normalizeOrder(data?.order);
  // The detail API is also available to sellers/admins. Buyer views must not
  // accidentally show a different account's order after a session change.
  const userId = getUser()?.id || getUser()?._id;
  const buyerId = typeof order.buyer === "object" ? order.buyer?._id : order.buyer;
  if (userId && buyerId && String(userId) !== String(buyerId)) throw new Error("You do not have permission to view this order.");
  return order;
}

const cancellations = new Set();
export async function cancelBuyerOrder(id) {
  const token = buyerToken();
  const key = `${token}:${id}`;
  if (cancellations.has(key)) throw new Error("Cancellation is already in progress.");
  cancellations.add(key);
  try {
    const current = await fetchBuyerOrder(id);
    checkSession(token);
    if (!canCancelOrder(current)) throw new Error(`This ${statusLabel(current.orderStatus).toLowerCase()} order cannot be cancelled. Refresh to see its latest status.`);
    const { data } = await api.put(`/orders/${encodeURIComponent(current._id)}/cancel`, {});
    checkSession(token);
    const order = normalizeOrder(data?.order);
    if (order.orderStatus !== "cancelled") throw new Error("Cancellation was not confirmed. Refresh the order before trying again.");
    return order;
  } finally { cancellations.delete(key); }
}

export function pageOrders(orders, filter = "all", page = 1, pageSize = 5) {
  const filtered = orders.filter((order) => filter === "all" || order.orderStatus === filter);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.max(1, Math.min(Math.trunc(Number(page)) || 1, pages));
  return { items: filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    count: filtered.length, pages, page: currentPage };
}

export function formatOrderDate(value) {
  const date = new Date(value);
  return value && Number.isFinite(date.getTime()) ? date.toLocaleDateString("en-LK", {
    day: "numeric", month: "short", year: "numeric" }) : "Date unavailable";
}
