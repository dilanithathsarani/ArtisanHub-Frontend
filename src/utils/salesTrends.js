import api from './api.js';
import { getToken } from './auth.js';

function monthKey(date) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit' }).formatToParts(date);
  return `${parts.find(part => part.type === 'year').value}-${parts.find(part => part.type === 'month').value}`;
}

export function buildSalesTrends(orders, now = new Date()) {
  if (!Array.isArray(orders)) throw new Error('Invalid sales history received from the server.');
  const current = monthKey(now);
  const [year, month] = current.split('-').map(Number);
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 6 + index, 1));
    return { month: monthKey(date), label: new Intl.DateTimeFormat('en-LK', { timeZone: 'Asia/Colombo', month: 'short', year: 'numeric' }).format(date), revenue: 0, orders: 0 };
  });
  const seen = new Set();
  let undatedOrders = 0;
  for (const order of orders) {
    if (!order || typeof order._id !== 'string' || typeof order.orderStatus !== 'string' || typeof order.paymentStatus !== 'string') throw new Error('Invalid sales order received from the server.');
    if (seen.has(order._id)) throw new Error('Duplicate sales history received from the server.');
    seen.add(order._id);
    if (order.orderStatus !== 'delivered' || order.paymentStatus !== 'paid') continue;
    if (!Number.isFinite(order.subtotal) || order.subtotal < 0) throw new Error('Invalid sales amount received from the server.');
    const date = order.deliveredAt ? new Date(order.deliveredAt) : null;
    if (!date || !Number.isFinite(date.getTime()) || date > now) { undatedOrders++; continue; }
    const bucket = months.find(item => item.month === monthKey(date));
    if (bucket) { bucket.orders++; bucket.revenue += order.subtotal; }
  }
  for (const bucket of months) bucket.revenue = Math.round(bucket.revenue * 100) / 100;
  return { months, undatedOrders };
}

export async function fetchSalesTrends({ signal, now = new Date() } = {}) {
  const token = getToken();
  if (!token) throw new Error('Please sign in to view sales trends.');
  const { data } = await api.get('/orders/seller', { params: { status: 'delivered' }, signal });
  if (token !== getToken()) throw new Error('Your session changed. Please sign in again.');
  if (data?.success !== true) throw new Error('Unable to load sales history.');
  return buildSalesTrends(data.orders, now);
}
