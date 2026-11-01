import { Link, useParams } from "react-router-dom";
import Navbar from "../components/navBar";
import Footer from "../components/footer";
import LoadingSpinner from "../components/LoadingSpinner";
import OrderCard from "../components/OrderCard";
import useOrders from "../hooks/useOrders";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { data: order, loading, error, refresh } = useOrders(id);
  return <><Navbar /><main aria-busy={loading} className="min-h-screen bg-[#faf7f2] px-4 py-10 sm:px-6"><div className="mx-auto max-w-4xl"><Link to="/orders" className="text-sm text-[#8b5e3c] underline">Back to My Orders</Link><div className="my-6 flex items-center justify-between gap-4"><h1 className="text-3xl font-bold text-[#493324]">Order details</h1><button type="button" disabled={loading} onClick={() => refresh()} className="rounded-full border border-[#d6b99c] bg-white px-4 py-2 text-sm text-[#8b5e3c] disabled:opacity-50">Refresh</button></div>{loading ? <LoadingSpinner message="Loading order details..." /> : error ? <div role="alert" className="rounded-3xl border border-red-200 bg-white p-8"><p className="text-sm text-stone-600">{error}</p><button type="button" onClick={() => refresh()} className="mt-4 text-sm text-[#8b5e3c] underline">Try again</button></div> : order && <OrderCard order={order} detailed refresh={refresh} />}</div></main><Footer /></>;
}
