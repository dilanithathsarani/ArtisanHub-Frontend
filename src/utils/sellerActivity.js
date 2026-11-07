import api from './api.js';
import { getToken } from './auth.js';

export const ACTIVITY_STATUSES = ['all', 'placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

function validDay(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateActivityFilters({ from = '', to = '', status = 'all' }) {
  if ((from && !validDay(from)) || (to && !validDay(to))) return 'Enter valid dates.';
  if (from && to && from > to) return 'Start date must be on or before end date.';
  if (!ACTIVITY_STATUSES.includes(status)) return 'Choose a supported order status.';
  return '';
}

export function activityDay(value) {
  const date = value ? new Date(value) : null;
  if (!date || !Number.isFinite(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type).value).join('-');
}

export function filterActivity(orders, filters, page = 1) {
  const error = validateActivityFilters(filters);
  if (error) throw new Error(error);
  const { from = '', to = '', status = 'all' } = filters;
  let excludedDates = 0;
  const matches = orders.filter(order => {
    if (status !== 'all' && order.orderStatus !== status) return false;
    const day = activityDay(order.createdAt);
    if ((from || to) && !day) { excludedDates++; return false; }
    return (!from || day >= from) && (!to || day <= to);
  }).sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));
  const pages = Math.max(1, Math.ceil(matches.length / 10));
  const currentPage = Math.min(pages, Math.max(1, Number.isInteger(page) ? page : 1));
  return { orders: matches.slice((currentPage - 1) * 10, currentPage * 10), total: matches.length, pages, page: currentPage, excludedDates };
}

export async function fetchSellerActivity({ signal } = {}) {
  const token = getToken();
  if (!token) throw new Error('Please sign in to view order activity.');
  const { data } = await api.get('/orders/seller', { signal });
  if (token !== getToken()) throw new Error('Your session changed. Please sign in again.');
  if (data?.success !== true || !Array.isArray(data.orders) || data.orders.some(order => !order || typeof order._id !== 'string' || typeof order.orderStatus !== 'string' || !Number.isFinite(order.totalAmount) || order.totalAmount < 0) || new Set(data.orders.map(order => order._id)).size !== data.orders.length) {
    throw new Error('Invalid order activity received from the server.');
  }
  return data.orders;
}
