import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Package, Printer } from "lucide-react";
import Navbar from "../components/navBar";
import Footer from "../components/footer";
import { normalizeReceipt } from "../utils/checkout";
import { formatCurrency } from "../utils/formatCurrency";
import { getUser } from "../utils/auth";

export default function OrderSuccessPage() {
  const { state } = useLocation();
  let receipt;
  try {
    if (!state?.receiptOwner || state.receiptOwner !== (getUser()?.id || getUser()?._id)) throw new Error("Receipt belongs to another session.");
    receipt = normalizeReceipt({ success: true, orders: state?.orders });
  }
  catch { receipt = null; }

  if (!receipt) return <><Navbar /><main className="min-h-[60vh] bg-[#faf7f2] px-6 py-16 text-center"><h1 className="text-2xl font-bold text-[#493324]">No order receipt to display</h1><p className="mt-3 text-stone-600">Open My Orders to check your order history and current status.</p><Link to="/orders" className="mt-6 inline-block rounded-full bg-[#8b5e3c] px-6 py-3 text-white">View My Orders</Link></main><Footer /></>;

  return <>
    <Navbar />
    <main className="min-h-screen bg-[#faf7f2] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-3xl border border-[#eadfd3] bg-white p-8 text-center">
          <CheckCircle2 size={56} className="mx-auto text-emerald-600" />
          <h1 className="mt-4 text-3xl font-bold text-[#493324]">Order placed successfully</h1>
          <p className="mt-3 text-sm text-stone-600">{receipt.orders.length} artisan order(s) created. Follow their progress in My Orders.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden"><Link to="/orders" className="rounded-full bg-[#8b5e3c] px-6 py-3 text-sm font-semibold text-white">Track My Orders</Link><Link to="/shop" className="rounded-full border border-[#d6b99c] px-6 py-3 text-sm text-[#8b5e3c]">Continue shopping</Link><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-6 py-3 text-sm"><Printer size={16} />Print receipt</button></div>
        </section>
        {receipt.orders.map((order) => <article key={order._id} className="rounded-3xl border border-[#eadfd3] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap justify-between gap-3 border-b border-stone-100 pb-4"><h2 className="font-bold text-[#493324]">{order.orderId}</h2><span className="text-sm text-stone-600">{order.seller?.name || "Artisan"} · {order.orderStatus || "placed"}</span></div>
          <div className="divide-y divide-stone-100">{order.items.map((item, index) => <div key={`${item.productId}-${index}`} className="flex items-center gap-3 py-4">
            {item.image ? <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover" /> : <Package size={32} className="text-[#8b5e3c]" />}
            <div className="flex-1"><p className="font-semibold text-[#493324]">{item.name}</p><p className="mt-1 text-xs text-stone-500">Qty: {item.quantity} × {formatCurrency(item.price)}</p></div><span className="text-sm font-bold text-[#8b5e3c]">{formatCurrency(item.subtotal)}</span>
          </div>)}</div>
          <div className="mt-4 grid gap-6 border-t border-stone-100 pt-5 sm:grid-cols-2">
            <div className="text-sm leading-6 text-stone-600"><h3 className="font-bold text-[#493324]">Delivery address</h3><p>{order.shippingAddress.fullName}</p><p>{[order.shippingAddress.addressLine1, order.shippingAddress.addressLine2, order.shippingAddress.city, order.shippingAddress.district, order.shippingAddress.postalCode, order.shippingAddress.country].filter(Boolean).join(", ")}</p><p>{order.shippingAddress.phone}</p><p className="mt-2">Delivery updates will appear in My Orders.</p></div>
            <dl className="space-y-2 text-sm text-stone-600"><div className="flex justify-between"><dt>Items subtotal</dt><dd>{formatCurrency(order.subtotal)}</dd></div><div className="flex justify-between"><dt>Delivery fee</dt><dd>{formatCurrency(order.deliveryFee)}</dd></div><div className="flex justify-between font-bold text-[#493324]"><dt>Order total</dt><dd>{formatCurrency(order.totalAmount)}</dd></div><div className="pt-2"><dt>Payment</dt><dd>{order.paymentMethod === "cash-on-delivery" ? "Cash on delivery" : "Card"} · {order.paymentStatus || "pending"}</dd></div></dl>
          </div>
        </article>)}
        <section className="rounded-3xl border border-[#eadfd3] bg-white p-6"><dl className="space-y-3 text-sm text-stone-600"><div className="flex justify-between"><dt>Total items subtotal</dt><dd>{formatCurrency(receipt.subtotal)}</dd></div><div className="flex justify-between"><dt>Total delivery fees</dt><dd>{formatCurrency(receipt.deliveryFee)}</dd></div><div className="flex justify-between text-lg font-bold text-[#493324]"><dt>Total for all orders</dt><dd>{formatCurrency(receipt.totalAmount)}</dd></div></dl><p className="mt-4 text-xs text-stone-500">For cash-on-delivery orders, have the amount shown for each order ready for the courier.</p></section>
      </div>
    </main>
    <Footer />
  </>;
}
