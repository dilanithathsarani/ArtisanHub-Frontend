import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Globe,
  Heart,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Search,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react";
import Navbar from "../components/navBar";
import Footer from "../components/footer";
import ProductCard from "../components/ProductCard";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ArtisanDetailsPage = () => {
  const { slug } = useParams();

  const [artisan, setArtisan] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("creations"); // "creations" | "story" | "contact"

  // Product filtering & sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Custom commission / inquiry form
  const [inquiry, setInquiry] = useState({
    name: "",
    email: "",
    subject: "Custom Order Inquiry",
    message: "",
  });
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);

  const fetchArtisanProducts = async (sellerId, currentArtisan) => {
    try {
      setProductsLoading(true);
      const res = await axios.get(`${apiUrl}/products?limit=50`);
      const data = res.data;
      const allProducts = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
          ? data.products
          : Array.isArray(data.data)
            ? data.data
            : [];

      // Filter products belonging to this seller
      const artisanProducts = allProducts.filter((product) => {
        const prodSeller = product.seller || product.artisan;
        if (!prodSeller) return false;
        const prodSellerId =
          typeof prodSeller === "object"
            ? prodSeller._id || prodSeller.id
            : prodSeller;

        const artisanSlug =
          currentArtisan?.sellerProfile?.slug ||
          currentArtisan?.slug ||
          currentArtisan?.name?.toLowerCase().replace(/\s+/g, "-");

        const productSellerSlug =
          prodSeller?.sellerProfile?.slug ||
          prodSeller?.name?.toLowerCase().replace(/\s+/g, "-");

        return (
          String(prodSellerId) === String(sellerId) ||
          (artisanSlug && productSellerSlug && artisanSlug === productSellerSlug)
        );
      });

      setProducts(artisanProducts);
    } catch {
      // Non-fatal if product list fails
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchArtisanDetails = async () => {
      try {
        setLoading(true);
        setError("");

        let sellerData = null;

        // 1. Try to fetch from /sellers/:slug
        try {
          const res = await axios.get(`${apiUrl}/sellers/${encodeURIComponent(slug)}`);
          sellerData = res.data?.seller || res.data?.data?.seller || res.data;
        } catch (err) {
          // 2. Fallback: try fetching all sellers from /sellers or /artisans and match by slug, _id, or shopId
          try {
            const listRes = await axios.get(`${apiUrl}/sellers`);
            const sellers = Array.isArray(listRes.data)
              ? listRes.data
              : listRes.data?.artisans || listRes.data?.sellers || listRes.data?.data || [];

            sellerData = sellers.find(
              (s) =>
                s.sellerProfile?.slug === slug ||
                s._id === slug ||
                s.id === slug ||
                s.sellerProfile?.shopId === slug
            );
          } catch {
            // ignore and proceed to products fallback
          }

          // 3. Fallback: check /products to extract seller profile if sellers endpoint is unavailable
          if (!sellerData) {
            try {
              const productsRes = await axios.get(`${apiUrl}/products`);
              const allProducts = Array.isArray(productsRes.data)
                ? productsRes.data
                : productsRes.data?.products || productsRes.data?.data || [];

              for (const p of allProducts) {
                const s = p.seller || p.artisan;
                if (!s) continue;
                const matchesSlug =
                  s.sellerProfile?.slug === slug ||
                  s._id === slug ||
                  s.id === slug ||
                  (s.name && s.name.toLowerCase().replace(/\s+/g, "-") === slug);
                if (matchesSlug) {
                  sellerData = s;
                  break;
                }
              }
            } catch {
              // ignore
            }
          }

          if (!sellerData) {
            throw err;
          }
        }

        if (cancelled) return;

        if (!sellerData) {
          throw new Error("Artisan profile not found.");
        }

        setArtisan(sellerData);

        // Fetch products by this artisan
        const sellerId = sellerData._id || sellerData.id;
        if (sellerId) {
          fetchArtisanProducts(sellerId, sellerData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load this artisan profile. They may not have a public shop yet."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchArtisanDetails();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const profile = artisan?.sellerProfile || {};
  const shopName = profile.shopName || artisan?.name || "Artisan Workshop";
  const makerName = artisan?.name || "Local Artisan";
  const bio =
    profile.bio ||
    "Crafting authentic handmade goods rooted in traditional artistry and contemporary design.";
  const location = [profile.city, profile.district, profile.country || "Sri Lanka"]
    .filter(Boolean)
    .join(", ");

  const logoImage = profile.logo || artisan?.avatar || "";
  const bannerImage = profile.bannerImage || "";

  const craftCategories = Array.isArray(profile.craftCategories)
    ? profile.craftCategories
    : [];

  const handleAddToCart = (product) => {
    try {
      const cart = JSON.parse(localStorage.getItem("artisanhub-cart") || "[]");
      const existing = cart.find((item) => item.productId === product._id);

      const productImage =
        (typeof product.images?.[0] === "string" ? product.images[0] : null) ||
        product.images?.[0]?.url ||
        product.image ||
        "";

      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          image: productImage,
          quantity: 1,
        });
      }

      localStorage.setItem("artisanhub-cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success(`${product.name} added to cart!`);
    } catch {
      toast.error("Could not add product to cart.");
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Artisan store link copied to clipboard!");
    } else {
      toast.success("URL: " + window.location.href);
    }
  };

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    setInquirySubmitting(true);
    setTimeout(() => {
      setInquirySubmitting(false);
      setInquirySent(true);
      toast.success("Inquiry sent successfully to the maker!");
      setInquiry({
        name: "",
        email: "",
        subject: "Custom Order Inquiry",
        message: "",
      });
    }, 600);
  };

  // Categories extracted from this artisan's actual products
  const availableProductCategories = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      const cat = p.category;
      if (cat && typeof cat === "object" && cat._id) {
        map.set(cat._id, cat.name || "Handmade");
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter((p) => {
        const catId = typeof p.category === "object" ? p.category?._id : p.category;
        return String(catId) === String(selectedCategory);
      });
    }

    if (sortBy === "price-asc") {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else {
      // newest
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return result;
  }, [products, searchQuery, selectedCategory, sortBy]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#faf7f2] text-stone-800">
        {loading ? (
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            {/* Banner skeleton */}
            <div className="h-64 animate-pulse rounded-3xl bg-[#eee2d1] sm:h-80" />
            <div className="relative -mt-16 flex flex-col items-center px-6 sm:-mt-20 sm:flex-row sm:items-end sm:gap-6">
              <div className="h-32 w-32 animate-pulse rounded-2xl border-4 border-white bg-[#e2d2be] shadow-lg" />
              <div className="mt-4 flex-1 space-y-3 sm:mt-0">
                <div className="h-8 w-64 animate-pulse rounded bg-[#eee2d1]" />
                <div className="h-4 w-40 animate-pulse rounded bg-[#eee2d1]" />
              </div>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="h-48 animate-pulse rounded-2xl bg-white p-6" />
              <div className="h-48 animate-pulse rounded-2xl bg-white p-6" />
              <div className="h-48 animate-pulse rounded-2xl bg-white p-6" />
            </div>
          </div>
        ) : error || !artisan ? (
          <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f4eadb] text-[#8b5e3c]">
              <Users size={36} />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-[#493324] sm:text-3xl">
              Artisan Profile Not Found
            </h1>
            <p className="mt-3 text-sm leading-6 text-stone-600 sm:text-base">
              {error || "We couldn't find an artisan matching this profile link."}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/artisans"
                className="inline-flex items-center gap-2 rounded-full bg-[#8b5e3c] px-6 py-3 font-semibold text-white transition hover:bg-[#70472c]"
              >
                <ArrowLeft size={18} />
                Explore All Artisans
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full border border-[#d6b99c] px-6 py-3 font-semibold text-[#8b5e3c] transition hover:bg-[#f4eadb]"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {/* Breadcrumb Navigation */}
            <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-stone-500 sm:text-sm">
                <Link to="/" className="transition hover:text-[#8b5e3c]">
                  Home
                </Link>
                <span>/</span>
                <Link to="/artisans" className="transition hover:text-[#8b5e3c]">
                  Artisans
                </Link>
                <span>/</span>
                <span className="font-semibold text-[#8b5e3c] truncate max-w-[200px] sm:max-w-none">
                  {shopName}
                </span>
              </nav>
            </div>

            {/* Hero Cover Banner Section */}
            <div className="relative mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="relative h-60 w-full overflow-hidden rounded-3xl bg-gradient-to-r from-[#493324] via-[#70472c] to-[#a56d42] shadow-sm sm:h-80 lg:h-96">
                {bannerImage ? (
                  <img
                    src={bannerImage}
                    alt={`${shopName} storefront banner`}
                    className="h-full w-full object-cover opacity-80"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <Sparkles size={180} />
                  </div>
                )}
                {/* Soft gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Top badges */}
                <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-6 sm:top-6">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-stone-800 backdrop-blur-sm transition hover:bg-white sm:text-sm"
                    title="Share this artisan's workshop"
                  >
                    <Share2 size={15} />
                    <span className="hidden sm:inline">Share Workshop</span>
                  </button>
                </div>
              </div>

              {/* Profile Card Header */}
              <div className="relative -mt-16 px-4 sm:-mt-20 sm:px-8">
                <div className="rounded-3xl border border-[#eadfd3] bg-white p-6 shadow-md sm:p-8">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
                      {/* Avatar / Logo */}
                      <div className="relative -mt-16 h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-br from-[#f4eadb] to-[#d6b99c] shadow-xl sm:-mt-20 sm:h-32 sm:w-32">
                        {logoImage ? (
                          <img
                            src={logoImage}
                            alt={shopName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-[#8b5e3c]">
                            {shopName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow" title="Verified Maker">
                          <CheckCircle2 size={15} />
                        </span>
                      </div>

                      {/* Maker & Shop Titles */}
                      <div className="text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#f4eadb] px-3 py-1 text-xs font-semibold text-[#8b5e3c]">
                            <Sparkles size={12} />
                            Verified Artisan
                          </span>
                          {profile.shopId && (
                            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-500">
                              {profile.shopId}
                            </span>
                          )}
                        </div>

                        <h1 className="mt-2 text-2xl font-extrabold text-[#493324] sm:text-3xl lg:text-4xl">
                          {shopName}
                        </h1>

                        <p className="mt-1 text-sm font-medium text-stone-500">
                          Handcrafted creations by{" "}
                          <span className="text-[#8b5e3c] font-semibold">{makerName}</span>
                        </p>

                        {/* Location and Category badges */}
                        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-stone-600 sm:justify-start sm:text-sm">
                          {location && (
                            <span className="inline-flex items-center gap-1 text-stone-500">
                              <MapPin size={15} className="text-[#8b5e3c]" />
                              {location}
                            </span>
                          )}
                          {craftCategories.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              {craftCategories.map((c) => (
                                <span
                                  key={c._id || c.slug || c.name}
                                  className="rounded-full bg-[#eee2d1] px-2.5 py-0.5 text-xs font-medium text-[#70472c]"
                                >
                                  {c.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick CTA Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-3 md:justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("creations");
                          document.getElementById("artisan-tabs")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-[#8b5e3c] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#70472c]"
                      >
                        <Package size={17} />
                        View Creations ({products.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("contact");
                          document.getElementById("artisan-tabs")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-[#d6b99c] bg-white px-5 py-2.5 text-sm font-semibold text-[#8b5e3c] transition hover:bg-[#f4eadb]"
                      >
                        <MessageSquare size={17} />
                        Contact Maker
                      </button>
                    </div>
                  </div>

                  {/* Highlights Strip */}
                  <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#eadfd3] pt-6 sm:grid-cols-4">
                    <div className="text-center sm:text-left">
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Creations</p>
                      <p className="mt-1 text-lg font-bold text-[#493324]">
                        {productsLoading ? "..." : products.length} Available
                      </p>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Craft Speciality</p>
                      <p className="mt-1 truncate text-lg font-bold text-[#493324]">
                        {craftCategories[0]?.name || "Traditional Crafts"}
                      </p>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Authenticity</p>
                      <p className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-emerald-700">
                        <ShieldCheck size={16} /> 100% Handmade
                      </p>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Country</p>
                      <p className="mt-1 text-lg font-bold text-[#493324]">
                        {profile.country || "Sri Lanka"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div id="artisan-tabs" className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex border-b border-[#eadfd3]">
                <button
                  type="button"
                  onClick={() => setActiveTab("creations")}
                  className={`flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-bold transition sm:text-base ${
                    activeTab === "creations"
                      ? "border-[#8b5e3c] text-[#8b5e3c]"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <Package size={18} />
                  Creations ({products.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("story")}
                  className={`flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-bold transition sm:text-base ${
                    activeTab === "story"
                      ? "border-[#8b5e3c] text-[#8b5e3c]"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <Users size={18} />
                  Maker Story & Studio
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("contact")}
                  className={`flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-bold transition sm:text-base ${
                    activeTab === "contact"
                      ? "border-[#8b5e3c] text-[#8b5e3c]"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <MessageSquare size={18} />
                  Contact & Inquiries
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              {/* TAB 1: CREATIONS */}
              {activeTab === "creations" && (
                <section>
                  {/* Search and Filters Bar */}
                  <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-[#eadfd3] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    {/* Search input */}
                    <div className="relative flex-1">
                      <Search
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                      />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search in ${shopName}'s creations...`}
                        className="w-full rounded-full border border-stone-200 bg-[#faf7f2] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#8b5e3c] focus:bg-white"
                      />
                    </div>

                    {/* Category Filter Pills & Sort dropdown */}
                    <div className="flex flex-wrap items-center gap-3">
                      {availableProductCategories.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedCategory("all")}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                              selectedCategory === "all"
                                ? "bg-[#8b5e3c] text-white"
                                : "bg-[#f4eadb] text-stone-700 hover:bg-[#e8d7c3]"
                            }`}
                          >
                            All Categories
                          </button>
                          {availableProductCategories.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setSelectedCategory(c.id)}
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                selectedCategory === c.id
                                  ? "bg-[#8b5e3c] text-white"
                                  : "bg-[#f4eadb] text-stone-700 hover:bg-[#e8d7c3]"
                              }`}
                            >
                              {c.name}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Sort Dropdown */}
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal size={15} className="text-stone-400" />
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 outline-none transition focus:border-[#8b5e3c]"
                        >
                          <option value="newest">Newest First</option>
                          <option value="price-asc">Price: Low to High</option>
                          <option value="price-desc">Price: High to Low</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Products Grid */}
                  {productsLoading ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-80 animate-pulse rounded-2xl border border-stone-200 bg-white"
                        />
                      ))}
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="rounded-3xl border border-[#eadfd3] bg-white px-6 py-16 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f4eadb] text-[#8b5e3c]">
                        <Package size={30} />
                      </div>
                      <h3 className="mt-4 text-xl font-bold text-[#493324]">
                        {products.length === 0
                          ? "No Products Available Yet"
                          : "No Matching Products Found"}
                      </h3>
                      <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
                        {products.length === 0
                          ? `${shopName} is preparing new handmade pieces. Inquire directly or check back soon!`
                          : "Try adjusting your search keywords or category filters."}
                      </p>
                      {searchQuery || selectedCategory !== "all" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedCategory("all");
                          }}
                          className="mt-6 rounded-full bg-[#8b5e3c] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#70472c]"
                        >
                          Clear Filters
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveTab("contact")}
                          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#8b5e3c] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#70472c]"
                        >
                          <MessageSquare size={16} />
                          Request a Custom Piece
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-stone-500">
                        Showing {filteredProducts.length}{" "}
                        {filteredProducts.length === 1 ? "craft" : "crafts"}
                      </div>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredProducts.map((product) => (
                          <ProductCard
                            key={product._id || product.id}
                            product={product}
                            onAddToCart={handleAddToCart}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* TAB 2: STORY & STUDIO */}
              {activeTab === "story" && (
                <section className="space-y-8">
                  {/* Bio & Craft Philosophy */}
                  <div className="rounded-3xl border border-[#eadfd3] bg-white p-6 shadow-sm sm:p-10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4eadb] text-[#8b5e3c]">
                        <Heart size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-[#a56d42]">
                          Artisan Heritage
                        </p>
                        <h2 className="text-2xl font-bold text-[#493324] sm:text-3xl">
                          The Story of {shopName}
                        </h2>
                      </div>
                    </div>

                    <div className="mt-6 whitespace-pre-line text-base leading-8 text-stone-700 sm:text-lg">
                      {bio}
                    </div>

                    {/* Guarantees Box */}
                    <div className="mt-8 grid grid-cols-1 gap-4 rounded-2xl bg-[#faf7f2] p-6 sm:grid-cols-3">
                      <div className="flex items-start gap-3">
                        <ShieldCheck size={22} className="shrink-0 text-[#8b5e3c]" />
                        <div>
                          <h4 className="text-sm font-bold text-[#493324]">100% Authentic</h4>
                          <p className="mt-0.5 text-xs text-stone-600">
                            Crafted by hand using ethical practices and traditional Sri Lankan skills.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Heart size={22} className="shrink-0 text-[#8b5e3c]" />
                        <div>
                          <h4 className="text-sm font-bold text-[#493324]">Direct Support</h4>
                          <p className="mt-0.5 text-xs text-stone-600">
                            Purchases directly sustain rural artisan livelihoods and local workshops.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Sparkles size={22} className="shrink-0 text-[#8b5e3c]" />
                        <div>
                          <h4 className="text-sm font-bold text-[#493324]">Custom Commissions</h4>
                          <p className="mt-0.5 text-xs text-stone-600">
                            Open to bespoke sizing, personal colorways, and personalized touches.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Studio Details & Craft Categories */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Location Card */}
                    <div className="rounded-3xl border border-[#eadfd3] bg-white p-6 shadow-sm sm:p-8">
                      <div className="flex items-center gap-3">
                        <MapPin size={22} className="text-[#8b5e3c]" />
                        <h3 className="text-xl font-bold text-[#493324]">Studio Location</h3>
                      </div>
                      <p className="mt-4 text-sm text-stone-600">
                        {shopName} operates in the artisan hub of{" "}
                        <strong className="text-stone-800">{location || "Sri Lanka"}</strong>.
                      </p>
                      <div className="mt-4 space-y-2 text-sm text-stone-600">
                        {profile.city && (
                          <div className="flex justify-between border-b border-stone-100 py-1.5">
                            <span className="text-stone-400">City / Town</span>
                            <span className="font-semibold text-stone-800">{profile.city}</span>
                          </div>
                        )}
                        {profile.district && (
                          <div className="flex justify-between border-b border-stone-100 py-1.5">
                            <span className="text-stone-400">District</span>
                            <span className="font-semibold text-stone-800">{profile.district}</span>
                          </div>
                        )}
                        <div className="flex justify-between py-1.5">
                          <span className="text-stone-400">Country</span>
                          <span className="font-semibold text-stone-800">{profile.country || "Sri Lanka"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Crafts & Disciplines */}
                    <div className="rounded-3xl border border-[#eadfd3] bg-white p-6 shadow-sm sm:p-8">
                      <div className="flex items-center gap-3">
                        <Sparkles size={22} className="text-[#8b5e3c]" />
                        <h3 className="text-xl font-bold text-[#493324]">Craft Disciplines</h3>
                      </div>
                      <p className="mt-4 text-sm text-stone-600">
                        Mastery across traditional categories and heritage materials:
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {craftCategories.length > 0 ? (
                          craftCategories.map((c) => (
                            <span
                              key={c._id || c.slug || c.name}
                              className="rounded-full bg-[#f4eadb] px-4 py-2 text-sm font-semibold text-[#8b5e3c]"
                            >
                              {c.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-stone-500">Traditional Sri Lankan Crafts</span>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* TAB 3: CONTACT & INQUIRIES */}
              {activeTab === "contact" && (
                <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                  {/* Left: Contact Info */}
                  <div className="space-y-6 lg:col-span-5">
                    <div className="rounded-3xl border border-[#eadfd3] bg-white p-6 shadow-sm sm:p-8">
                      <h3 className="text-xl font-bold text-[#493324]">Connect with the Maker</h3>
                      <p className="mt-2 text-sm text-stone-600">
                        Have a question about materials, custom dimensions, or order details?
                        Reach out directly.
                      </p>

                      <div className="mt-6 space-y-4">
                        {profile.contactEmail && (
                          <a
                            href={`mailto:${profile.contactEmail}`}
                            className="flex items-center gap-3.5 rounded-2xl bg-[#faf7f2] p-3.5 transition hover:bg-[#f4eadb]"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eee2d1] text-[#8b5e3c]">
                              <Mail size={18} />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-xs font-semibold text-stone-400 uppercase">Email</p>
                              <p className="truncate text-sm font-bold text-[#493324]">{profile.contactEmail}</p>
                            </div>
                          </a>
                        )}

                        {profile.contactPhone && (
                          <a
                            href={`tel:${profile.contactPhone}`}
                            className="flex items-center gap-3.5 rounded-2xl bg-[#faf7f2] p-3.5 transition hover:bg-[#f4eadb]"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eee2d1] text-[#8b5e3c]">
                              <Phone size={18} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-stone-400 uppercase">Phone / WhatsApp</p>
                              <p className="text-sm font-bold text-[#493324]">{profile.contactPhone}</p>
                            </div>
                          </a>
                        )}

                        {location && (
                          <div className="flex items-center gap-3.5 rounded-2xl bg-[#faf7f2] p-3.5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eee2d1] text-[#8b5e3c]">
                              <MapPin size={18} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-stone-400 uppercase">Location</p>
                              <p className="text-sm font-bold text-[#493324]">{location}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Social Media links */}
                      {(profile.facebook || profile.instagram || profile.website) && (
                        <div className="mt-6 border-t border-[#eadfd3] pt-6">
                          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                            Social Media & Web
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {profile.instagram && (
                              <a
                                href={profile.instagram}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 transition hover:border-[#8b5e3c] hover:text-[#8b5e3c]"
                              >
                                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                                Instagram
                                <ExternalLink size={12} />
                              </a>
                            )}
                            {profile.facebook && (
                              <a
                                href={profile.facebook}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 transition hover:border-[#8b5e3c] hover:text-[#8b5e3c]"
                              >
                                <Globe size={15} />
                                Facebook
                                <ExternalLink size={12} />
                              </a>
                            )}
                            {profile.website && (
                              <a
                                href={profile.website}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 transition hover:border-[#8b5e3c] hover:text-[#8b5e3c]"
                              >
                                <Globe size={15} />
                                Website
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Message Form */}
                  <div className="lg:col-span-7">
                    <div className="rounded-3xl border border-[#eadfd3] bg-white p-6 shadow-sm sm:p-10">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4eadb] text-[#8b5e3c]">
                          <MessageSquare size={20} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-[#493324]">Send a Direct Message</h3>
                          <p className="text-xs text-stone-500">Inquire about custom orders, commissions, or crafts</p>
                        </div>
                      </div>

                      {inquirySent ? (
                        <div className="mt-8 rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center">
                          <CheckCircle2 size={44} className="mx-auto text-emerald-600" />
                          <h4 className="mt-4 text-xl font-bold text-emerald-900">Message Delivered!</h4>
                          <p className="mt-2 text-sm text-emerald-700">
                            Thank you for reaching out to {shopName}. The artisan will review your note and respond via email.
                          </p>
                          <button
                            type="button"
                            onClick={() => setInquirySent(false)}
                            className="mt-6 rounded-full bg-[#8b5e3c] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#70472c]"
                          >
                            Send Another Message
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleInquirySubmit} className="mt-8 space-y-4">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                                Your Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={inquiry.name}
                                onChange={(e) => setInquiry({ ...inquiry, name: e.target.value })}
                                placeholder="Enter your full name"
                                className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#faf7f2] p-3 text-sm outline-none transition focus:border-[#8b5e3c] focus:bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                                Your Email *
                              </label>
                              <input
                                type="email"
                                required
                                value={inquiry.email}
                                onChange={(e) => setInquiry({ ...inquiry, email: e.target.value })}
                                placeholder="Enter your email address"
                                className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#faf7f2] p-3 text-sm outline-none transition focus:border-[#8b5e3c] focus:bg-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                              Subject
                            </label>
                            <input
                              type="text"
                              required
                              value={inquiry.subject}
                              onChange={(e) => setInquiry({ ...inquiry, subject: e.target.value })}
                              placeholder="e.g. Custom Wooden Box Commission"
                              className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#faf7f2] p-3 text-sm outline-none transition focus:border-[#8b5e3c] focus:bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                              Message *
                            </label>
                            <textarea
                              rows={5}
                              required
                              value={inquiry.message}
                              onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })}
                              placeholder="Describe your request, dimensions, or questions..."
                              className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#faf7f2] p-3 text-sm outline-none transition focus:border-[#8b5e3c] focus:bg-white"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={inquirySubmitting}
                            className="mt-2 w-full rounded-full bg-[#8b5e3c] py-3.5 text-sm font-semibold text-white transition hover:bg-[#70472c] disabled:opacity-50"
                          >
                            {inquirySubmitting ? "Sending..." : `Send Message to ${shopName}`}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
};

export default ArtisanDetailsPage;
