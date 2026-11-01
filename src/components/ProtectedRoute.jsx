import { useSyncExternalStore } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AUTH_EVENT, getToken } from "../utils/auth";

function subscribe(callback) {
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export default function ProtectedRoute({ children }) {
  const token = useSyncExternalStore(subscribe, getToken, () => "");
  const location = useLocation();
  return token ? children : <Navigate to="/login" replace state={{
    from: `${location.pathname}${location.search}${location.hash}`,
  }} />;
}
