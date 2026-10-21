import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import Navbar from "../components/navBar";
import Footer from "../components/footer";
import { formatCurrency } from "../utils/formatCurrency";

const CART_KEY = "artisanhub-cart";

const CartPage = () => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem(CART_KEY) || "[]"
      );

      return Array.isArray(savedCart) ? savedCart : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  }, [cart]);

  const updateQuantity = (productId, change) => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item.productId !== productId) {
          return item;
        }

        const currentQuantity = Number(item.quantity) || 1;
        const stock = Number(item.stock);

        const newQuantity = Math.max(
          1,
          currentQuantity + change
        );

        if (change > 0 && stock > 0 && newQuantity > stock) {
          return item;
        }

        return {
          ...item,
          quantity: newQuantity,
        };
      })
    );
  };

  const removeItem = (productId) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.productId !== productId
      )
    );
  };

  const totalItems = cart.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0
  );

  const subtotal = cart.reduce(
    (total, item) =>
      total +
      (Number(item.price) || 0) *
        (Number(item.quantity) || 0),
    0
  );

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#faf7f2] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#8b5e3c] transition hover:text-[#70472c]"
          >
            <ArrowLeft size={17} />
            Continue Shopping
          </Link>

          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#a56d42]">
              Your Selections
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#493324] sm:text-4xl">
              Shopping Cart
            </h1>

            <p className="mt-2 text-stone-500">
              Handmade treasures, carefully chosen for you.
            </p>
          </div>

          {cart.length === 0 ? (
            <div className="rounded-3xl border border-[#eadfd3] bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f4eadb] text-[#8b5e3c]">
                <ShoppingBag size={34} strokeWidth={1.5} />
              </div>

              <h2 className="mt-6 text-2xl font-semibold text-[#493324]">
                Your cart is waiting for something special
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-500">
                Explore unique handmade crafts created by local
                artisans and find a piece that tells your story.
              </p>

              <Link
                to="/"
                className="mt-7 inline-flex items-center justify-center rounded-full bg-[#8b5e3c] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#70472c]"
              >
                Explore Crafts
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_350px]">
              <section className="space-y-4">
                {cart.map((item) => (
                  <article
                    key={item.productId}
                    className="flex flex-col gap-4 rounded-2xl border border-[#eadfd3] bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name || "Handmade craft"}
                        className="h-36 w-full rounded-xl bg-[#f4eadb] object-cover sm:h-28 sm:w-28"
                      />
                    ) : (
                      <div className="flex h-36 w-full items-center justify-center rounded-xl bg-[#f4eadb] text-[#8b5e3c] sm:h-28 sm:w-28">
                        <ShoppingBag size={28} />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-lg font-semibold text-[#493324]">
                        {item.name || "Handmade Craft"}
                      </h2>

                      <p className="mt-1 text-sm text-stone-500">
                        {formatCurrency(item.price)} each
                      </p>

                      <p className="mt-2 font-bold text-[#8b5e3c]">
                        {formatCurrency(
                          (Number(item.price) || 0) *
                            (Number(item.quantity) || 0)
                        )}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <div className="flex items-center rounded-full border border-[#eadfd3]">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, -1)
                          }
                          disabled={Number(item.quantity) <= 1}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="p-2 text-[#70472c] transition hover:bg-[#f4eadb] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Minus size={15} />
                        </button>

                        <span className="min-w-8 text-center text-sm font-semibold text-stone-700">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, 1)
                          }
                          disabled={
                            Number(item.stock) > 0 &&
                            Number(item.quantity) >=
                              Number(item.stock)
                          }
                          aria-label={`Increase quantity of ${item.name}`}
                          className="p-2 text-[#70472c] transition hover:bg-[#f4eadb] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus size={15} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="inline-flex items-center gap-1.5 text-sm text-red-600 transition hover:text-red-800"
                      >
                        <Trash2 size={15} />
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </section>

              <aside className="rounded-2xl border border-[#eadfd3] bg-white p-6 shadow-sm lg:sticky lg:top-32">
                <h2 className="text-xl font-bold text-[#493324]">
                  Order Summary
                </h2>

                <div className="mt-6 flex justify-between gap-4 text-sm text-stone-600">
                  <span>Subtotal ({totalItems} items)</span>

                  <span className="font-medium text-stone-800">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <div className="mt-4 flex justify-between gap-4 border-t border-[#eadfd3] pt-4">
                  <span className="font-semibold text-[#493324]">
                    Total
                  </span>

                  <span className="text-xl font-bold text-[#8b5e3c]">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <p className="mt-3 text-xs leading-5 text-stone-400">
                  Shipping costs, if applicable, will be calculated
                  at checkout.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Checkout functionality will be connected next."
                    )
                  }
                  className="mt-6 w-full rounded-full bg-[#8b5e3c] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#70472c]"
                >
                  Proceed to Checkout
                </button>

                <Link
                  to="/"
                  className="mt-3 flex w-full items-center justify-center rounded-full border border-[#d9c7b4] px-5 py-3 text-sm font-semibold text-[#70472c] transition hover:bg-[#f4eadb]"
                >
                  Continue Shopping
                </Link>
              </aside>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default CartPage;