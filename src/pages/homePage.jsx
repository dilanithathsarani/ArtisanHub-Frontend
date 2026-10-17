
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiUrl =
          import.meta.env.VITE_API_URL || "http://localhost:5000/api";

        const response = await axios.get(`${apiUrl}/products`);
        const result = response.data;

        const productList = Array.isArray(result)
          ? result
          : result.products || result.data?.products || result.data || [];

        setProducts(Array.isArray(productList) ? productList : []);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error(
          error.response?.data?.message || "Unable to load products."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-[#fffdf9] text-stone-800">
      {/* Hero Section */}
      <section className="flex min-h-[460px] items-center bg-[#f4eadb] px-6 py-16 sm:px-10 lg:px-[8%]">
        <div className="max-w-2xl">
          <p className="text-xs font-bold tracking-[0.25em] text-[#94633d]">
            HANDMADE WITH LOVE
          </p>

          <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Discover the Beauty of
            <span className="block text-[#a56d42]">
              Handmade Crafts
            </span>
          </h1>

          <p className="mt-5 max-w-xl leading-8 text-stone-600">
            Explore unique handmade creations from talented local artisans.
            Find something special for yourself or someone you love.
          </p>

          <a
            href="#products"
            className="mt-7 inline-block rounded-md bg-[#8b5e3c] px-6 py-3 font-semibold text-white transition hover:bg-[#70472c]"
          >
            Explore Products
          </a>
        </div>
      </section>

      {/* Products Section */}
      <section
        id="products"
        className="mx-auto max-w-7xl px-6 py-16 sm:px-10"
      >
        <div className="mb-10 text-center">
          <p className="text-xs font-bold tracking-[0.25em] text-[#94633d]">
            OUR COLLECTION
          </p>

          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Discover Unique Crafts
          </h2>

          <p className="mt-3 text-stone-500">
            Handmade creations, made with care.
          </p>
        </div>

        {loading && (
          <p className="py-10 text-center text-stone-500">
            Loading products...
          </p>
        )}

        {!loading && products.length === 0 && (
          <p className="py-10 text-center text-stone-500">
            No products available yet.
          </p>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => {
              const image =
                product.images?.[0]?.url ||
                product.image?.url ||
                product.image;

              return (
                <article
                  key={product._id || product.id || product.sku || index}
                  className="overflow-hidden rounded-xl border border-stone-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={product.name || product.title || "Handmade craft"}
                      className="h-56 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-56 items-center justify-center bg-[#f1e8dc] text-stone-500">
                      Handmade Craft
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="text-lg font-semibold">
                      {product.name || product.title || "Untitled Product"}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-500">
                      {product.description || "A unique handmade creation."}
                    </p>

                    <p className="mt-4 text-lg font-bold text-[#8b5e3c]">
                      LKR{" "}
                      {Number(product.price || 0).toLocaleString("en-LK")}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default HomePage;
