import axios from "axios";
import toast from "react-hot-toast";

const WISHLIST_KEY = "artisanhub-wishlist";
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getWishlist = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

export const isInWishlist = (productId) => {
  if (!productId) return false;
  const list = getWishlist();
  return list.some((item) => (item._id || item.productId || item.id) === productId);
};

export const toggleWishlistItem = async (product) => {
  const prodId = product._id || product.productId || product.id;
  if (!prodId) return false;

  const currentList = getWishlist();
  const exists = currentList.some((item) => (item._id || item.productId || item.id) === prodId);

  let updatedList;
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : null;

  if (exists) {
    updatedList = currentList.filter(
      (item) => (item._id || item.productId || item.id) !== prodId
    );
    toast.success("Removed from your saved creations");

    if (headers) {
      try {
        await axios.delete(`${apiUrl}/wishlist/${prodId}`, { headers });
      } catch {
        // ignore backend sync error
      }
    }
  } else {
    const itemToSave = {
      _id: prodId,
      productId: product.productId || prodId,
      name: product.name || product.title || "Handmade Craft",
      price: product.price,
      images: Array.isArray(product.images) ? product.images : [product.image].filter(Boolean),
      image: typeof product.images?.[0] === "string" ? product.images[0] : product.image || "",
      category: product.category,
      description: product.description,
    };
    updatedList = [...currentList, itemToSave];
    toast.success("Saved to your wishlist! ❤️");

    if (headers) {
      try {
        await axios.post(`${apiUrl}/wishlist`, { productId: prodId }, { headers });
      } catch {
        // ignore backend sync error
      }
    }
  }

  localStorage.setItem(WISHLIST_KEY, JSON.stringify(updatedList));
  window.dispatchEvent(new Event("wishlistUpdated"));
  return !exists;
};
