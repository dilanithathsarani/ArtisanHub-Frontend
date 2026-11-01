import api from "./api.js";
import { getToken, getUser } from "./auth.js";
import { fetchBuyerOrder } from "./orders.js";

const idOf = (value) => typeof value === "string" ? value : value?._id || value?.id;

export function validateReview({ rating, comment, orderId }) {
  const errors = {};
  if (!orderId) errors.orderId = "Choose a delivered order.";
  if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) errors.rating = "Choose a whole-number rating from 1 to 5.";
  const length = typeof comment === "string" ? comment.trim().length : 0;
  if (length < 5 || length > 1000) errors.comment = "Write a review containing 5 to 1,000 characters.";
  return errors;
}

export function eligibleReviewOrders(orders, productId, reviews = [], buyerId) {
  return orders.filter((order) => order.orderStatus === "delivered" &&
    order.items.some((item) => idOf(item.product) === productId) &&
    !reviews.some((review) => idOf(review.buyer) === buyerId && idOf(review.order) === order._id));
}

export function normalizeReview(review) {
  if (!review?._id || !Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5 || typeof review.comment !== "string") throw new Error("Invalid review received from the server.");
  return review;
}

export async function fetchProductReviews(productId, { signal } = {}) {
  const { data } = await api.get(`/reviews/product/${encodeURIComponent(productId)}`, { signal });
  if (!Array.isArray(data?.reviews) || data.product?._id !== productId ||
      typeof data.product.averageRating !== "number" || typeof data.product.reviewCount !== "number") throw new Error("Invalid reviews response received from the server.");
  return { product: data.product, reviews: data.reviews.map(normalizeReview).filter((review) => review.isVisible !== false) };
}

const pending = new Set();
export async function submitReview(productId, fields) {
  const token = getToken();
  if (!token) throw new Error("Please sign in to write a review.");
  if (getUser()?.role && getUser().role !== "buyer") throw new Error("Only buyers can write product reviews.");
  if (Object.keys(validateReview(fields)).length) throw new Error("Please correct the highlighted review fields.");
  const key = `${token}:${productId}:${fields.orderId}`;
  if (pending.has(key)) throw new Error("This review is already being submitted.");
  pending.add(key);
  const checkSession = () => { if (getToken() !== token) throw new Error("Your session changed. Please try again after signing in."); };
  try {
    const order = await fetchBuyerOrder(fields.orderId);
    checkSession();
    if (!eligibleReviewOrders([order], productId).length) throw new Error("You can only review products from your delivered orders.");
    const { data } = await api.post("/reviews", { productId, orderId: fields.orderId,
      rating: Number(fields.rating), comment: fields.comment.trim() });
    checkSession();
    if (data?.success !== true) throw new Error("Review submission was not confirmed. Refresh reviews before trying again.");
    return normalizeReview(data.review);
  } finally { pending.delete(key); }
}
