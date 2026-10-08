import api from "./api";

export const getCart = async () => {
  const response = await api.get("/cart");
  return response.data;
};

export const addToCart = async (cartData) => {
  const response = await api.post("/cart", cartData);
  return response.data;
};

export const updateCartItem = async (id, cartData) => {
  const response = await api.put(`/cart/${id}`, cartData);
  return response.data;
};

export const removeFromCart = async (id) => {
  const response = await api.delete(`/cart/${id}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete("/cart");
  return response.data;
};