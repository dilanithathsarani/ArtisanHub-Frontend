import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Banknote, MapPin, Package, ShoppingBag } from "lucide-react";
import Navbar from "../components/navBar";
import Footer from "../components/footer";
import LoadingSpinner from "../components/LoadingSpinner";
import useCart from "../hooks/useCart";
import { loadCart } from "../utils/cart";
import { getUser } from "../utils/auth";
import { getApiError } from "../utils/api";
import { formatCurrency } from "../utils/formatCurrency";
import { ADDRESS_FIELDS, DISTRICTS, validateAddress, getAddressErrors, placeOrder, hasUncertainOrder, acknowledgeOrderCheck } from "../utils/checkout";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items: cart, loading, pending, error: cartError, retry } = useCart();
  const [address, setAddress] = useState(() => ({ fullName: getUser()?.name || "", phone: getUser()?.phone || "", addressLine1: "", addressLine2: "", city: "", district: "", postalCode: "" }));
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uncertain, setUncertain] = useState(hasUncertainOrder);
  const submitLock = useRef(false);
  const errorSummary = useRef(null);
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const unavailable = cart.some((item) => item.unavailable || (item.stock != null && item.quantity > item.stock));

  useEffect(() => {
    if (!loading && !cartError && cart.length === 0 && !submitLock.current && !uncertain) navigate("/cart", { replace: true });
  }, [loading, cartError, cart.length, navigate, uncertain]);

  const handleChange = ({ target: { name, value } }) => {
    setAddress((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitLock.current || loading || pending || cartError || uncertain) return;
    const validation = validateAddress(address);
    setErrors(validation);
    if (Object.keys(validation).length) {
      setError("Please correct the highlighted delivery details.");
      document.getElementById(`shipping-${Object.keys(validation)[0]}`)?.focus();
      return;
    }
    if (unavailable || cart.length === 0) { setError("Update unavailable items in your cart before placing an order."); return; }
    submitLock.current = true;
    setSubmitting(true);
    setError("");
    try {
      const receipt = await placeOrder(address);
      // Only confirmed server orders reach this screen. The backend clears the
      // cart in the order transaction; a failed request never clears it here.
      navigate("/order-success", { replace: true, state: { orders: receipt.orders, receiptOwner: getUser()?.id || getUser()?._id } });
      void loadCart().catch(() => {});
    } catch (failure) {
      setErrors(getAddressErrors(failure));
      setUncertain(!!failure.orderUncertain || hasUncertainOrder());
      setError(failure.orderUncertain
        ? "We could not confirm the result. Your order may have been placed. Check My Orders before trying again."
        : getApiError(failure, failure.message || "Unable to place your order. Please try again."));
      submitLock.current = false;
      setSubmitting(false);
      requestAnimationFrame(() => errorSummary.current?.focus());
    }
  };

  if (loading && !submitting) return <><Navbar /><LoadingSpinner message="Loading your checkout items..." /><Footer /></>;
  if (cartError) return <><Navbar /><main role="alert" className="mx-auto max-w-4xl p-8"><p>{cartError}</p><button type="button" className="mt-4 underline" onClick={() => retry().catch(() => {})}>Retry cart synchronization</button><Link to="/cart" className="ml-4 underline">Back to cart</Link></main><Footer /></>;

  return <>
    <Navbar />
    <main className="min-h-screen bg-[#faf7f2] px-4 py-10 sm:px-6" aria-busy={submitting}>
      <div className="mx-auto max-w-6xl">
        <Link to="/cart" className="text-sm text-[#8b5e3c] hover:underline">Back to cart</Link>
        <h1 className="mt-5 text-3xl font-bold text-[#493324]">Checkout</h1>
        <p className="mb-8 mt-2 text-sm text-stone-600">Confirm your delivery details and place your handmade order.</p>
        {(error || uncertain) && <div ref={errorSummary} tabIndex={-1} role="alert" className="mb-6 rounded-2xl border border-red-200 bg-white p-5 text-sm text-red-800">
          <p>{error || "Check My Orders before placing another order."}</p>
          {uncertain && <div className="mt-3 flex flex-wrap gap-4">
            <Link to="/orders" className="font-semibold underline">Check My Orders</Link>
            <button type="button" className="underline" onClick={async () => {
              try { await loadCart(); acknowledgeOrderCheck(); setUncertain(false); setError(""); }
              catch (failure) { setError(getApiError(failure, "Unable to reload your cart.")); }
            }}>I checked my orders; reload cart</button>
          </div>}
        </div>}
        {unavailable && <p role="alert" className="mb-6 text-red-700">Some items are no longer available in the requested quantity. <Link className="underline" to="/cart">Update your cart</Link>.</p>}
        <form noValidate onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-[#eadfd3] bg-white p-6 sm:p-8">
              <h2 className="mb-6 flex items-center gap-3 text-xl font-bold text-[#493324]"><MapPin size={22} /> Delivery details</h2>
              <fieldset disabled={submitting} className="grid gap-5 sm:grid-cols-2">
                <legend className="sr-only">Delivery address in Sri Lanka</legend>
                {ADDRESS_FIELDS.map(({ name, label, type = "text", autoComplete }) => <div key={name} className={name.startsWith("addressLine") ? "sm:col-span-2" : ""}>
                  <label htmlFor={`shipping-${name}`} className="mb-2 block text-sm font-semibold text-stone-700">{label}{name !== "addressLine2" && " *"}</label>
                  {name === "district" ? <select id={`shipping-${name}`} name={name} value={address[name]} onChange={handleChange} autoComplete={autoComplete} required aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-error` : undefined} className="w-full rounded-xl border border-stone-300 bg-[#faf7f2] p-3 text-sm focus:outline-[#8b5e3c]">
                    <option value="">Select district</option>{DISTRICTS.map((district) => <option key={district}>{district}</option>)}
                  </select> : <input id={`shipping-${name}`} name={name} type={type} value={address[name]} onChange={handleChange} autoComplete={autoComplete} required={name !== "addressLine2"} inputMode={name === "postalCode" ? "numeric" : undefined} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-error` : undefined} className="w-full rounded-xl border border-stone-300 bg-[#faf7f2] p-3 text-sm focus:outline-[#8b5e3c]" />}
                  {errors[name] && <p id={`${name}-error`} className="mt-2 text-xs text-red-700">{errors[name]}</p>}
                </div>)}
                <p className="text-sm text-stone-600 sm:col-span-2">Country: Sri Lanka</p>
              </fieldset>
            </section>
            <section className="rounded-3xl border border-[#eadfd3] bg-white p-6 sm:p-8">
              <h2 className="flex items-center gap-3 text-xl font-bold text-[#493324]"><Banknote size={22} /> Cash on delivery</h2>
              <p className="mt-3 text-sm leading-6 text-stone-600">Pay the courier when your order arrives. Card payments are currently unavailable.</p>
            </section>
          </div>
          <aside className="h-fit rounded-3xl border border-[#eadfd3] bg-white p-6 lg:sticky lg:top-28">
            <h2 className="text-xl font-bold text-[#493324]">Order summary</h2>
            <div className="my-6 max-h-80 space-y-4 overflow-y-auto">
              {cart.map((item) => <div key={item.productId} className="flex items-center gap-3 border-b border-stone-100 pb-4">
                {item.image ? <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover" /> : <Package size={32} className="text-[#8b5e3c]" />}
                <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-[#493324]">{item.name}</p><p className="mt-1 text-xs text-stone-500">Qty: {item.quantity} × {formatCurrency(item.price)}</p></div>
                <span className="text-sm font-bold text-[#8b5e3c]">{formatCurrency(item.quantity * Number(item.price))}</span>
              </div>)}
            </div>
            <div className="flex justify-between font-bold text-[#493324]"><span>Items subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <p className="mt-4 text-xs leading-6 text-stone-600">Delivery is charged separately for each artisan order. The server calculates final delivery fees and totals when the order is placed; they appear on your receipt.</p>
            <button type="submit" disabled={submitting || loading || pending || unavailable || uncertain || cart.length === 0} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#8b5e3c] px-4 py-4 text-sm font-bold text-white hover:bg-[#70472c] disabled:cursor-not-allowed disabled:opacity-50"><ShoppingBag size={18} />{submitting ? "Placing your order..." : "Place cash-on-delivery order"}</button>
          </aside>
        </form>
      </div>
    </main>
    <Footer />
  </>;
}
