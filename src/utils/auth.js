export const AUTH_EVENT = "authUpdated";

export const getToken = () => localStorage.getItem("token") || "";

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("rememberMe");
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function saveSession(data) {
  const token = data?.token || data?.accessToken || data?.access_token ||
    data?.data?.token || data?.data?.accessToken || data?.data?.access_token;
  if (typeof token !== "string" || !token.trim()) {
    throw new Error("The server did not return a valid login token. Please try again.");
  }
  const user = data.user || data.data?.user;
  localStorage.setItem("token", token.trim());
  if (user) localStorage.setItem("user", JSON.stringify(user));
  else localStorage.removeItem("user");
  window.dispatchEvent(new Event(AUTH_EVENT));
}
