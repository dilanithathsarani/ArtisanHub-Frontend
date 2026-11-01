import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AUTH_EVENT, getToken } from "../utils/auth.js";
import { getApiError } from "../utils/api.js";
import { fetchBuyerOrder, fetchBuyerOrders } from "../utils/orders.js";

function subscribe(callback) {
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => { window.removeEventListener(AUTH_EVENT, callback); window.removeEventListener("storage", callback); };
}

export default function useOrders(id) {
  const token = useSyncExternalStore(subscribe, getToken, () => "");
  const key = `${token}:${id || "history"}`;
  const request = useRef(0);
  const controller = useRef(null);
  const [state, setState] = useState({ key: "", data: null, loading: true, error: "" });

  const load = useCallback(async () => {
    const sequence = ++request.current;
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    try {
      const data = id ? await fetchBuyerOrder(id, { signal: abort.signal }) : await fetchBuyerOrders({ signal: abort.signal });
      if (sequence === request.current && !abort.signal.aborted) setState({ key, data, loading: false, error: "" });
    } catch (failure) {
      if (sequence === request.current && !abort.signal.aborted) setState({ key, data: null, loading: false,
        error: getApiError(failure, failure.message || "Unable to load your orders.") });
    }
  }, [key, id]);

  const refresh = useCallback(async () => {
    setState({ key, data: null, loading: true, error: "" });
    await load();
  }, [key, load]);

  useEffect(() => {
    // State updates in load happen only after awaiting the API response.
    // oxlint-disable-next-line react/set-state-in-effect
    void load();
    return () => { request.current += 1; controller.current?.abort(); };
  }, [load]);

  return { ...(state.key === key ? state : { data: null, loading: true, error: "" }), refresh };
}
