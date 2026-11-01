import { useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, ShoppingBag } from "lucide-react";
import Navbar from "../components/navBar";
import Footer from "../components/footer";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import OrderCard from "../components/OrderCard";
import useOrders from "../hooks/useOrders";
import { ORDER_FILTERS, statusLabel, pageOrders } from "../utils/orders";

export default function MyOrdersPage() {
  const { data, loading, error, refresh } = useOrders();
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const orders = data || [];
  const result = pageOrders(orders, filter, page);
  return <>
    <Navbar />
    <main aria-busy={loading} className="min-h-screen bg-[#faf7f2] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4"><div><Link to="/" className="text-sm text-[#8b5e3c] hover:underline">Home</Link><h1 className="mt-3 text-3xl font-bold text-[#493324]">My Orders</h1><p className="mt-2 text-sm text-stone-600">Order history and delivery tracking from your artisans.</p></div><div className="flex gap-3"><button type="button" disabled={loading} onClick={() => refresh()} className="inline-flex items-center gap-2 rounded-full border border-[#d6b99c] bg-white px-4 py-2 text-sm text-[#8b5e3c] disabled:opacity-50"><RefreshCw size={16} />Refresh</button><Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-[#8b5e3c] px-4 py-2 text-sm text-white"><ShoppingBag size={16} />Shop</Link></div></div>
        <div aria-label="Filter orders by status" className="mb-6 flex gap-2 overflow-x-auto pb-3">{ORDER_FILTERS.map((status) => <button key={status} type="button" aria-pressed={status === filter} onClick={() => { setFilter(status); setPage(1); }} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${status === filter ? "bg-[#8b5e3c] text-white" : "bg-white text-stone-600"}`}>{status === "all" ? "All orders" : statusLabel(status)} ({status === "all" ? orders.length : orders.filter((order) => order.orderStatus === status).length})</button>)}</div>
        {loading ? <LoadingSpinner message="Loading your orders..." /> : error ? <div role="alert" className="rounded-3xl border border-red-200 bg-white p-8"><h2 className="text-xl font-bold text-[#493324]">Could not load orders</h2><p className="mt-3 text-sm text-stone-600">{error}</p><button type="button" onClick={() => refresh()} className="mt-4 text-sm font-semibold text-[#8b5e3c] underline">Try again</button></div> : result.count === 0 ? <EmptyState title={filter === "all" ? "You have no orders yet" : `No ${statusLabel(filter).toLowerCase()} orders`} description="Your artisan orders will appear here after checkout." action={<Link to="/shop" className="text-[#8b5e3c] underline">Explore handmade crafts</Link>} /> : <>
          <p role="status" className="mb-4 text-sm text-stone-500">Showing {(result.page - 1) * 5 + 1}–{Math.min(result.page * 5, result.count)} of {result.count} orders</p>
          <div className="space-y-6">{result.items.map((order) => <OrderCard key={order._id} order={order} refresh={refresh} />)}</div>
          {result.pages > 1 && <nav aria-label="Order history pages" className="mt-7 flex items-center justify-center gap-5"><button type="button" disabled={result.page <= 1} onClick={() => setPage(result.page - 1)} className="rounded-full border border-[#d6b99c] px-4 py-2 text-sm disabled:opacity-40">Previous</button><span aria-live="polite" className="text-sm text-stone-600">Page {result.page} of {result.pages}</span><button type="button" disabled={result.page >= result.pages} onClick={() => setPage(result.page + 1)} className="rounded-full border border-[#d6b99c] px-4 py-2 text-sm disabled:opacity-40">Next</button></nav>}
        </>}
      </div>
    </main>
    <Footer />
  </>;
}
