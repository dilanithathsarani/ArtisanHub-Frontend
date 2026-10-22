
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowRight, Shapes } from "lucide-react";
import Navbar from "../components/navBar";
import Footer from "../components/footer";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${apiUrl}/categories`);

        const data = response.data;
        const categoryList = Array.isArray(data)
          ? data
          : data.categories || data.data || [];

        setCategories(categoryList);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load categories. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#faf7f2]">
        <section className="bg-[#eee2d1] px-4 py-16 text-center sm:py-20">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#8b5e3c]">
            Explore ArtisanHub
          </p>

          <h1 className="text-3xl font-bold text-stone-800 sm:text-5xl">
            Discover by Category
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
            Explore thoughtfully handcrafted treasures, each inspired by
            creativity, tradition, and the hands that make them.
          </p>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-72 animate-pulse rounded-2xl bg-stone-200"
                />
              ))}
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-stone-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-lg bg-[#8b5e3c] px-5 py-2.5 text-white hover:bg-[#70482e]"
              >
                Try Again
              </button>
            </div>
          ) : categories.length === 0 ? (
            <div className="py-16 text-center">
              <Shapes className="mx-auto mb-4 text-[#8b5e3c]" size={42} />
              <h2 className="text-xl font-semibold text-stone-800">
                No categories available yet
              </h2>
              <p className="mt-2 text-stone-500">
                Please check back soon for new handmade collections.
              </p>
              <Link
                to="/shop"
                className="mt-6 inline-flex items-center gap-2 font-semibold text-[#8b5e3c] hover:underline"
              >
                Browse all products <ArrowRight size={17} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const id = category._id || category.id;
                const name =
                  category.name ||
                  category.categoryName ||
                  "Handmade Collection";
                const image =
                  category.image?.url ||
                  category.image ||
                  category.imageUrl ||
                  category.thumbnail ||
                  "";

                return (
                  <Link
                    key={id || name}
                    to={`/shop?category=${encodeURIComponent(id || name)}`}
                    className="group relative flex min-h-72 overflow-hidden rounded-2xl bg-[#e8d8c5] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={name}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-[#e8d8c5] via-[#d8bda1] to-[#b98d6b]">
                        <Shapes
                          size={70}
                          strokeWidth={1}
                          className="text-white/80"
                        />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-transparent" />

                    <div className="relative mt-auto flex w-full items-end justify-between gap-4 p-6">
                      <div>
                        <h2 className="text-2xl font-semibold text-white">
                          {name}
                        </h2>
                        <p className="mt-2 text-sm text-white/85">
                          Explore the collection
                        </p>
                      </div>

                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#8b5e3c] transition group-hover:bg-[#8b5e3c] group-hover:text-white">
                        <ArrowRight size={20} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-[#8b5e3c] px-7 py-3 font-semibold text-white transition hover:bg-[#70482e]"
            >
              Explore All Products <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default CategoriesPage;
