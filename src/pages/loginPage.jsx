import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import artisanImage from "../assets/login.jpg";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const apiUrl =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axios.post(`${apiUrl}/auth/login`, {
        email: email.trim(),
        password,
      });

      const data = response.data;
      const token =
        data.token || data.accessToken || data.access_token;
      const user = data.user || data.data?.user;

      if (token) localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }

      toast.success("Welcome back to ArtisanHub!");
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid h-dvh w-full grid-cols-1 overflow-hidden bg-white lg:grid-cols-2">
      {/* Left side */}
      <section className="relative hidden h-dvh overflow-hidden lg:block">
        <img
          src={artisanImage}
          alt="ArtisanHub handmade pottery and crafts"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#f6e8d7]/80 via-[#f6e8d7]/45 to-transparent" />

        <div className="relative z-10 flex h-full flex-col px-10 py-8 xl:px-[11%] xl:py-10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4 text-[#663817]">
            <svg
              viewBox="0 0 48 60"
              className="h-16 w-14 shrink-0"
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
              <h1 className="font-serif text-4xl font-medium tracking-tight xl:text-[44px]">
                ArtisanHub
              </h1>
              <p className="mt-1 text-xs tracking-[0.18em] text-[#85451e]">
                HANDMADE · LOCAL · UNIQUE
              </p>
            </div>
          </Link>

          {/* Heading */}
          <div className="mt-[9vh]">
            <h2 className="font-serif text-[clamp(34px,3.2vw,52px)] font-bold leading-[1.15] text-[#171412]">
              Support Artisans.
              <span className="block text-[#99501f]">
                Celebrate Uniqueness.
              </span>
            </h2>

            <p className="mt-6 max-w-[430px] text-base font-semibold leading-[1.8] text-[#45413e] xl:text-lg">
              Join ArtisanHub and be part of a community that values
              handmade crafts, supports local artisans and brings
              unique creations to life.
            </p>
          </div>

          {/* Benefits */}
          <div className="mt-10 grid max-w-[470px] grid-cols-3 divide-x divide-[#a56d47]/70">
            <div className="pr-3">
              <svg
                className="h-8 w-8 text-[#99501f]"
                viewBox="0 0 32 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M5 26C5 12 15 5 27 5c0 12-7 22-20 21Z" />
                <path d="M7 25 21 11" />
              </svg>
              <p className="mt-2 text-sm leading-5">
                Handmade
                <br />
                Products
              </p>
            </div>

            <div className="px-5">
              <svg
                className="h-8 w-8 text-[#99501f]"
                viewBox="0 0 32 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="m16 3 11 5v8c0 7-5 11-11 14C10 27 5 23 5 16V8l11-5Z" />
              </svg>
              <p className="mt-2 text-sm leading-5">
                Support
                <br />
                Local Artisans
              </p>
            </div>

            <div className="pl-5">
              <svg
                className="h-8 w-8 text-[#99501f]"
                viewBox="0 0 32 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M16 27S3 19 3 11a7 7 0 0 1 13-3 7 7 0 0 1 13 3c0 8-13 16-13 16Z" />
              </svg>
              <p className="mt-2 text-sm leading-5">
                Unique &amp;
                <br />
                Meaningful Gifts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Right side */}
      <section className="relative flex h-dvh items-center justify-center overflow-hidden px-5 py-4 sm:px-10 lg:px-12 xl:px-16">
        <Link
          to="/"
          className="absolute right-5 top-5 flex items-center gap-2 text-xs text-[#994b1c] hover:text-[#663014] sm:right-8 sm:top-7"
        >
          <span className="text-lg">←</span>
          Back to Home
        </Link>

        <div className="w-full max-w-[440px]">
          {/* Mobile logo */}
          <Link
            to="/"
            className="mb-4 flex items-center justify-center gap-2 text-[#75401f] lg:hidden"
          >
            <span className="text-2xl">❋</span>
            <span className="font-serif text-2xl font-semibold">
              ArtisanHub
            </span>
          </Link>

          <h2 className="font-serif text-3xl font-bold tracking-tight text-[#111315] sm:text-4xl">
            Welcome Back
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Sign in to your ArtisanHub account to continue exploring
            unique handmade crafts.
          </p>

          <form onSubmit={handleLogin} className="mt-5 space-y-3">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-semibold text-gray-700"
              >
                Email Address
              </label>

              <div className="flex h-10 items-center gap-3 rounded-lg border border-gray-300 px-3.5 focus-within:border-[#99501f] focus-within:ring-2 focus-within:ring-[#99501f]/10">
                <svg
                  className="h-5 w-5 shrink-0 text-gray-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-semibold text-gray-700"
              >
                Password
              </label>

              <div className="flex h-10 items-center gap-3 rounded-lg border border-gray-300 px-3.5 focus-within:border-[#99501f] focus-within:ring-2 focus-within:ring-[#99501f]/10">
                <svg
                  className="h-5 w-5 shrink-0 text-gray-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <rect x="5" y="10" width="14" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="shrink-0 text-gray-500 hover:text-[#99501f]"
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                      <path d="M9.9 5.2A11 11 0 0 1 12 5c5 0 9 7 9 7a16 16 0 0 1-3.2 3.8M6.2 6.2C3.9 7.8 2 12 2 12s4 7 10 7a9 9 0 0 0 3-.5" />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between gap-3 text-xs">
              <label className="flex cursor-pointer items-center gap-3 text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#99501f]"
                />
                Remember me
              </label>

              <button
                type="button"
                onClick={() =>
                  toast("Password recovery will be available soon.")
                }
                className="shrink-0 text-[#994b1c] hover:text-[#663014]"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign in */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-3 rounded-lg bg-[#965022] text-sm font-semibold text-white transition hover:bg-[#7c3e17] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Sign In"}
              {!loading && <span className="text-lg">→</span>}
            </button>
          </form>

          {/* Registration separator */}
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="whitespace-nowrap text-xs text-gray-400">
              New to ArtisanHub?
            </span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/signup")
            }
            className="flex h-10 w-full items-center justify-center gap-3 rounded-lg border border-[#994b1c] text-sm font-medium text-[#994b1c] transition hover:bg-[#fbf3ed]"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21v-2a8 8 0 0 1 16 0v2Z" />
            </svg>
            Register Now
          </button>
        </div>
      </section>
    </main>
  );
}