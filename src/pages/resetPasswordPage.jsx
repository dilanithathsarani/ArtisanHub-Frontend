import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import artisanImage from "../assets/reset.jpg";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const apiUrl =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${apiUrl}/auth/reset-password/${token}`,
        { password }
      );

      toast.success(
        response.data?.message ||
        "Password reset successful! You can now sign in."
      );
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Password reset failed or the link has expired."
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
          alt="ArtisanHub handmade crafts"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#f6e8d7]/85 via-[#f6e8d7]/50 to-transparent" />

        <div className="relative z-10 flex h-full flex-col px-10 py-8 xl:px-[11%] xl:py-10">
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

          <div className="mt-[12vh]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#99501f]">
              Account Security
            </p>

            <h2 className="mt-4 max-w-md font-serif text-4xl font-bold leading-tight text-[#171412] xl:text-5xl">
              Create New
              <span className="block text-[#99501f]">
                Password.
              </span>
            </h2>

            <p className="mt-6 max-w-[430px] text-base font-semibold leading-[1.8] text-[#45413e] xl:text-lg">
              Set a strong, unique password to secure your ArtisanHub account
              and keep supporting talented local artisans.
            </p>
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

        <div className="w-full max-w-[420px]">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#fbf1e8] text-[#965022]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-6 w-6"
            >
              <rect x="5" y="10" width="14" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </div>

          <h2 className="font-serif text-3xl font-bold tracking-tight text-[#111315] sm:text-4xl">
            Reset Password
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Please enter your new password below.
          </p>

          <form onSubmit={handleResetPassword} className="mt-5 space-y-3">
            {/* New Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-semibold text-gray-700"
              >
                New Password
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
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
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

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-semibold text-gray-700"
              >
                Confirm New Password
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
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                  className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-3 rounded-lg bg-[#965022] text-sm font-semibold text-white transition hover:bg-[#7c3e17] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Updating Password..." : "Update Password"}
            </button>
          </form>

          <div className="mt-6 border-t border-gray-200 pt-4 text-center">
            <Link
              to="/login"
              className="text-sm font-semibold text-[#965022] transition hover:text-[#663817]"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
