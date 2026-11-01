import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AUTH_EVENT, getToken, getUser } from "../utils/auth.js";
import { getApiError } from "../utils/api.js";
import { fetchBuyerOrders } from "../utils/orders.js";
import { fetchProductReviews, eligibleReviewOrders } from "../utils/reviews.js";

function subscribe(callback) {
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => { window.removeEventListener(AUTH_EVENT, callback); window.removeEventListener("storage", callback); };
}

export default function useReviews(productId, onSummary) {
  const token = useSyncExternalStore(subscribe, getToken, () => "");
  const key = `${token}:${productId}`;
  const request = useRef(0);
  const controller = useRef(null);
  const [state, setState] = useState({ key: "", loading: true });
  const load = useCallback(async () => {
    const sequence = ++request.current;
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    const user = getUser();
    const buyer = !!token && (!user?.role || user.role === "buyer");
    const [publicResult, orderResult] = await Promise.allSettled([
      fetchProductReviews(productId, { signal: abort.signal }),
      buyer ? fetchBuyerOrders({ signal: abort.signal }) : Promise.resolve([]),
    ]);
    if (abort.signal.aborted || sequence !== request.current || token !== getToken()) return;
    const reviews = publicResult.status === "fulfilled" ? publicResult.value.reviews : [];
    const orders = orderResult.status === "fulfilled" ? orderResult.value : [];
    setState({ key, loading: false, reviews,
      product: publicResult.status === "fulfilled" ? publicResult.value.product : null,
      eligible: eligibleReviewOrders(orders, productId, reviews, user?.id || user?._id),
      error: publicResult.status === "rejected" ? getApiError(publicResult.reason, publicResult.reason.message) : "",
      eligibilityError: orderResult.status === "rejected" ? getApiError(orderResult.reason, orderResult.reason.message) : "",
      buyer,
    });
    if (publicResult.status === "fulfilled") onSummary?.(publicResult.value.product);
  }, [productId, token, key, onSummary]);
  const refresh = useCallback(async () => {
    setState({ key, loading: true });
    await load();
  }, [key, load]);
  useEffect(() => {
    // This synchronizes API responses; state updates happen after the requests.
    // oxlint-disable-next-line react/set-state-in-effect
    void load();
    return () => { request.current += 1; controller.current?.abort(); };
  }, [load]);
  return { ...(state.key === key ? state : { loading: true }), refresh, token };
}
