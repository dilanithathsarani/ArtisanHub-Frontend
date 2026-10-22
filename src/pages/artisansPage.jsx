
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowRight, Palette, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/navBar";
import Footer from "../components/footer";
import ArtisanCard from "../components/ArtisanCard";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ArtisansPage = () => {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArtisans = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${apiUrl}/artisans`);
        const data = response.data;

        const artisanList = Array.isArray(data)
          ? data
          : Array.isArray(data.artisans)
            ? data.artisans
            : Array.isArray(data.data)
              ? data.data
              : [];

        setArtisans(artisanList);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load artisan profiles. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchArtisans();
  }, []);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#faf7f2]">
        <section className="bg-[#eee2d1] px-4 py-16 text-center sm:px-6 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#8b5e3c]">
            Meet the makers
          </p>

          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold leading-tight text-[#493324] sm:text-5xl lg:text-6xl">
            Every craft has a story.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
            Discover the talented artisans who transform creativity,
            tradition, and passion into unique handmade treasures.
          </p>

          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#8b5e3c] px-7 py-3 font-semibold text-white transition hover:bg-[#70472c]"
          >
            Explore Handmade Crafts
            <ArrowRight size={18} />
          </Link>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f0e1d1] text-[#8b5e3c]">
                <Users size={24} />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#a56d42]">
                  Our Community
                </p>
                <h2 className="mt-1 text-2xl font-bold text-[#493324] sm:text-3xl">
                  Meet Our Artisans
                </h2>
              </div>
            </div>

            {!loading && !error && (
              <p className="text-sm text-stone-500">
                {artisans.length}{" "}
                {artisans.length === 1 ? "artisan" : "artisans"} in our
                community
              </p>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <div
                  key={index}
                  className="animate-pulse overflow-hidden rounded-2xl border border-[#eadfd3] bg-white"
                >
                  <div className="h-64 bg-[#eee2d1]" />

                  <div className="space-y-4 p-6">
                    <div className="h-6 w-3/4 rounded bg-[#eee2d1]" />
                    <div className="h-4 w-1/2 rounded bg-[#eee2d1]" />
                    <div className="h-12 rounded bg-[#eee2d1]" />
                    <div className="h-4 w-2/5 rounded bg-[#eee2d1]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-white px-6 py-14 text-center">
              <Palette
                size={42}
                className="mx-auto text-[#8b5e3c]"
              />

              <h3 className="mt-4 text-xl font-semibold text-[#493324]">
                We couldn't load the artisans
              </h3>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-stone-500">
                {error}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-6 rounded-full bg-[#8b5e3c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#70472c]"
              >
                Try Again
              </button>
            </div>
          ) : artisans.length === 0 ? (
            <div className="rounded-2xl border border-[#eadfd3] bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f4eadb] text-[#8b5e3c]">
                <Users size={30} />
              </div>

              <h3 className="mt-5 text-xl font-semibold text-[#493324]">
                Our artisan community is growing
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
                Artisan profiles will appear here as makers join our
                marketplace. In the meantime, explore our handmade
                collections.
              </p>

              <Link
                to="/shop"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#8b5e3c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#70472c]"
              >
                Browse Products
                <ArrowRight size={17} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {artisans.map((artisan, index) => (
                <ArtisanCard
                  key={artisan._id || artisan.id || index}
                  artisan={artisan}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ArtisansPage;
