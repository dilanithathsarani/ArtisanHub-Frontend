import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import api from './api.js';
import { loadSellerDashboard, validateDashboard } from './sellerDashboard.js';

const empty = () => ({ success: true, dashboard: { products: { total: 0, approved: 0, pending: 0, rejected: 0 }, orders: { total: 0, active: 0, delivered: 0 }, totalRevenue: 0, lowStockProducts: [], recentOrders: [] } });
beforeEach(() => { globalThis.localStorage = { getItem: () => 'seller-token' }; });

test('empty dashboard keeps authoritative zero totals; invalid metrics and rows fail explicitly', () => {
  assert.equal(validateDashboard(empty()).totalRevenue, 0);
  const invalid = empty();
  invalid.dashboard.totalRevenue = '500';
  assert.throws(() => validateDashboard(invalid), /invalid dashboard/);
  const invalidRow = empty();
  invalidRow.dashboard.lowStockProducts = [{ _id: 'product', name: 'Vase', stock: -1 }];
  assert.throws(() => validateDashboard(invalidRow), /invalid dashboard items/);
  assert.throws(() => validateDashboard({ success: false }), /invalid dashboard/);
});

test('buyer, pending and rejected accounts never request dashboard data', async () => {
  const previous = api.defaults.adapter;
  try {
    for (const user of [{ role: 'buyer' }, { role: 'seller', sellerApprovalStatus: 'pending' }, { role: 'seller', sellerApprovalStatus: 'rejected' }]) {
      const paths = [];
      api.defaults.adapter = async config => { paths.push(config.url); return { status: 200, config, data: { success: true, user } }; };
      assert.equal((await loadSellerDashboard()).access, 'denied');
      assert.deepEqual(paths, ['/auth/profile']);
    }
  } finally { api.defaults.adapter = previous; }
});

test('approved seller requests authenticated dashboard and preserves server totals', async () => {
  const previous = api.defaults.adapter;
  const paths = [];
  try {
    api.defaults.adapter = async config => {
      paths.push(config.url);
      assert.equal(config.headers.get('Authorization'), 'Bearer seller-token');
      return { status: 200, config, data: config.url === '/auth/profile' ? { success: true, user: { role: 'seller', sellerApprovalStatus: 'approved' } } : empty() };
    };
    const result = await loadSellerDashboard();
    assert.equal(result.access, 'approved');
    assert.deepEqual(result.dashboard, empty().dashboard);
    assert.deepEqual(paths, ['/auth/profile', '/dashboard/seller']);
  } finally { api.defaults.adapter = previous; }
});

test('session changes discard responses and stop requests after profile verification', async () => {
  const previous = api.defaults.adapter;
  let current = true;
  let calls = 0;
  try {
    api.defaults.adapter = async config => { calls++; current = false; return { status: 200, config, data: { success: true, user: { role: 'seller', sellerApprovalStatus: 'approved' } } }; };
    assert.equal(await loadSellerDashboard({ isCurrent: () => current }), null);
    assert.equal(calls, 1);
    current = true;
    api.defaults.adapter = async config => {
      if (config.url === '/dashboard/seller') current = false;
      return { status: 200, config, data: config.url === '/auth/profile' ? { success: true, user: { role: 'seller', sellerApprovalStatus: 'approved' } } : empty() };
    };
    assert.equal(await loadSellerDashboard({ isCurrent: () => current }), null);
  } finally { api.defaults.adapter = previous; }
});

test('server errors remain failures rather than displaying zero statistics', async () => {
  const previous = api.defaults.adapter;
  try {
    api.defaults.adapter = async config => {
      if (config.url === '/dashboard/seller') throw { config, response: { status: 403, data: { message: 'Seller approval required' } } };
      return { status: 200, config, data: { success: true, user: { role: 'seller', sellerApprovalStatus: 'approved' } } };
    };
    await assert.rejects(loadSellerDashboard(), error => error.response.status === 403);
  } finally { api.defaults.adapter = previous; }
});
