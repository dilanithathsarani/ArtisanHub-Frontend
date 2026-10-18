
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  Mail,
  MapPin,
} from "lucide-react";

function Footer() {
  return (
    <footer className="bg-[#f4eadb] text-[#493324]">
      {/* Newsletter Section */}
      <div className="border-b border-[#8b5e3c]/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#8b5e3c]">
              A little handmade happiness
            </p>

            <h2 className="text-2xl font-semibold sm:text-3xl">
              Stories, crafts & inspiration.
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-6 text-[#795f4d]">
              Discover unique handmade treasures and celebrate
              the people who create them.
            </p>
          </div>

          <Link
            to="/signup"
            className="inline-flex w-fit items-center gap-3 rounded-full bg-[#8b5e3c] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#70472c]"
          >
            Join our community
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-10 lg:py-16">
        {/* Brand */}
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5">
            <svg
              viewBox="0 0 48 60"
              className="h-10 w-auto shrink-0"
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

            <span className="text-2xl font-bold tracking-tight">
              Artisan<span className="text-[#8b5e3c]">Hub.</span>
            </span>
          </Link>

          <p className="mt-5 max-w-xs text-sm leading-7 text-[#795f4d]">
            A home for handmade treasures, creative minds,
            and the stories behind every little detail.
          </p>

          <p className="mt-4 flex items-center gap-2 text-sm text-[#795f4d]">
            Made with <Heart size={15} className="fill-[#8b5e3c] text-[#8b5e3c]" /> for handmade.
          </p>
        </div>

        {/* Explore */}
        <div>
          <h3 className="mb-5 text-sm font-bold uppercase tracking-widest">
            Explore
          </h3>

          <ul className="space-y-3 text-sm text-[#795f4d]">
            <li>
              <Link to="/" className="transition hover:text-[#8b5e3c]">
                Home
              </Link>
            </li>
            <li>
              <Link to="/shop" className="transition hover:text-[#8b5e3c]">
                Shop all crafts
              </Link>
            </li>
            <li>
              <Link to="/categories" className="transition hover:text-[#8b5e3c]">
                Categories
              </Link>
            </li>
            <li>
              <Link to="/artisans" className="transition hover:text-[#8b5e3c]">
                Meet our artisans
              </Link>
            </li>
          </ul>
        </div>

        {/* Community */}
        <div>
          <h3 className="mb-5 text-sm font-bold uppercase tracking-widest">
            Community
          </h3>

          <ul className="space-y-3 text-sm text-[#795f4d]">
            <li>
              <Link to="/signup" className="transition hover:text-[#8b5e3c]">
                Become a member
              </Link>
            </li>
            <li>
              <Link to="/login" className="transition hover:text-[#8b5e3c]">
                My account
              </Link>
            </li>
            <li>
              <Link to="/about" className="transition hover:text-[#8b5e3c]">
                About ArtisanHub
              </Link>
            </li>
            <li>
              <a href="mailto:support@artisanhub.com" className="transition hover:text-[#8b5e3c]">
                Contact us
              </a>
            </li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div>
          <h3 className="mb-5 text-sm font-bold uppercase tracking-widest">
            Stay Connected
          </h3>

          <p className="flex items-start gap-3 text-sm leading-6 text-[#795f4d]">
            <Mail size={18} className="mt-1 shrink-0 text-[#8b5e3c]" />
            support@artisanhub.com
          </p>

          <p className="mt-3 flex items-start gap-3 text-sm leading-6 text-[#795f4d]">
            <MapPin size={18} className="mt-1 shrink-0 text-[#8b5e3c]" />
            Supporting local artisans and handmade crafts.
          </p>

          <div className="mt-6 flex gap-3">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#8b5e3c]/30 text-[#493324] transition hover:bg-[#8b5e3c] hover:text-white"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#8b5e3c]/30 text-[#493324] transition hover:bg-[#8b5e3c] hover:text-white"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#8b5e3c]/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 text-center text-xs text-[#795f4d] sm:flex-row sm:items-center sm:justify-between sm:text-left lg:px-10">
          <p>
            © {new Date().getFullYear()} ArtisanHub. All rights reserved.
          </p>

          <p className="tracking-wide">
            Every craft has a story. Every artisan matters.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
