import api from './api.js';

export function validateDashboard(data) {
  const dashboard = data?.dashboard;
  const counts = [dashboard?.products?.total, dashboard?.products?.approved,
    dashboard?.products?.pending, dashboard?.products?.rejected,
    dashboard?.orders?.total, dashboard?.orders?.active, dashboard?.orders?.delivered];
  if (data?.success !== true || counts.some(value => !Number.isInteger(value) || value < 0) ||
      !Number.isFinite(dashboard?.totalRevenue) || dashboard.totalRevenue < 0 ||
      !Array.isArray(dashboard?.lowStockProducts) || !Array.isArray(dashboard?.recentOrders)) {
    throw new Error('The server returned an invalid dashboard. Please refresh.');
  }
  if (dashboard.lowStockProducts.some(product => !product?._id || typeof product.name !== 'string' || !Number.isInteger(product.stock) || product.stock < 0) ||
      dashboard.recentOrders.some(order => !order?._id || typeof order.orderStatus !== 'string' || !Number.isFinite(order.totalAmount) || order.totalAmount < 0)) {
    throw new Error('The server returned invalid dashboard items. Please refresh.');
  }
  return dashboard;
}

export async function loadSellerDashboard({ signal, isCurrent = () => true } = {}) {
  const { data } = await api.get('/auth/profile', { signal });
  if (!isCurrent()) return null;
  if (!data?.success || !data.user?.role) throw new Error('Unable to verify your seller account.');
  if (data.user.role !== 'seller' || data.user.sellerApprovalStatus !== 'approved') {
    return { access: 'denied', dashboard: null };
  }
  const response = await api.get('/dashboard/seller', { signal });
  if (!isCurrent()) return null;
  return { access: 'approved', dashboard: validateDashboard(response.data) };
}
