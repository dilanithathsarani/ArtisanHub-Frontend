import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/navBar';
import Footer from '../components/footer';
import { AUTH_EVENT, getToken } from '../utils/auth';
import { getApiError } from '../utils/api';
import { loadSellerDashboard } from '../utils/sellerDashboard';
import { formatCurrency } from '../utils/formatCurrency';
import { statusLabel } from '../utils/orders';

export default function SellerDashboardPage() {
  const [state, setState] = useState({ loading: true });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const token = getToken();
    let active = true;
    const isCurrent = () => active && token === getToken();
    const invalidate = () => {
      active = false;
      controller.abort();
      setState({ loading: true });
      setRevision(value => value + 1);
    };
    window.addEventListener(AUTH_EVENT, invalidate);
    window.addEventListener('storage', invalidate);
    loadSellerDashboard({ signal: controller.signal, isCurrent }).then(result => {
      if (isCurrent() && result) setState({ loading: false, ...result });
    }).catch(error => {
      if (isCurrent() && !controller.signal.aborted) setState({ loading: false, error: getApiError(error, error.message) });
    });
    return () => {
      active = false;
      controller.abort();
      window.removeEventListener(AUTH_EVENT, invalidate);
      window.removeEventListener('storage', invalidate);
    };
  }, [revision]);

  const dashboard = state.dashboard;
  const refresh = () => { setState({ loading: true }); setRevision(value => value + 1); };
  return <><Navbar /><main className="mx-auto min-h-[65vh] max-w-6xl px-5 py-12 text-stone-800">
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="font-serif text-4xl text-[#70472c]">Seller dashboard</h1><p className="mt-3 text-stone-600">An overview of your shop’s activity across all time.</p></div>
      <Link to="/seller" className="rounded-full border border-[#d9c7b4] px-5 py-3 text-[#70472c]">Manage shop profile</Link>
    </div>
    <button disabled={state.loading} onClick={refresh} className="mb-6 underline disabled:opacity-50">{state.loading ? 'Loading…' : state.error ? 'Retry dashboard' : 'Refresh dashboard'}</button>
    {state.loading && <p role="status">Loading your seller dashboard…</p>}
    {state.error && <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">{state.error}</p>}
    {state.access === 'denied' && <section className="rounded-xl bg-[#f4eadb] p-6"><h2 className="text-xl font-semibold">Approved seller access required</h2><p className="my-3">The dashboard is available to approved seller accounts.</p><Link to="/seller" className="underline">Check your application status</Link></section>}
    {dashboard && <>
      <section aria-label="Shop statistics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Products', dashboard.products.total, `${dashboard.products.approved} approved · ${dashboard.products.pending} pending · ${dashboard.products.rejected} rejected`],
          ['Orders', dashboard.orders.total, 'All orders placed with your shop'],
          ['Active orders', dashboard.orders.active, `${dashboard.orders.delivered} delivered`],
          ['Revenue', formatCurrency(dashboard.totalRevenue), 'Item subtotals from delivered, paid orders. Delivery fees excluded.'],
        ].map(([label, value, detail]) => <article key={label} className="rounded-2xl border border-[#eadfd3] bg-[#fffdf9] p-6"><h2 className="font-medium text-stone-600">{label}</h2><p className="my-3 text-3xl font-semibold text-[#70472c]">{value}</p><p className="text-sm text-stone-500">{detail}</p></article>)}
      </section>
      <section className="mt-10" aria-labelledby="recent-orders"><h2 id="recent-orders" className="mb-4 font-serif text-2xl">Recent orders</h2>
        {dashboard.recentOrders.length === 0 ? <p className="rounded-xl bg-stone-50 p-6">No orders yet. Your latest five orders will appear here.</p> :
          <div className="overflow-x-auto rounded-xl border border-[#eadfd3]"><table className="w-full text-left text-sm"><thead className="bg-[#f4eadb]"><tr>{['Order', 'Date', 'Status', 'Total'].map(label => <th key={label} scope="col" className="p-4">{label}</th>)}</tr></thead><tbody>{dashboard.recentOrders.map(order => <tr key={order._id} className="border-t border-[#eadfd3]"><th scope="row" className="p-4">{order.orderId || order._id}</th><td className="p-4">{order.createdAt && Number.isFinite(Date.parse(order.createdAt)) ? new Date(order.createdAt).toLocaleDateString('en-LK') : 'Date unavailable'}</td><td className="p-4">{statusLabel(order.orderStatus)}</td><td className="p-4">{formatCurrency(order.totalAmount)}</td></tr>)}</tbody></table></div>}
      </section>
      <section className="mt-10" aria-labelledby="low-stock"><h2 id="low-stock" className="mb-4 font-serif text-2xl">Low-stock products</h2><p className="mb-4 text-sm text-stone-500">Active, approved products with five or fewer items remaining.</p>
        {dashboard.lowStockProducts.length === 0 ? <p className="rounded-xl bg-stone-50 p-6">No products need restocking.</p> : <ul className="divide-y divide-[#eadfd3] rounded-xl border border-[#eadfd3]">{dashboard.lowStockProducts.map(product => <li key={product._id} className="flex flex-wrap justify-between gap-3 p-4"><Link to={`/products/${product._id}`} className="font-medium underline">{product.name}</Link><span className={product.stock === 0 ? 'text-red-700' : 'text-amber-800'}>{product.stock === 0 ? 'Out of stock' : `${product.stock} remaining`}</span></li>)}</ul>}
      </section>
    </>}
  </main><Footer /></>;
}
