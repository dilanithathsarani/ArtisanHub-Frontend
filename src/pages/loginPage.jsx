
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);

      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";

      const response = await axios.post(`${apiUrl}/auth/login`, formData);
      const result = response.data;
      const data = result.data || result;

      const token =
        data.token || data.accessToken || data.access_token;

      if (token) {
        localStorage.setItem("token", token);
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      toast.success(result.message || "Login successful!");

      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffdf9] px-4 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl md:grid-cols-2">
        <section className="hidden flex-col justify-center bg-[#f4eadb] p-12 md:flex">
          <p className="text-sm font-bold tracking-[0.25em] text-[#94633d]">
            ARTISANHUB
          </p>

          <h1 className="mt-6 text-4xl font-bold leading-tight text-stone-800">
            Welcome back to a world of handmade treasures.
          </h1>

          <p className="mt-5 leading-7 text-stone-600">
            Discover unique creations and connect with talented local
            artisans.
          </p>
        </section>

        <section className="p-7 sm:p-10 md:p-12">
          <Link
            to="/"
            className="text-sm font-medium text-[#8b5e3c] hover:underline"
          >
            ← Back to Home
          </Link>

          <h2 className="mt-8 text-3xl font-bold text-stone-800">
            Sign in
          </h2>

          <p className="mt-2 text-sm text-stone-500">
            Enter your account details to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-stone-700"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-stone-300 px-4 py-3 outline-none transition focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-stone-700"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full rounded-lg border border-stone-300 px-4 py-3 outline-none transition focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#8b5e3c] px-4 py-3 font-semibold text-white transition hover:bg-[#70472c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500">
            Don't have an account yet?{" "}
            <span className="font-medium text-[#8b5e3c]">
              Registration coming next
            </span>
          </p>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;
