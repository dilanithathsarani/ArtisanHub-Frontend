import { useEffect, useSyncExternalStore } from "react";
import { getWishlistSnapshot, loadWishlist, subscribeWishlist } from "../utils/wishlist.js";

export default function useWishlist() {
  const wishlist = useSyncExternalStore(subscribeWishlist, getWishlistSnapshot);
  useEffect(() => { void loadWishlist().catch(() => {}); }, []);
  return { ...wishlist, retry: () => loadWishlist({ force: true }) };
}
