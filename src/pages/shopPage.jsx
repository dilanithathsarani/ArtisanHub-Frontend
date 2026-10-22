import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Navbar from "../components/navBar";
import Footer from "../components/footer";
import ProductCard from "../components/ProductCard";
import { useSearchParams } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();
  const selectedArtisan = searchParams.get("artisan") || "all";
  const [selectedCategory, setSelectedCategory] = useState(
    () => searchParams.get("category") || "All",
  );
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${apiUrl}/products`);
        const data = response.data;

        const productList = Array.isArray(data)
          ? data
          : Array.isArray(data.products)
            ? data.products
            : Array.isArray(data.data)
              ? data.data
              : [];

        setProducts(productList);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load products. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const categoryMap = new Map();

    products.forEach((product) => {
      const category = product.category;

      if (category && typeof category === "object" && category._id) {
        categoryMap.set(category._id, {
          id: category._id,
          name: category.name || category.categoryName || "Category",
        });
      } else if (typeof category === "string" && category.trim()) {
        categoryMap.set(category, {
          id: category,
          name: category,
        });
      }
    });

    return Array.from(categoryMap.values());
  }, [products]);

  const filteredProducts = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    const result = products.filter((product) => {
      const productSellerId =
        typeof product.seller === "object"
          ? product.seller?._id || product.seller?.id
          : product.seller;

      const matchesArtisan =
        selectedArtisan === "all" ||
        String(productSellerId) === String(selectedArtisan);
      const matchesSearch =
        !searchTerm ||
        [product.name, product.description, product.productId]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(searchTerm));

      const categoryId =
        typeof product.category === "object"
          ? product.category?._id || product.category?.id
          : product.category;

      const categoryName =
        typeof product.category === "object"
          ? product.category?.name || product.category?.categoryName
          : product.category;

      const matchesCategory =
        selectedCategory === "all" ||
        String(categoryId) === String(selectedCategory) ||
        String(categoryName).toLowerCase() ===
          String(selectedCategory).toLowerCase();

      const isAvailable =
        product.isActive !== false &&
        (!product.status || product.status === "approved");

      return matchesSearch && matchesCategory && matchesArtisan && isAvailable;
    });

    return result.sort((a, b) => {
      if (sortBy === "price-low") {
        return Number(a.price) - Number(b.price);
      }

      if (sortBy === "price-high") {
        return Number(b.price) - Number(a.price);
      }

      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }

      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    });
  }, [products, search, selectedCategory, selectedArtisan ,sortBy]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSortBy("newest");
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#faf7f2]">
        <section className="relative overflow-hidden bg-[#efe1d0] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#8b5e3c]">
              Thoughtfully handmade
            </p>

            <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight text-[#493324] sm:text-5xl lg:text-6xl">
              Discover crafts with a story.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-stone-600 sm:text-lg">
              Explore unique handmade creations from talented local artisans.
              Find something meaningful, made with care.
            </p>

            <div className="mt-8 flex items-center gap-3 text-sm text-[#70472c]">
              <span className="h-px w-10 bg-[#a56d42]" />
              Made by hand. Chosen by heart.
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#a56d42]">
                The collection
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[#493324]">
                Shop Handmade
              </h2>

              <p className="mt-2 text-sm text-stone-500">
                Find your next favourite handmade piece.
              </p>
            </div>

            <p className="text-sm text-stone-500">
              {loading
                ? "Loading products..."
                : `${filteredProducts.length} ${
                    filteredProducts.length === 1 ? "product" : "products"
                  } found`}
            </p>
          </div>

          <div className="mb-8 rounded-2xl border border-[#eadfd3] bg-white p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px]">
              <div className="relative">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search handmade crafts..."
                  aria-label="Search products"
                  className="w-full rounded-xl border border-[#eadfd3] bg-[#fffdf9] py-3 pl-11 pr-4 text-sm text-stone-700 outline-none transition placeholder:text-stone-400 focus:border-[#a56d42] focus:ring-2 focus:ring-[#a56d42]/10"
                />
              </div>

              <div className="relative">
                <SlidersHorizontal
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b5e3c]"
                />

                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  aria-label="Sort products"
                  className="w-full appearance-none rounded-xl border border-[#eadfd3] bg-[#fffdf9] py-3 pl-11 pr-4 text-sm text-stone-700 outline-none focus:border-[#a56d42]"
                >
                  <option value="newest">Newest first</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>

            {categories.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    selectedCategory === "all"
                      ? "bg-[#8b5e3c] text-white"
                      : "border border-[#eadfd3] bg-white text-stone-600 hover:bg-[#f4eadb]"
                  }`}
                >
                  All Categories
                </button>

                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      selectedCategory === category.id
                        ? "bg-[#8b5e3c] text-white"
                        : "border border-[#eadfd3] bg-white text-stone-600 hover:bg-[#f4eadb]"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}

            {(search || selectedCategory !== "all" || sortBy !== "newest") && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#8b5e3c] hover:text-[#70472c]"
              >
                <X size={15} />
                Clear filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => (
                <div
                  key={index}
                  className="animate-pulse overflow-hidden rounded-2xl border border-[#eadfd3] bg-white"
                >
                  <div className="h-64 bg-[#eee4d8]" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-3/4 rounded bg-[#eee4d8]" />
                    <div className="h-4 w-full rounded bg-[#eee4d8]" />
                    <div className="h-5 w-1/3 rounded bg-[#eee4d8]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-white px-6 py-12 text-center">
              <h3 className="text-xl font-semibold text-[#493324]">
                Something went wrong
              </h3>

              <p className="mt-3 text-sm text-red-600">{error}</p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-6 rounded-full bg-[#8b5e3c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#70472c]"
              >
                Try Again
              </button>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#eadfd3] bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f4eadb] text-[#8b5e3c]">
                <Search size={27} />
              </div>

              <h3 className="mt-5 text-xl font-semibold text-[#493324]">
                No crafts found
              </h3>

              <p className="mt-2 text-sm text-stone-500">
                Try another search or clear your filters to explore all
                available products.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#8b5e3c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#70472c]"
              >
                <X size={16} />
                Clear Filters
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ShopPage;
