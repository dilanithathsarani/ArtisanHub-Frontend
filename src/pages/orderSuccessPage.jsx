import { useLocation, Link } from "react-router-dom";
import {
  CheckCircle2,
  Package,
  ArrowRight,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  Banknote,
  Printer,
  Sparkles,
} from "lucide-react";
import Navbar from "../components/navBar";
import Footer from "../components/footer";
import { formatCurrency } from "../utils/formatCurrency";

const OrderSuccessPage = () => {
  const location = useLocation();
  const state = location.state || {};

  const orders = Array.isArray(state.orders) ? state.orders : [];
  const shippingAddress = state.shippingAddress || {};
  const paymentMethod = state.paymentMethod || "cash-on-delivery";
  const totalAmount = state.totalAmount || 0;
  const items = Array.isArray(state.items) ? state.items : [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#faf7f2] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Celebratory Banner */}
          <div className="rounded-3xl border border-[#eadfd3] bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
              <CheckCircle2 size={46} strokeWidth={2.2} />
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-[#8b5e3c]">
              <Sparkles size={14} />
              Thank You For Your Support
            </div>

            <h1 className="mt-2 text-3xl font-extrabold text-[#493324] sm:text-4xl">
              Order Placed Successfully!
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-stone-600 sm:text-base">
              Your order has been sent to our Sri Lankan artisans. They are preparing your unique handcrafted creations with utmost care.
            </p>

            {/* Order Number Pills */}
            {orders.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs font-semibold text-stone-400 uppercase">
                  Order ID{orders.length > 1 ? "s" : ""}:
                </span>
                {orders.map((order, idx) => (
                  <span
                    key={order._id || order.orderId || idx}
                    className="rounded-full bg-[#f4eadb] px-3.5 py-1 text-xs font-bold text-[#8b5e3c]"
                  >
                    {order.orderId || `ORD-${order._id?.slice(-5)}`}
                  </span>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/orders"
                className="inline-flex items-center gap-2 rounded-full bg-[#8b5e3c] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#70472c]"
              >
                Track My Orders
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full border border-[#d6b99c] bg-white px-6 py-3 text-sm font-semibold text-[#8b5e3c] transition hover:bg-[#f4eadb]"
              >
                Explore More Crafts
              </Link>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-5 py-3 text-sm font-semibold text-stone-600 transition hover:bg-stone-100"
              >
                <Printer size={16} />
                Print Receipt
              </button>
            </div>
          </div>

          {/* Details Section */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Delivery Timeline & Courier Info */}
            <div className="rounded-3xl border border-[#eadfd3] bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4eadb] text-[#8b5e3c]">
                  <Truck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#493324]">Delivery Estimate</h3>
                  <p className="text-xs text-stone-500">Fast island-wide courier service</p>
                </div>
              </div>

              <div className="mt-5 space-y-3.5 text-sm text-stone-600">
                <div className="flex items-center gap-2.5">
                  <Calendar size={16} className="text-[#8b5e3c]" />
                  <span>
                    Estimated Delivery: <strong>3 to 5 business days</strong>
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-[#8b5e3c]" />
                  <div>
                    <p className="font-semibold text-stone-800">{shippingAddress.fullName || "Recipient"}</p>
                    <p className="text-xs text-stone-500">
                      {[
                        shippingAddress.addressLine1,
                        shippingAddress.addressLine2,
                        shippingAddress.city,
                        shippingAddress.district,
                        shippingAddress.postalCode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {shippingAddress.phone && (
                      <p className="mt-0.5 text-xs text-stone-500">Contact: {shippingAddress.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="rounded-3xl border border-[#eadfd3] bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4eadb] text-[#8b5e3c]">
                  {paymentMethod === "card" ? <CreditCard size={20} /> : <Banknote size={20} />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#493324]">Payment Summary</h3>
                  <p className="text-xs text-stone-500">
                    {paymentMethod === "card" ? "Paid Online via Card" : "Payment on Delivery"}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-2.5 text-sm text-stone-600">
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-semibold text-stone-800">
                    {paymentMethod === "card" ? "Credit / Debit Card" : "Cash on Delivery (COD)"}
                  </span>
                </div>
                {totalAmount > 0 && (
                  <div className="flex justify-between border-t border-stone-100 pt-2 text-base font-bold text-[#493324]">
                    <span>Total Amount:</span>
                    <span className="text-[#8b5e3c]">{formatCurrency(totalAmount)}</span>
                  </div>
                )}
                {paymentMethod === "cash-on-delivery" && (
                  <p className="mt-2 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-800">
                    💡 Please have the exact cash amount ready for the delivery partner upon arrival.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Items Summary (if provided) */}
          {items.length > 0 && (
            <div className="mt-8 rounded-3xl border border-[#eadfd3] bg-white p-6 shadow-sm sm:p-8">
              <h3 className="text-lg font-bold text-[#493324]">Items in this Order</h3>
              <div className="mt-4 divide-y divide-stone-100">
                {items.map((item, idx) => (
                  <div key={item.productId || idx} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-[#f4eadb]">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <Package size={20} className="text-stone-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-stone-800">{item.name}</h4>
                        <p className="text-xs text-stone-500">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#8b5e3c]">
                      {formatCurrency(Number(item.price || 0) * Number(item.quantity || 1))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default OrderSuccessPage;
