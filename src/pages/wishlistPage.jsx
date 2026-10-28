import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Heart, ShoppingBag, Trash2 } from "lucide-react";
import Navbar from "../components/navBar";
import Footer from "../components/footer";
import ProductCard from "../components/ProductCard";
import { getWishlist } from "../utils/wishlist";

const CART_KEY = "artisanhub-cart";
const WISHLIST_KEY = "artisanhub-wishlist";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState(() => getWishlist());

  useEffect(() => {
    const handleUpdate = () => {
      setWishlist(getWishlist());
    };
    window.addEventListener("wishlistUpdated", handleUpdate);
    return () => window.removeEventListener("wishlistUpdated", handleUpdate);
  }, []);

  const handleAddToCart = (product) => {
    try {
      const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      const prodId = product._id || product.productId;
      const existing = cart.find((item) => item.productId === prodId);

      const productImage =
        (typeof product.images?.[0] === "string" ? product.images[0] : null) ||
        product.images?.[0]?.url ||
        product.image ||
        "";

      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          productId: prodId,
          name: product.name,
          price: product.price,
          image: productImage,
          quantity: 1,
        });
      }

      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success(`${product.name} added to cart!`);
    } catch {
      toast.error("Could not add item to cart.");
    }
  };

  const handleAddAllToCart = () => {
    if (wishlist.length === 0) return;

    try {
      const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");

      wishlist.forEach((product) => {
        const prodId = product._id || product.productId;
        const existing = cart.find((item) => item.productId === prodId);
        const productImage =
          (typeof product.images?.[0] === "string" ? product.images[0] : null) ||
          product.images?.[0]?.url ||
          product.image ||
          "";

        if (existing) {
          existing.quantity += 1;
        } else {
          cart.push({
            productId: prodId,
            name: product.name,
            price: product.price,
            image: productImage,
            quantity: 1,
          });
        }
      });

      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("All saved creations added to your cart!");
    } catch {
      toast.error("Could not add items to cart.");
    }
  };

  const handleClearWishlist = () => {
    if (!window.confirm("Are you sure you want to clear your wishlist?")) return;
    localStorage.setItem(WISHLIST_KEY, "[]");
    window.dispatchEvent(new Event("wishlistUpdated"));
    toast.success("Wishlist cleared.");
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#faf7f2] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-stone-500 sm:text-sm">
            <Link to="/" className="transition hover:text-[#8b5e3c]">
              Home
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#8b5e3c]">Wishlist</span>
          </nav>

          {/* Heading Bar */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#a56d42]">
                Your Saved Pieces
              </p>
              <h1 className="mt-1 text-3xl font-extrabold text-[#493324] sm:text-4xl">
                My Wishlist
              </h1>
              <p className="mt-1 text-xs text-stone-500">
                {wishlist.length} handmade {wishlist.length === 1 ? "creation" : "creations"} saved for later
              </p>
            </div>

            {wishlist.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleAddAllToCart}
                  className="inline-flex items-center gap-2 rounded-full bg-[#8b5e3c] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#70472c]"
                >
                  <ShoppingBag size={15} />
                  Add All to Cart
                </button>

                <button
                  type="button"
                  onClick={handleClearWishlist}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-50 hover:text-red-600"
                >
                  <Trash2 size={14} />
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Grid or Empty State */}
          {wishlist.length === 0 ? (
            <div className="rounded-3xl border border-[#eadfd3] bg-white px-6 py-20 text-center shadow-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-500 shadow-sm">
                <Heart size={38} strokeWidth={1.8} />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-[#493324]">Your Wishlist is Empty</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
                Tap the heart icon on any craft to save pieces you adore while browsing our Sri Lankan artisan collections.
              </p>
              <Link
                to="/shop"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#8b5e3c] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#70472c]"
              >
                <ArrowLeft size={16} />
                Explore Handmade Collections
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {wishlist.map((product) => (
                <ProductCard
                  key={product._id || product.productId}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default WishlistPage;
