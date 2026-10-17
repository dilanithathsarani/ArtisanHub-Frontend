
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import artisanImage from "../assets/login.jpg";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error("Please enter your email address.");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(`${apiUrl}/auth/forgotPassword`, {
                email: email.trim(),
            });

            setSubmitted(true);
            toast.success(
                response.data?.message ||
                "Password reset instructions will be sent."
            );
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Unable to process your request. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="grid h-dvh w-full grid-cols-1 overflow-hidden bg-white lg:grid-cols-2">
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
                            We're here to help
                        </p>

                        <h2 className="mt-4 max-w-md font-serif text-4xl font-bold leading-tight text-[#171412] xl:text-5xl">
                            A Fresh Start
                            <span className="block text-[#99501f]">
                                Begins Here.
                            </span>
                        </h2>

                        <p className="mt-6 max-w-[430px] text-base font-semibold leading-[1.8] text-[#45413e] xl:text-lg">
                            Forgot your password? Don't worry. Let's help you get back to
                            discovering beautiful handmade creations and supporting local
                            artisans.
                        </p>
                    </div>

                    <div className="mt-10 space-y-4 text-sm text-[#45413e]">
                        <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-[#965022]">
                                ✓
                            </span>
                            Secure account access
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-[#965022]">
                                ✓
                            </span>
                            Your handmade journey awaits
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative flex h-dvh items-center justify-center overflow-hidden px-5 py-4 sm:px-10 lg:px-12 xl:px-16">
                <Link
                    to="/"
                    className="absolute right-5 top-5 flex items-center gap-2 text-xs text-[#994b1c] hover:text-[#663014] sm:right-8 sm:top-7"
                >
                    <span className="text-lg">←</span>
                    Back to Home
                </Link>

                <div className="w-full max-w-[400px]">
                    <Link to="/" className="mb-9 flex items-center gap-2 lg:hidden">
                        <svg
                            viewBox="0 0 48 48"
                            fill="none"
                            className="h-9 w-9 text-[#965022]"
                            aria-hidden="true"
                        >
                            <path
                                d="M24 4 29 15 41 17 32 26 34 39 24 33 14 39 16 26 7 17 19 15 24 4Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinejoin="round"
                            />
                            <circle cx="24" cy="23" r="5" fill="currentColor" />
                        </svg>

                        <span className="font-serif text-2xl font-semibold text-[#663817]">
                            ArtisanHub
                        </span>
                    </Link>

                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#fbf1e8] text-[#965022]">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            className="h-6 w-6"
                            aria-hidden="true"
                        >
                            <rect x="4" y="10" width="16" height="11" rx="2" />
                            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                            <path d="M12 14v3" />
                        </svg>
                    </div>

                    {submitted ? (
                        <div>
                            <h2 className="font-serif text-3xl font-bold tracking-tight text-[#171412]">
                                Check Your Email
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-gray-600">
                                If an account exists for{" "}
                                <span className="font-medium text-gray-800">{email}</span>,
                                password reset instructions will be sent to that address.
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    setSubmitted(false);
                                    setEmail("");
                                }}
                                className="mt-6 h-11 w-full rounded-lg border border-[#994b1c] text-sm font-semibold text-[#994b1c] transition hover:bg-[#fbf3ed]"
                            >
                                Try Another Email
                            </button>
                        </div>
                    ) : (
                        <>
                            <h2 className="font-serif text-3xl font-bold tracking-tight text-[#111315] sm:text-4xl">
                                Forgot Password?
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-gray-600">
                                Enter the email address associated with your account. We'll
                                help you get back in.
                            </p>

                            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="mb-1.5 block text-xs font-semibold text-gray-700"
                                    >
                                        Email Address
                                    </label>

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#965022] focus:ring-2 focus:ring-[#965022]/15"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex h-11 w-full items-center justify-center rounded-lg bg-[#965022] text-sm font-semibold text-white transition hover:bg-[#7c401a] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? "Sending Instructions..." : "Reset Password"}
                                </button>
                            </form>
                        </>
                    )}

                    <div className="mt-7 border-t border-gray-200 pt-5 text-center">
                        <Link
                            to="/login"
                            className="text-sm font-semibold text-[#965022] transition hover:text-[#663817]"
                        >
                            ← Back to Sign In
                        </Link>
                    </div>

                    <p className="mt-8 text-center text-[10px] text-gray-400">
                        © {new Date().getFullYear()} ArtisanHub. Made with care for
                        artisans.
                    </p>
                </div>
            </section>
        </main>
    );
}
