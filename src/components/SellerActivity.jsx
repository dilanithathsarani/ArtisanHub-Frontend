import { useEffect, useState } from 'react';
import { ACTIVITY_STATUSES, activityDay, fetchSellerActivity, filterActivity, validateActivityFilters } from '../utils/sellerActivity';
import { getToken } from '../utils/auth';
import { getApiError } from '../utils/api';
import { statusLabel } from '../utils/orders';
import { formatCurrency } from '../utils/formatCurrency';

const defaults = { from: '', to: '', status: 'all' };
export default function SellerActivity() {
  const [state, setState] = useState({ loading: true });
  const [revision, setRevision] = useState(0);
  const [draft, setDraft] = useState(defaults);
  const [filters, setFilters] = useState(defaults);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  useEffect(() => {
    const controller = new AbortController();
    const token = getToken();
    let active = true;
    fetchSellerActivity({ signal: controller.signal }).then(orders => {
      if (active && token === getToken()) setState({ loading: false, orders });
    }).catch(failure => {
      if (active && token === getToken() && !controller.signal.aborted) setState({ loading: false, error: getApiError(failure, failure.message) });
    });
    return () => { active = false; controller.abort(); };
  }, [revision]);
  const result = state.orders ? filterActivity(state.orders, filters, page) : null;
  function apply(event) {
    event.preventDefault();
    const problem = validateActivityFilters(draft);
    setError(problem);
    if (!problem) { setFilters({ ...draft }); setPage(1); }
  }
  return <section className="mt-10" aria-labelledby="order-activity">
    <h2 id="order-activity" className="font-serif text-2xl">Order activity</h2>
    <p className="my-3 text-sm text-stone-500">Filter orders by placement date in Sri Lanka time. Both dates are inclusive. These filters apply only to this section.</p>
    <form onSubmit={apply} className="mb-5 flex flex-wrap items-end gap-4">
      {['from', 'to'].map(key => <label key={key} className="text-sm font-medium">{key === 'from' ? 'Start date' : 'End date'}<input type="date" value={draft[key]} onChange={event => setDraft({ ...draft, [key]: event.target.value })} className="mt-1 block rounded-lg border p-2" /></label>)}
      <label className="text-sm font-medium">Order status<select value={draft.status} onChange={event => setDraft({ ...draft, status: event.target.value })} className="mt-1 block rounded-lg border p-2">{ACTIVITY_STATUSES.map(status => <option key={status} value={status}>{status === 'all' ? 'All statuses' : statusLabel(status)}</option>)}</select></label>
      <button className="rounded-full bg-[#8b5e3c] px-5 py-2 text-white">Apply filters</button>
      <button type="button" className="underline" onClick={() => { setDraft(defaults); setFilters(defaults); setError(''); setPage(1); }}>Clear filters</button>
      <button type="button" disabled={state.loading} className="underline disabled:opacity-50" onClick={() => { setState({ loading: true }); setPage(1); setRevision(value => value + 1); }}>{state.error ? 'Retry activity' : 'Refresh activity'}</button>
    </form>
    {error && <p role="alert" className="mb-4 text-red-700">{error} The displayed results still use the last applied filters.</p>}
    {state.loading && <p role="status">Loading order activity…</p>}
    {state.error && <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">{state.error}</p>}
    {result && <>
      <p role="status" className="mb-3 text-sm">{result.total} order(s) · {filters.from || 'Any start date'} to {filters.to || 'Any end date'} · {filters.status === 'all' ? 'All statuses' : statusLabel(filters.status)}</p>
      {result.excludedDates > 0 && <p className="mb-3 text-sm text-amber-800">{result.excludedDates} order(s) excluded because their placement dates are unavailable.</p>}
      {result.total === 0 ? <p className="rounded-xl bg-stone-50 p-6">No orders match these filters. Try a wider date range or clear the filters.</p> : <>
        <div className="overflow-x-auto rounded-xl border border-[#eadfd3]"><table className="w-full text-left text-sm"><caption className="sr-only">Filtered seller order activity</caption><thead className="bg-[#f4eadb]"><tr>{['Order', 'Placement date', 'Status', 'Total'].map(label => <th scope="col" key={label} className="p-4">{label}</th>)}</tr></thead><tbody>{result.orders.map(order => <tr key={order._id} className="border-t border-[#eadfd3]"><th scope="row" className="p-4">{order.orderId || order._id}</th><td className="p-4">{activityDay(order.createdAt) || 'Date unavailable'}</td><td className="p-4">{statusLabel(order.orderStatus)}</td><td className="p-4">{formatCurrency(order.totalAmount)}</td></tr>)}</tbody></table></div>
        <nav aria-label="Order activity pages" className="mt-4 flex items-center gap-5"><button disabled={result.page <= 1} onClick={() => setPage(result.page - 1)} className="underline disabled:opacity-50">Previous</button><span>Page {result.page} of {result.pages}</span><button disabled={result.page >= result.pages} onClick={() => setPage(result.page + 1)} className="underline disabled:opacity-50">Next</button></nav>
      </>}
    </>}
  </section>;
}
