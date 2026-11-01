import api from "./api.js";
import { getToken } from "./auth.js";

export const DISTRICTS = ["Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya", "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee", "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", "Monaragala", "Ratnapura", "Kegalle"];
export const ADDRESS_FIELDS = [
  { name: "fullName", label: "Full name", autoComplete: "name" },
  { name: "phone", label: "Phone number", type: "tel", autoComplete: "tel" },
  { name: "addressLine1", label: "Street address", autoComplete: "address-line1" },
  { name: "addressLine2", label: "Apartment, suite, or landmark (optional)", autoComplete: "address-line2" },
  { name: "city", label: "City / town", autoComplete: "address-level2" },
  { name: "district", label: "District", autoComplete: "address-level1" },
  { name: "postalCode", label: "Postal code", autoComplete: "postal-code" },
];

export function validateAddress(address = {}) {
  const errors = {};
  for (const { name, label } of ADDRESS_FIELDS) {
    if (name !== "addressLine2" && !String(address[name] || "").trim()) errors[name] = `${label} is required.`;
  }
  const phone = String(address.phone || "").replace(/[\s()-]/g, "");
  if (phone && !/^(?:0\d{9}|\+94\d{9})$/.test(phone)) errors.phone = "Enter a Sri Lankan number such as 0771234567 or +94771234567.";
  if (address.postalCode && !/^\d{5}$/.test(String(address.postalCode).trim())) errors.postalCode = "Enter a five-digit postal code.";
  if (address.district && !DISTRICTS.includes(address.district)) errors.district = "Choose a Sri Lankan district.";
  return errors;
}

export function getAddressErrors(error) {
  const result = {};
  const data = error.response?.data;
  for (const { name } of ADDRESS_FIELDS) {
    const field = data?.errors?.[name] || data?.errors?.[`shippingAddress.${name}`];
    if (typeof field === "string") result[name] = field;
    else if (typeof field?.message === "string") result[name] = field.message;
    if (data?.message === `${name} is required`) result[name] = `${ADDRESS_FIELDS.find((item) => item.name === name).label} is required.`;
  }
  return result;
}

export function normalizeReceipt(data) {
  if (data?.success !== true || !Array.isArray(data.orders) || data.orders.length === 0 ||
      data.orders.some((order) => !order._id || !order.orderId || !Array.isArray(order.items) ||
        order.items.length === 0 || order.items.some((item) => !item.name ||
          !Number.isInteger(item.quantity) || item.quantity < 1 ||
          ![item.price, item.subtotal].every((amount) => typeof amount === "number" && Number.isFinite(amount) && amount >= 0)) || !order.shippingAddress ||
        ![order.subtotal, order.deliveryFee, order.totalAmount].every((amount) => typeof amount === "number" && Number.isFinite(amount) && amount >= 0))) {
    throw new Error("Order confirmation was incomplete. Check My Orders before trying again.");
  }
  return { orders: data.orders,
    totalAmount: data.orders.reduce((sum, order) => sum + order.totalAmount, 0),
    subtotal: data.orders.reduce((sum, order) => sum + order.subtotal, 0),
    deliveryFee: data.orders.reduce((sum, order) => sum + order.deliveryFee, 0) };
}

const pending = new Set();
const uncertain = new Set();
export const hasUncertainOrder = () => uncertain.has(getToken());
export const acknowledgeOrderCheck = () => uncertain.delete(getToken());

export async function placeOrder(address) {
  const token = getToken();
  if (!token) throw new Error("Please sign in before placing your order.");
  if (Object.keys(validateAddress(address)).length) throw new Error("Please correct the delivery details.");
  if (pending.has(token)) throw new Error("An order request is already in progress.");
  if (uncertain.has(token)) throw new Error("Check My Orders before placing another order.");
  pending.add(token);
  let responseReceived = false;
  try {
    const shippingAddress = Object.fromEntries(ADDRESS_FIELDS.map(({ name }) => [name, String(address[name] || "").trim()]));
    shippingAddress.country = "Sri Lanka";
    const response = await api.post("/orders", { shippingAddress, paymentMethod: "cash-on-delivery" });
    responseReceived = true;
    if (getToken() !== token) throw new Error("Your session changed. Check your order history after signing in.");
    return normalizeReceipt(response.data);
  } catch (error) {
    // A timeout, server error, or malformed confirmation may follow a committed
    // transaction. Do not retry automatically without backend idempotency.
    if (responseReceived || !error.response || error.response.status >= 500) {
      uncertain.add(token);
      error.orderUncertain = true;
    }
    throw error;
  } finally { pending.delete(token); }
}
