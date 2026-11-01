import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Package } from "lucide-react";
import { canCancelOrder, cancelBuyerOrder, formatOrderDate, statusLabel } from "../utils/orders";
import { getApiError } from "../utils/api";
import { formatCurrency } from "../utils/formatCurrency";
import OrderTracking from "./OrderTracking";

export default function OrderCard({ order, detailed = false, refresh }) {
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const cancel = async () => {
    if (lock.current || !window.confirm(`Cancel order ${order.orderId}?`)) return;
    lock.current = true;
    setBusy(true);
    try {
      await cancelBuyerOrder(order._id);
      toast.success("Order cancellation confirmed.");
    } catch (failure) { toast.error(getApiError(failure, failure.message)); }
    finally {
      // Also refresh on rejection: the seller may have advanced the status.
      await refresh();
      lock.current = false;
      setBusy(false);
    }
  };
  const shipping = order.shippingAddress || {};
  return <article aria-busy={busy} className="rounded-3xl border border-[#eadfd3] bg-white p-5 shadow-sm sm:p-8">
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-100 pb-4"><div><h2 className="font-bold text-[#493324]">{detailed ? order.orderId : <Link to={`/orders/${encodeURIComponent(order._id)}`} className="hover:underline">{order.orderId}</Link>}</h2><p className="mt-1 text-xs text-stone-500">Placed {formatOrderDate(order.createdAt)}{order.seller?.name && ` · ${order.seller.name}`}</p></div><span role="status" className="rounded-full bg-[#f4eadb] px-3 py-1 text-xs font-bold text-[#70472c]">{statusLabel(order.orderStatus)}</span></div>
    <OrderTracking status={order.orderStatus} />
    {order.cancellationReason && <p className="mb-4 text-sm text-stone-600">Cancellation reason: {order.cancellationReason}</p>}
    <div className="divide-y divide-stone-100">{order.items.map((item, index) => {
      const productId = typeof item.product === "string" ? item.product : item.product?._id;
      return <div key={item.productId || index} className="flex items-center gap-3 py-3">
        {item.image ? <img src={item.image} alt={item.name} className="h-14 w-14 shrink-0 rounded-xl object-cover" /> : <Package size={28} className="shrink-0 text-[#8b5e3c]" />}
        <div className="min-w-0 flex-1"><h3 className="text-sm font-semibold text-[#493324]">{productId ? <Link to={`/products/${encodeURIComponent(productId)}`} className="hover:underline">{item.name}</Link> : item.name}</h3><p className="mt-1 text-xs text-stone-500">Qty: {item.quantity} × {formatCurrency(item.price)}</p></div><span className="text-sm font-bold text-[#8b5e3c]">{formatCurrency(item.subtotal ?? item.price * item.quantity)}</span>
      </div>;
    })}</div>
    <div className="mt-5 grid gap-5 border-t border-stone-100 pt-5 sm:grid-cols-2"><div className="text-sm leading-6 text-stone-600"><h3 className="font-semibold text-[#493324]">Delivery to</h3><p>{shipping.fullName}</p><p>{(detailed ? [shipping.addressLine1, shipping.addressLine2, shipping.city, shipping.district, shipping.postalCode, shipping.country] : [shipping.city, shipping.district]).filter(Boolean).join(", ")}</p>{detailed && <p>{shipping.phone}</p>}{detailed && <><p className="mt-2">Last updated: {formatOrderDate(order.updatedAt)}</p>{order.deliveredAt && <p>Delivered: {formatOrderDate(order.deliveredAt)}</p>}</>}</div>
      <dl className="space-y-2 text-sm text-stone-600">{detailed && <><div className="flex justify-between"><dt>Items subtotal</dt><dd>{formatCurrency(order.subtotal)}</dd></div><div className="flex justify-between"><dt>Delivery fee</dt><dd>{formatCurrency(order.deliveryFee)}</dd></div></>}<div className="flex justify-between font-bold text-[#493324]"><dt>Order total</dt><dd>{formatCurrency(order.totalAmount)}</dd></div><div><dt className="sr-only">Payment</dt><dd>{order.paymentMethod === "cash-on-delivery" ? "Cash on delivery" : "Card"} · Payment {order.paymentStatus || "pending"}</dd></div></dl>
    </div>
    <div className="mt-5 flex flex-wrap justify-end gap-3">{!detailed && <Link to={`/orders/${encodeURIComponent(order._id)}`} className="rounded-full border border-[#d6b99c] px-4 py-2 text-sm text-[#8b5e3c]">View details</Link>}{canCancelOrder(order) && <button type="button" disabled={busy} onClick={cancel} className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50">{busy ? "Cancelling..." : "Cancel order"}</button>}</div>
  </article>;
}
