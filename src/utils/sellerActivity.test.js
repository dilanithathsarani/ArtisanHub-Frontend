import { test } from 'node:test';
import assert from 'node:assert/strict';
import api from './api.js';
import { activityDay, filterActivity, validateActivityFilters, fetchSellerActivity } from './sellerActivity.js';

const order = (id, createdAt, orderStatus = 'placed') => ({ _id: id, createdAt, orderStatus, totalAmount: 250 });
test('filter dates reject invalid calendar days, reversed ranges and unsupported statuses', () => {
  assert.ok(validateActivityFilters({ from: '2026-02-30' }));
  assert.ok(validateActivityFilters({ from: '2026-03-01', to: '2026-02-01' }));
  assert.ok(validateActivityFilters({ status: 'failed' }));
  assert.equal(validateActivityFilters({ from: '2024-02-29', to: '2024-02-29', status: 'delivered' }), '');
});
test('inclusive Sri Lanka dates and status apply together; clearing restores history', () => {
  const orders = [order('one', '2026-01-31T20:00:00Z', 'delivered'), order('two', '2026-02-01T18:30:00Z', 'delivered'), order('three', '2026-02-01T00:00:00Z')];
  assert.equal(activityDay(orders[0].createdAt), '2026-02-01');
  assert.deepEqual(filterActivity(orders, { from: '2026-02-01', to: '2026-02-01', status: 'delivered' }).orders.map(item => item._id), ['one']);
  assert.equal(filterActivity(orders, {}).total, 3);
  assert.equal(filterActivity(orders, { to: '2026-01-01' }).total, 0);
});
test('invalid dates are retained without date filters and disclosed when excluded', () => {
  const orders = [order('one', null), order('two', 'invalid')];
  assert.equal(filterActivity(orders, {}).total, 2);
  const result = filterActivity(orders, { from: '2026-01-01' });
  assert.equal(result.total, 0);
  assert.equal(result.excludedDates, 2);
});
test('paging uses filtered matches, sorts newest first and clamps stale page selections', () => {
  const orders = Array.from({ length: 12 }, (_, index) => order(String(index), `2026-01-${String(index + 1).padStart(2, '0')}T00:00:00Z`));
  const first = filterActivity(orders, {});
  assert.equal(first.orders.length, 10);
  assert.equal(first.orders[0]._id, '11');
  assert.equal(filterActivity(orders, {}, 2).orders.length, 2);
  assert.equal(filterActivity(orders, { from: '2026-01-12' }, 2).page, 1);
  assert.equal(orders[0]._id, '0');
});
test('activity API authenticates and rejects malformed data and changed sessions', async () => {
  let token = 'seller-token';
  globalThis.localStorage = { getItem: () => token };
  const previous = api.defaults.adapter;
  try {
    api.defaults.adapter = async config => {
      assert.equal(config.url, '/orders/seller');
      assert.equal(config.headers.get('Authorization'), 'Bearer seller-token');
      return { status: 200, config, data: { success: true, orders: [order('one', null)] } };
    };
    assert.equal((await fetchSellerActivity()).length, 1);
    api.defaults.adapter = async config => ({ status: 200, config, data: { success: true, orders: [{}] } });
    await assert.rejects(fetchSellerActivity(), /Invalid order activity/);
    api.defaults.adapter = async config => { token = 'new-session'; return { status: 200, config, data: { success: true, orders: [] } }; };
    await assert.rejects(fetchSellerActivity(), /session changed/);
    token = '';
    await assert.rejects(fetchSellerActivity(), /sign in/);
  } finally { api.defaults.adapter = previous; }
});
