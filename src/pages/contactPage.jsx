import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  Heart,
  CheckCircle2,
} from "lucide-react";
import Navbar from "../components/navBar";
import Footer from "../components/footer";
import contactHeroImage from "../assets/contact.jpg";

const initialFormData = {
  name: "",
  email: "",
  inquiryType: "General Inquiry",
  subject: "",
  message: "",
};

function ContactPage() {
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post(`${apiUrl}/contact`, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        inquiryType: formData.inquiryType,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      toast.success(response.data?.message || "Thank you! Your message has been received. We'll be in touch soon.");
      setFormData(initialFormData);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to send your message. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const contactCards = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Our dedicated team responds within 24 hours.",
      detail: "support@artisanhub.com",
      link: "mailto:support@artisanhub.com",
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Mon-Fri from 9:00 AM to 6:00 PM.",
      detail: "+94 (11) 234-5678",
      link: "tel:+94112345678",
    },
    {
      icon: MapPin,
      title: "Artisan Studio HQ",
      description: "Visit our showroom and craft collective.",
      detail: "42 Galle Road, Colombo 03, Sri Lanka",
      link: "https://maps.google.com",
    },
    {
      icon: Clock,
      title: "Workshop Hours",
      description: "Open for visitors & craft pickups.",
      detail: "Mon - Sat: 9:00 AM – 6:00 PM",
      link: null,
    },
  ];

  return (
    <main className="min-h-screen bg-[#fffdf9] text-stone-800">
      <Navbar />

      {/* Hero Header with Background Image */}
      <section className="relative overflow-hidden bg-[#29231f] px-6 py-20 sm:px-10 sm:py-28 lg:px-[8%]">
        <img
          src={contactHeroImage}
          alt="Artisan craft workshop background"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-40 transition-transform duration-1000 hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#29231f] via-[#29231f]/75 to-[#29231f]/60" />

        <div className="relative mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-[#f4eadb] backdrop-blur-md">
            <Sparkles size={13} className="text-[#c28457]" />
            We Would Love to Hear From You
          </p>

          <h1 className="mt-5 font-serif text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            Get in Touch With{" "}
            <span className="block text-[#f4eadb]">ArtisanHub.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#d9c7b4] sm:text-lg">
            Have questions about a handcrafted piece, custom artisan orders, or
            joining our creator community? We&apos;re here to help every step of the way.
          </p>
        </div>
      </section>

      {/* Main Contact Container */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Contact Cards & Info */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8b5e3c]">
              <Sparkles size={15} />
              Direct Communication
            </div>

            <h2 className="mt-3 font-serif text-3xl font-bold text-[#493324]">
              How Can We Assist You?
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-stone-600">
              Whether you are an art lover with an inquiry about an order or an
              artisan eager to share your work with our community, our doors
              are always open.
            </p>

            {/* Quick Cards Grid */}
            <div className="mt-8 space-y-4">
              {contactCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 rounded-xl border border-stone-200 bg-white p-5 shadow-xs transition hover:border-[#8b5e3c] hover:shadow-sm"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#f4eadb] text-[#8b5e3c]">
                      <Icon size={20} />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#493324]">
                        {card.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-stone-500">
                        {card.description}
                      </p>
                      {card.link ? (
                        <a
                          href={card.link}
                          className="mt-1.5 inline-block text-xs font-semibold text-[#8b5e3c] hover:underline"
                        >
                          {card.detail}
                        </a>
                      ) : (
                        <p className="mt-1.5 text-xs font-semibold text-stone-700">
                          {card.detail}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Artisan Guild Note */}
            <div className="mt-8 rounded-2xl border border-[#d9c7b4] bg-[#f4eadb]/50 p-6">
              <h4 className="flex items-center gap-2 text-sm font-bold text-[#493324]">
                <Heart size={16} className="fill-[#8b5e3c] text-[#8b5e3c]" />
                Are You a Craft Maker?
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">
                We are continually welcoming skilled potters, weavers, carvers,
                and artists to our collective.
              </p>
              <Link
                to="/signup"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#8b5e3c] hover:underline"
              >
                Join as an Artisan Maker →
              </Link>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm sm:p-10">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8b5e3c]">
                <MessageSquare size={16} />
                Send a Message
              </div>

              <h2 className="mt-2 font-serif text-2xl font-bold text-[#493324] sm:text-3xl">
                Leave Us a Note
              </h2>

              <p className="mt-2 text-sm text-stone-500">
                Fill out the form below and an ArtisanHub representative will reach out shortly.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs font-semibold uppercase tracking-wider text-stone-700"
                    >
                      Your Name <span className="text-[#8b5e3c]">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Kasun Silva"
                      required
                      className="mt-2 w-full rounded-lg border border-stone-200 bg-[#fffdf9] px-4 py-3 text-sm text-stone-800 placeholder-stone-400 transition focus:border-[#8b5e3c] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold uppercase tracking-wider text-stone-700"
                    >
                      Email Address <span className="text-[#8b5e3c]">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="mt-2 w-full rounded-lg border border-stone-200 bg-[#fffdf9] px-4 py-3 text-sm text-stone-800 placeholder-stone-400 transition focus:border-[#8b5e3c] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="inquiryType"
                      className="block text-xs font-semibold uppercase tracking-wider text-stone-700"
                    >
                      Inquiry Type
                    </label>
                    <select
                      id="inquiryType"
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-lg border border-stone-200 bg-[#fffdf9] px-4 py-3 text-sm text-stone-800 transition focus:border-[#8b5e3c] focus:outline-hidden"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Customer Support">Customer Support / Order Help</option>
                      <option value="Artisan Onboarding">Artisan Onboarding & Guild</option>
                      <option value="Custom & Bulk Orders">Custom & Bulk Orders</option>
                      <option value="Press & Collaborations">Press & Collaborations</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-xs font-semibold uppercase tracking-wider text-stone-700"
                    >
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Brief topic of your message"
                      className="mt-2 w-full rounded-lg border border-stone-200 bg-[#fffdf9] px-4 py-3 text-sm text-stone-800 placeholder-stone-400 transition focus:border-[#8b5e3c] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-xs font-semibold uppercase tracking-wider text-stone-700"
                  >
                    Your Message <span className="text-[#8b5e3c]">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us what you need help with..."
                    required
                    className="mt-2 w-full rounded-lg border border-stone-200 bg-[#fffdf9] px-4 py-3 text-sm text-stone-800 placeholder-stone-400 transition focus:border-[#8b5e3c] focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#8b5e3c] px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#70472c] disabled:opacity-60"
                >
                  <Send size={16} />
                  {submitting ? "Sending Message..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Quick FAQ Strip */}
      <section className="border-t border-[#eadfd3] bg-[#f4eadb]/40 px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-bold tracking-[0.25em] text-[#94633d]">
            FREQUENTLY ASKED QUESTIONS
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-[#493324]">
            Quick Answers Before You Reach Out
          </h2>

          <div className="mt-10 grid gap-6 text-left sm:grid-cols-2">
            <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-2xs">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#493324]">
                <CheckCircle2 size={16} className="text-[#8b5e3c]" />
                How are handmade items packaged?
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">
                All fragile ceramics, terracotta, and fabrics are wrapped in
                biodegradable, shock-absorbent eco-padding with custom wooden bracing where required.
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-2xs">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#493324]">
                <CheckCircle2 size={16} className="text-[#8b5e3c]" />
                Can I request custom artisan pieces?
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">
                Yes! Select &ldquo;Custom &amp; Bulk Orders&rdquo; in the form above
                with your dimensions or requirements, and we will pair you with a master artisan.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default ContactPage;
