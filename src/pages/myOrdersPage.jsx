import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Calendar,
  Clock,
  MapPin,
  Package,
  RotateCcw,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import Navbar from "../components/navBar";
import Footer from "../components/footer";
import { formatCurrency } from "../utils/formatCurrency";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const STATUS_TABS = [
  { id: "all", label: "All Orders" },
  { id: "pending", label: "Pending" },
  { id: "processing", label: "In Workshop" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

const MyOrdersPage = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    if (!token) {
      toast("Please log in to view and track your orders.");
      navigate("/login", { state: { from: "/orders" } });
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${apiUrl}/orders/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.orders)
            ? data.orders
            : Array.isArray(data.data)
              ? data.data
              : [];

        // Sort by newest first
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        setOrders(list);
      } catch (err) {
        console.error("Fetch orders error:", err);
        setError(
          err.response?.data?.message ||
            "Unable to load your order history. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, navigate]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      setCancellingOrderId(orderId);
      await axios.put(
        `${apiUrl}/orders/${orderId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Order has been cancelled successfully.");

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: "cancelled" } : order
        )
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Could not cancel this order."
      );
    } finally {
      setCancellingOrderId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    return orders.filter((order) => order.status === activeTab);
  }, [orders, activeTab]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
            <Clock size={13} />
            Pending Artisan Acceptance
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200">
            <Package size={13} />
            In Workshop Preparation
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 border border-purple-200">
            <Truck size={13} />
            Dispatched & On the Way
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            Delivered
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-600 border border-stone-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
            {status}
          </span>
        );
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#faf7f2] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-stone-500 sm:text-sm">
            <Link to="/" className="transition hover:text-[#8b5e3c]">
              Home
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#8b5e3c]">My Orders</span>
          </nav>

          {/* Page Heading */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#a56d42]">
                Order History & Tracking
              </p>
              <h1 className="mt-1 text-3xl font-extrabold text-[#493324] sm:text-4xl">
                My Handmade Orders
              </h1>
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full border border-[#d6b99c] bg-white px-5 py-2.5 text-xs font-semibold text-[#8b5e3c] transition hover:bg-[#f4eadb]"
            >
              <ShoppingBag size={15} />
              Continue Shopping
            </Link>
          </div>

          {/* Status Tabs */}
          <div className="mb-8 flex overflow-x-auto border-b border-[#eadfd3] pb-1 scrollbar-none">
            <div className="flex gap-2">
              {STATUS_TABS.map((tab) => {
                const count =
                  tab.id === "all"
                    ? orders.length
                    : orders.filter((o) => o.status === tab.id).length;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition sm:text-sm ${
                      activeTab === tab.id
                        ? "bg-[#8b5e3c] text-white shadow-sm"
                        : "bg-white text-stone-600 hover:bg-[#f4eadb] hover:text-stone-800"
                    }`}
                  >
                    {tab.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-3xl border border-stone-200 bg-white p-6" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-white p-12 text-center">
              <XCircle size={40} className="mx-auto text-red-500" />
              <h3 className="mt-4 text-xl font-bold text-[#493324]">Could Not Load Orders</h3>
              <p className="mt-2 text-sm text-stone-600">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#8b5e3c] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#70472c]"
              >
                <RotateCcw size={15} />
                Try Again
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-3xl border border-[#eadfd3] bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f4eadb] text-[#8b5e3c]">
                <Package size={30} />
              </div>
              <h3 className="mt-5 text-xl font-bold text-[#493324]">
                {activeTab === "all"
                  ? "You Haven't Placed Any Orders Yet"
                  : `No ${activeTab} orders found`}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
                Support local Sri Lankan artisans by exploring unique pottery, jewelry, batiks, and woodwork.
              </p>
              <Link
                to="/shop"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#8b5e3c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#70472c]"
              >
                Explore Handmade Crafts
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => {
                const orderId = order.orderId || `ORD-${order._id?.slice(-5)}`;
                const date = order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Recently";

                const items = Array.isArray(order.items) ? order.items : [];
                const shipping = order.shippingAddress || {};
                const canCancel = order.status === "pending";

                return (
                  <article
                    key={order._id}
                    className="overflow-hidden rounded-3xl border border-[#eadfd3] bg-white shadow-sm transition hover:shadow-md"
                  >
                    {/* Order Top Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eadfd3] bg-[#faf7f2] p-5 sm:px-8">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-sm font-bold text-[#493324]">
                          {orderId}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-stone-500">
                          <Calendar size={13} />
                          {date}
                        </span>
                        {order.seller?.name && (
                          <span className="text-xs text-stone-500">
                            Artisan: <strong>{order.seller.name}</strong>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Order Body */}
                    <div className="p-6 sm:p-8">
                      {/* Products List */}
                      <div className="divide-y divide-stone-100">
                        {items.map((item, idx) => {
                          const prod = item.product || {};
                          const image =
                            (typeof prod.images?.[0] === "string" ? prod.images[0] : null) ||
                            prod.images?.[0]?.url ||
                            prod.image ||
                            item.image ||
                            "";
                          const name = prod.name || item.name || "Handmade Craft";
                          const price = Number(item.price || prod.price || 0);

                          return (
                            <div key={item._id || idx} className="flex items-center justify-between py-3.5">
                              <div className="flex items-center gap-4">
                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f4eadb]">
                                  {image ? (
                                    <img src={image} alt={name} className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-stone-400">
                                      <Package size={22} />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-[#493324] sm:text-base">
                                    {prod._id ? (
                                      <Link to={`/products/${prod._id}`} className="transition hover:text-[#8b5e3c]">
                                        {name}
                                      </Link>
                                    ) : (
                                      name
                                    )}
                                  </h4>
                                  <p className="text-xs text-stone-500">
                                    Qty: {item.quantity} × {formatCurrency(price)}
                                  </p>
                                </div>
                              </div>

                              <div className="text-right text-sm font-bold text-[#8b5e3c]">
                                {formatCurrency(price * (item.quantity || 1))}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer Details Strip */}
                      <div className="mt-6 flex flex-col gap-4 border-t border-[#eadfd3] pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs text-stone-500">
                          <p className="flex items-center gap-1 text-stone-600">
                            <MapPin size={13} className="text-[#8b5e3c]" />
                            Delivery to:{" "}
                            <strong>
                              {[shipping.fullName, shipping.city, shipping.district].filter(Boolean).join(", ")}
                            </strong>
                          </p>
                          <p className="mt-1">
                            Payment:{" "}
                            <span className="capitalize font-medium text-stone-700">
                              {order.paymentMethod?.replace("-", " ") || "Cash on Delivery"}
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs uppercase tracking-wider text-stone-400">Order Total</p>
                            <p className="text-lg font-bold text-[#8b5e3c]">
                              {formatCurrency(order.totalAmount)}
                            </p>
                          </div>

                          {canCancel && (
                            <button
                              type="button"
                              disabled={cancellingOrderId === order._id}
                              onClick={() => handleCancelOrder(order._id)}
                              className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                            >
                              {cancellingOrderId === order._id ? "Cancelling..." : "Cancel Order"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default MyOrdersPage;
