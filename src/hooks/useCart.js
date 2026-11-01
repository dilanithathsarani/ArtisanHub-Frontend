import { useEffect, useSyncExternalStore } from "react";
import { getCartSnapshot, loadCart, subscribeCart } from "../utils/cart.js";

export default function useCart() {
  const cart = useSyncExternalStore(subscribeCart, getCartSnapshot);
  useEffect(() => { void loadCart().catch(() => {}); }, []);
  return { ...cart, retry: loadCart };
}
