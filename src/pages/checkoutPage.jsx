import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CreditCard,
  Lock,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
  User,
} from "lucide-react";
import Navbar from "../components/navBar";
import Footer from "../components/footer";
import { formatCurrency } from "../utils/formatCurrency";

const CART_KEY = "artisanhub-cart";
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const DELIVERY_FEE = 350; // Standard Sri Lanka postal & courier delivery fee in LKR

const SRI_LANKA_DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Monaragala",
  "Ratnapura",
  "Kegalle",
];

const CheckoutPage = () => {
  const navigate = useNavigate();

  const [cart] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [currentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const token = localStorage.getItem("token") || "";

  // Shipping form state
  const [shippingAddress, setShippingAddress] = useState({
    fullName: currentUser?.name || "",
    phone: currentUser?.phone || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    district: "Galle",
    postalCode: "",
    country: "Sri Lanka",
  });

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState("cash-on-delivery"); // "cash-on-delivery" | "card"
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardHolder: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");

  useEffect(() => {
    // If cart is empty, redirect to cart page
    if (cart.length === 0) {
      toast("Your cart is empty. Add crafts before checking out.");
      navigate("/cart");
    }
  }, [cart, navigate]);

  const totalItems = cart.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0
  );

  const subtotal = cart.reduce(
    (total, item) =>
      total + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );

  const totalAmount = subtotal + DELIVERY_FEE;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Syncs items from localStorage to backend user cart before placing order
  const syncLocalCartToBackend = async (authToken) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Clear backend cart first to ensure clean state
    try {
      await axios.delete(`${apiUrl}/cart`, { headers });
    } catch {
      // ignore
    }

    // Add each local cart item into backend cart
    for (const item of cart) {
      const prodId = item.productId || item._id;
      if (!prodId) continue;
      try {
        await axios.post(
          `${apiUrl}/cart/items`,
          {
            productId: prodId,
            quantity: Number(item.quantity) || 1,
          },
          { headers }
        );
      } catch (err) {
        console.warn("Could not sync item to server cart:", prodId, err);
      }
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // 1. Validation
    if (!shippingAddress.fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!shippingAddress.phone.trim()) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    if (!shippingAddress.addressLine1.trim()) {
      toast.error("Please enter your street address.");
      return;
    }
    if (!shippingAddress.city.trim()) {
      toast.error("Please enter your city.");
      return;
    }
    if (!shippingAddress.postalCode.trim()) {
      toast.error("Please enter your postal code.");
      return;
    }

    if (paymentMethod === "card") {
      if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s+/g, "").length < 16) {
        toast.error("Please enter a valid 16-digit card number.");
        return;
      }
      if (!cardDetails.cardExpiry || !cardDetails.cardCvc) {
        toast.error("Please complete the card expiration and CVC.");
        return;
      }
    }

    // 2. Authentication check: Backend requires buyer auth
    if (!token) {
      toast.error("Please log in to finalize and track your artisan order.");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    try {
      setSubmitting(true);

      // Step A: Synchronize local cart items to the server's Cart model
      await syncLocalCartToBackend(token);

      // Step B: Submit order to backend
      const headers = { Authorization: `Bearer ${token}` };
      const orderPayload = {
        shippingAddress: {
          fullName: shippingAddress.fullName.trim(),
          phone: shippingAddress.phone.trim(),
          addressLine1: shippingAddress.addressLine1.trim(),
          addressLine2: shippingAddress.addressLine2.trim() || undefined,
          city: shippingAddress.city.trim(),
          district: shippingAddress.district.trim(),
          postalCode: shippingAddress.postalCode.trim(),
          country: "Sri Lanka",
        },
        paymentMethod,
      };

      const response = await axios.post(`${apiUrl}/orders`, orderPayload, {
        headers,
      });

      const data = response.data;

      // Step C: Clear local cart
      localStorage.setItem(CART_KEY, "[]");
      window.dispatchEvent(new Event("cartUpdated"));

      toast.success("Your handmade order has been placed successfully!");

      // Step D: Navigate to order success screen
      navigate("/order-success", {
        state: {
          orders: data.orders || [],
          orderCount: data.orderCount || 1,
          shippingAddress,
          paymentMethod,
          totalAmount,
          items: cart,
        },
      });
    } catch (err) {
      console.error("Order placement error:", err);
      const msg =
        err.response?.data?.message ||
        "Unable to place order. Please verify item availability and try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#faf7f2] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-stone-500 sm:text-sm">
            <Link to="/" className="transition hover:text-[#8b5e3c]">
              Home
            </Link>
            <span>/</span>
            <Link to="/cart" className="transition hover:text-[#8b5e3c]">
              Cart
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#8b5e3c]">Checkout</span>
          </nav>

          {/* Heading */}
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#a56d42]">
                Secure Marketplace Checkout
              </p>
              <h1 className="mt-1 text-3xl font-extrabold text-[#493324] sm:text-4xl">
                Complete Your Order
              </h1>
            </div>

            <Link
              to="/cart"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#8b5e3c] transition hover:text-[#70472c]"
            >
              <ArrowLeft size={16} />
              Return to Cart
            </Link>
          </div>

          {/* Non-logged-in buyer alert notice */}
          {!token && (
            <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                  <User size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900">
                    Ordering as an ArtisanHub Member
                  </h4>
                  <p className="text-xs text-amber-800">
                    Sign in to track courier delivery and support your favorite makers seamlessly.
                  </p>
                </div>
              </div>

              <Link
                to="/login"
                state={{ from: "/checkout" }}
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#8b5e3c] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#70472c]"
              >
                Log In / Register
              </Link>
            </div>
          )}

          {/* Checkout Grid */}
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Left Column: Delivery & Payment Details */}
            <div className="space-y-8 lg:col-span-7">
              {/* Shipping Address Section */}
              <section className="rounded-3xl border border-[#eadfd3] bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-3 border-b border-[#eadfd3] pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4eadb] text-[#8b5e3c]">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#493324]">1. Delivery Address</h2>
                    <p className="text-xs text-stone-500">Where should our artisans dispatch your package?</p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={shippingAddress.fullName}
                        onChange={handleInputChange}
                        placeholder="Recipient's full name"
                        className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#faf7f2] p-3 text-sm outline-none transition focus:border-[#8b5e3c] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={shippingAddress.phone}
                        onChange={handleInputChange}
                        placeholder="e.g. 0771234567"
                        className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#faf7f2] p-3 text-sm outline-none transition focus:border-[#8b5e3c] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                      Street Address Line 1 *
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      required
                      value={shippingAddress.addressLine1}
                      onChange={handleInputChange}
                      placeholder="House number, street name"
                      className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#faf7f2] p-3 text-sm outline-none transition focus:border-[#8b5e3c] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                      Apartment, Suite, Unit (Optional)
                    </label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={shippingAddress.addressLine2}
                      onChange={handleInputChange}
                      placeholder="Floor, building, or landmark"
                      className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#faf7f2] p-3 text-sm outline-none transition focus:border-[#8b5e3c] focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                        City / Town *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={shippingAddress.city}
                        onChange={handleInputChange}
                        placeholder="e.g. Galle"
                        className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#faf7f2] p-3 text-sm outline-none transition focus:border-[#8b5e3c] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                        District *
                      </label>
                      <select
                        name="district"
                        value={shippingAddress.district}
                        onChange={handleInputChange}
                        className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#faf7f2] p-3 text-sm outline-none transition focus:border-[#8b5e3c] focus:bg-white"
                      >
                        {SRI_LANKA_DISTRICTS.map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        required
                        value={shippingAddress.postalCode}
                        onChange={handleInputChange}
                        placeholder="e.g. 80000"
                        className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#faf7f2] p-3 text-sm outline-none transition focus:border-[#8b5e3c] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                      Country
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Sri Lanka"
                      className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-stone-200 bg-stone-100 p-3 text-sm text-stone-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                      Notes for Artisan / Courier (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Special delivery instructions or packaging requests..."
                      className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#faf7f2] p-3 text-sm outline-none transition focus:border-[#8b5e3c] focus:bg-white"
                    />
                  </div>
                </div>
              </section>

              {/* Payment Method Section */}
              <section className="rounded-3xl border border-[#eadfd3] bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-3 border-b border-[#eadfd3] pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4eadb] text-[#8b5e3c]">
                    <Banknote size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#493324]">2. Payment Method</h2>
                    <p className="text-xs text-stone-500">Choose how you'd like to pay for your handcrafted items</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {/* Option 1: Cash on Delivery */}
                  <label
                    className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition ${
                      paymentMethod === "cash-on-delivery"
                        ? "border-[#8b5e3c] bg-[#faf7f2]"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash-on-delivery"
                      checked={paymentMethod === "cash-on-delivery"}
                      onChange={() => setPaymentMethod("cash-on-delivery")}
                      className="mt-1 text-[#8b5e3c] focus:ring-[#8b5e3c]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Banknote size={18} className="text-[#8b5e3c]" />
                        <span className="font-bold text-[#493324]">Cash on Delivery (COD)</span>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                          Recommended
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-stone-600">
                        Pay cash directly to the courier upon delivery at your doorstep anywhere in Sri Lanka.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Credit / Debit Card */}
                  <label
                    className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition ${
                      paymentMethod === "card"
                        ? "border-[#8b5e3c] bg-[#faf7f2]"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="mt-1 text-[#8b5e3c] focus:ring-[#8b5e3c]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard size={18} className="text-[#8b5e3c]" />
                        <span className="font-bold text-[#493324]">Credit / Debit Card</span>
                      </div>
                      <p className="mt-1 text-xs text-stone-600">
                        Secure online payment with Visa, MasterCard, or American Express.
                      </p>

                      {paymentMethod === "card" && (
                        <div className="mt-4 space-y-3 rounded-xl border border-[#eadfd3] bg-white p-4">
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500">
                              Card Number
                            </label>
                            <input
                              type="text"
                              name="cardNumber"
                              maxLength={19}
                              value={cardDetails.cardNumber}
                              onChange={handleCardInputChange}
                              placeholder="4242 •••• •••• 4242"
                              className="mt-1 w-full rounded-lg border border-stone-200 p-2.5 text-sm outline-none focus:border-[#8b5e3c]"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500">
                                Expiration (MM/YY)
                              </label>
                              <input
                                type="text"
                                name="cardExpiry"
                                maxLength={5}
                                value={cardDetails.cardExpiry}
                                onChange={handleCardInputChange}
                                placeholder="12/28"
                                className="mt-1 w-full rounded-lg border border-stone-200 p-2.5 text-sm outline-none focus:border-[#8b5e3c]"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500">
                                CVC / CVV
                              </label>
                              <input
                                type="password"
                                name="cardCvc"
                                maxLength={4}
                                value={cardDetails.cardCvc}
                                onChange={handleCardInputChange}
                                placeholder="•••"
                                className="mt-1 w-full rounded-lg border border-stone-200 p-2.5 text-sm outline-none focus:border-[#8b5e3c]"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </section>
            </div>

            {/* Right Column: Order Summary & Placement */}
            <div className="lg:col-span-5">
              <aside className="sticky top-28 rounded-3xl border border-[#eadfd3] bg-white p-6 shadow-sm sm:p-8">
                <h3 className="text-xl font-bold text-[#493324]">Order Summary</h3>
                <p className="mt-1 text-xs text-stone-500">{totalItems} handmade creation(s) in cart</p>

                {/* Items List */}
                <div className="mt-6 max-h-72 space-y-3.5 overflow-y-auto pr-1">
                  {cart.map((item, idx) => (
                    <div key={item.productId || idx} className="flex items-center gap-3.5 border-b border-stone-100 pb-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#f4eadb]">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-stone-400">
                            <Package size={20} />
                          </div>
                        )}
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#8b5e3c] text-[10px] font-bold text-white shadow">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-semibold text-[#493324]">{item.name}</h4>
                        <p className="text-xs text-stone-500">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>

                      <div className="text-right text-sm font-bold text-[#8b5e3c]">
                        {formatCurrency(Number(item.price || 0) * Number(item.quantity || 1))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals Breakdown */}
                <div className="mt-6 space-y-2.5 border-t border-[#eadfd3] pt-5 text-sm text-stone-600">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-stone-800">{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="inline-flex items-center gap-1.5">
                      <Truck size={15} className="text-[#8b5e3c]" />
                      Courier Delivery Fee
                    </span>
                    <span className="font-semibold text-stone-800">{formatCurrency(DELIVERY_FEE)}</span>
                  </div>

                  <div className="flex items-baseline justify-between border-t border-[#eadfd3] pt-3">
                    <span className="text-base font-bold text-[#493324]">Total Due</span>
                    <span className="text-2xl font-extrabold text-[#8b5e3c]">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#8b5e3c] py-4 text-sm font-bold text-white shadow-md transition hover:bg-[#70472c] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Lock size={16} />
                  {submitting ? "Placing Your Order..." : `Place Order • ${formatCurrency(totalAmount)}`}
                </button>

                {/* Trust Guarantees */}
                <div className="mt-6 space-y-2 border-t border-[#eadfd3] pt-4 text-xs text-stone-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <span>100% Secure Checkout with Buyer Protection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Your purchase directly supports rural Sri Lankan artisans</span>
                  </div>
                </div>
              </aside>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default CheckoutPage;
