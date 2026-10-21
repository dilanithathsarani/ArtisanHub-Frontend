import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../components/navBar";
import Footer from "../components/footer";

function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const apiUrl =
          import.meta.env.VITE_API_URL || "http://localhost:5000/api";

        const response = await axios.get(`${apiUrl}/products/${id}`);
        const result = response.data;

        const productData =
          result.product || result.data?.product || result.data || result;

        setProduct(productData);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error(
          error.response?.data?.message || "Unable to load product details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const image =
    product?.images?.[0]?.url ||
    product?.image?.url ||
    product?.image ||
    product?.media?.[0]?.url ||
    "";

  const name = product?.name || product?.title || "Handmade Craft";

  const price = Number(product?.price || 0);

  return (
    <main className="min-h-screen bg-[#fffdf9] text-stone-800">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:py-16">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#8b5e3c] transition hover:text-[#70472c]"
        >
          ← Back to shopping
        </Link>

        {loading ? (
          <div className="py-24 text-center text-stone-500">
            Loading product details...
          </div>
        ) : !product ? (
          <div className="py-24 text-center">
            <h1 className="text-2xl font-bold">Product not found</h1>
            <p className="mt-3 text-stone-500">
              This product may no longer be available.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-lg bg-[#8b5e3c] px-6 py-3 text-white hover:bg-[#70472c]"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="flex min-h-[350px] items-center justify-center overflow-hidden rounded-2xl bg-[#f4eadb] sm:min-h-[480px]">
              {image ? (
                <img
                  src={image}
                  alt={name}
                  className="h-full max-h-[600px] w-full object-cover"
                />
              ) : (
                <p className="text-stone-500">Image unavailable</p>
              )}
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#94633d]">
                HANDMADE COLLECTION
              </p>

              <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
                {name}
              </h1>

              <p className="mt-5 text-2xl font-bold text-[#8b5e3c]">
                LKR {price.toLocaleString("en-LK")}
              </p>

              <div className="mt-8 border-y border-stone-200 py-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide">
                  Product description
                </h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-stone-600">
                  {product.description ||
                    "A unique handmade creation crafted with care."}
                </p>
              </div>

              <div className="mt-6">
                <p className="text-sm text-stone-600">
                  Availability:{" "}
                  <span className="font-semibold text-stone-800">
                    {product.stock > 0
                      ? `${product.stock} available`
                      : product.stock === 0
                        ? "Out of stock"
                        : "Contact seller"}
                  </span>
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="flex items-center rounded-lg border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="px-4 py-3 text-lg disabled:opacity-40"
                  >
                    −
                  </button>

                  <span className="min-w-10 text-center">{quantity}</span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) =>
                        product.stock > 0
                          ? Math.min(product.stock, current + 1)
                          : current + 1
                      )
                    }
                    disabled={
                      product.stock === 0 ||
                      (Number.isFinite(Number(product.stock)) &&
                        product.stock > 0 &&
                        quantity >= product.stock)
                    }
                    aria-label="Increase quantity"
                    className="px-4 py-3 text-lg disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  disabled={product.stock === 0}
                  onClick={() =>
                    toast("Cart functionality will be connected in the next step.")
                  }
                  className="flex-1 rounded-lg bg-[#8b5e3c] px-6 py-3 font-semibold text-white transition hover:bg-[#70472c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add to cart
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

export default ProductDetailsPage;