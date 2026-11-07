import axios from "axios";
import { clearSession, getToken } from "./auth.js";

export const apiUrl = (import.meta.env?.VITE_API_URL || "http://localhost:5000/api")
  .trim().replace(/\/+$/, "");

export function getApiError(error, fallback = "Something went wrong. Please try again.") {
  const data = error.response?.data;
  if (typeof data?.message === "string" && data.message.trim()) return data.message;
  if (typeof data?.error === "string" && data.error.trim()) return data.error;
  if (error.code === "ECONNABORTED") return "The request timed out. Please try again.";
  if (error.request && !error.response) return "Unable to reach ArtisanHub. Check your connection and try again.";
  return fallback;
}

const api = axios.create({ baseURL: apiUrl, timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = getToken();
  // Profile reads and updates are protected even though they live under /auth.
  const path = config.url.split(/[?#]/)[0];
  const publicAuthRequest = /^\/auth\/(?:login|register|forgotPassword|forgot-password|reset-password\/[^/]+|resetPassword\/[^/]+)\/?$/.test(path);
  if (token && !publicAuthRequest) {
    config.headers.set("Authorization", `Bearer ${token}`);
    config.sessionToken = token;
  }
  return config;
});

api.interceptors.response.use((response) => response, (error) => {
  // A late response from a previous login must not invalidate a new session.
  if (error.response?.status === 401 && error.config?.sessionToken &&
      error.config.sessionToken === getToken()) clearSession();
  error.userMessage = getApiError(error);
  return Promise.reject(error);
});

export default api;
