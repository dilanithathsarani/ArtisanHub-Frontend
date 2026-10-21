import { useState, useEffect} from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  Heart,
  ArrowRight,
  UserRound
} from "lucide-react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(
          localStorage.getItem("artisanhub-cart") || "[]"
        );

        setCartCount(
          cart.reduce(
            (total, item) => total + (Number(item.quantity) || 0),
            0
          )
        );
      } catch {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Categories", path: "/categories" },
    { name: "Our Artisans", path: "/artisans" },
    { name: "About", path: "/about" }
  ];

  const navClass = ({ isActive }) =>
    `relative py-2 text-sm font-medium transition-colors duration-200 ${isActive
      ? "text-[#8b5e3c] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#a56d42]"
      : "text-stone-600 hover:text-[#8b5e3c]"
    }`;

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-[#fffdf9]/95 shadow-sm backdrop-blur-md">
      {/* Announcement strip */}
      <div className="bg-[#8b5e3c] px-4 py-2 text-center text-xs tracking-wide text-white sm:text-sm">
        <span className="inline-flex items-center justify-center gap-2">
          <Heart size={13} />
          Celebrate handmade. Support local artisans.
          <ArrowRight size={13} />
        </span>
      </div>

      {/* Main navbar */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-2.5"
        >
          <svg
            viewBox="0 0 48 60"
            className="h-11 w-auto shrink-0 transition-transform duration-300 hover:scale-105 sm:h-12"
            fill="none"
          >
            <path
              d="M16 3h16v6l-4 5v6c8 5 13 13 13 22 0 9-7 15-17 15S7 51 7 42c0-9 5-17 13-22v-6l-4-5V3Z"
              fill="#85451e"
            />
            <path
              d="M24 49V25M24 39C13 35 12 26 12 26c9 0 12 8 12 13ZM24 34c9-4 10-12 10-12-8 1-10 7-10 12ZM24 48c-7-2-10-7-10-12M24 43c7-2 10-7 10-12"
              stroke="#fff4e5"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div>
            <span className="block text-xl font-bold tracking-tight text-[#493324] sm:text-4xl">
              ArtisanHub<span className="text-[#a56d42]">.</span>
            </span>
            <span className="hidden text-[10px] tracking-[0.13em] text-stone-500 sm:block">
              EVERY PIECE TELLS A STORY
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-5 lg:flex xl:gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/"}
              className={navClass}
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/shop"
            aria-label="Search crafts"
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-600 transition hover:bg-[#f4eadb] hover:text-[#8b5e3c]"
          >
            <Search size={20} strokeWidth={1.7} />
          </Link>

          <Link
            to="/cart"
            aria-label="Shopping bag"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-stone-600 transition hover:bg-[#f4eadb] hover:text-[#8b5e3c]"
          >
            <ShoppingBag size={20} strokeWidth={1.7} />

            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#8b5e3c] px-1 text-[10px] font-bold text-white ring-2 ring-[#fffdf9]">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          <Link
            to="/login"
            className="hidden items-center gap-2 rounded-full border border-[#d9c7b4] px-4 py-2.5 text-sm font-semibold text-[#70472c] transition hover:border-[#8b5e3c] hover:bg-[#f4eadb] md:flex"
          >
            <UserRound size={16} />
            Login
          </Link>

          <Link
            to="/signup"
            className="hidden rounded-full bg-[#8b5e3c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#70472c] md:inline-flex"
          >
            Join Us
          </Link>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4eadb] text-[#70472c] transition hover:bg-[#e9dac8] lg:hidden"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Responsive menu */}
      {menuOpen && (
        <div className="border-t border-[#eadfd3] bg-[#fffdf9] px-4 pb-5 pt-3 shadow-lg lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-medium transition ${isActive
                    ? "bg-[#f4eadb] text-[#8b5e3c]"
                    : "text-stone-700 hover:bg-[#faf3e9] hover:text-[#8b5e3c]"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#eadfd3] pt-4">
              <Link
                to="/login"
                onClick={closeMenu}
                className="rounded-full border border-[#d9c7b4] px-4 py-3 text-center text-sm font-semibold text-[#70472c] transition hover:bg-[#f4eadb]"
              >
                Login
              </Link>

              <Link
                to="/signup"
                onClick={closeMenu}
                className="rounded-full bg-[#8b5e3c] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#70472c]"
              >
                Join Us
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
