import { useEffect, useState } from 'react';
import { fetchSalesTrends } from '../utils/salesTrends';
import { getApiError } from '../utils/api';
import { getToken } from '../utils/auth';
import { formatCurrency } from '../utils/formatCurrency';

export default function SalesTrends() {
  const [state, setState] = useState({ loading: true });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const token = getToken();
    let active = true;
    fetchSalesTrends({ signal: controller.signal }).then(data => {
      if (active && token === getToken()) setState({ loading: false, ...data });
    }).catch(error => {
      if (active && token === getToken() && !controller.signal.aborted) setState({ loading: false, error: getApiError(error, error.message) });
    });
    return () => { active = false; controller.abort(); };
  }, [revision]);
  const maxRevenue = Math.max(1, ...(state.months || []).map(month => month.revenue));
  return <section className="mt-10" aria-labelledby="sales-trends">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 id="sales-trends" className="font-serif text-2xl">Sales trends</h2><button disabled={state.loading} className="underline disabled:opacity-50" onClick={() => { setState({ loading: true }); setRevision(value => value + 1); }}>{state.error ? 'Retry sales trends' : 'Refresh sales trends'}</button></div>
    <p className="mb-5 text-sm text-stone-500">Last six months, including the current partial month. Paid, delivered item subtotals by delivery date in Sri Lanka time. Delivery fees excluded.</p>
    {state.loading && <p role="status">Loading sales trends…</p>}
    {state.error && <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">{state.error}</p>}
    {state.months && <>
      {!state.months.some(month => month.orders > 0) && <p className="mb-4 rounded-xl bg-stone-50 p-5">No paid, delivered sales in this period.</p>}
      <div aria-hidden="true" className="mb-5 flex h-48 items-end gap-3 rounded-xl bg-[#fffdf9] px-4 pt-4 sm:gap-6">
        {state.months.map(month => <div key={month.month} className="flex h-full min-w-0 flex-1 flex-col justify-end text-center"><div className="mx-auto w-full max-w-16 rounded-t bg-[#8b5e3c]" style={{ height: `${month.revenue / maxRevenue * 78}%`, minHeight: month.revenue > 0 ? 2 : 0 }} /><span className="mt-2 h-9 text-xs text-stone-600">{month.label}</span></div>)}
      </div>
      <div className="overflow-x-auto rounded-xl border border-[#eadfd3]"><table className="w-full text-left text-sm"><caption className="sr-only">Monthly paid and delivered sales, in Sri Lankan rupees</caption><thead className="bg-[#f4eadb]"><tr><th scope="col" className="p-4">Delivery month</th><th scope="col" className="p-4">Orders</th><th scope="col" className="p-4">Revenue</th></tr></thead><tbody>{state.months.map(month => <tr key={month.month} className="border-t border-[#eadfd3]"><th scope="row" className="p-4">{month.label}</th><td className="p-4">{month.orders}</td><td className="p-4">{formatCurrency(month.revenue)}</td></tr>)}</tbody></table></div>
      {state.undatedOrders > 0 && <p role="status" className="mt-3 text-sm text-amber-800">{state.undatedOrders} paid, delivered order(s) were excluded because their delivery dates are missing, invalid or in the future.</p>}
    </>}
  </section>;
}
