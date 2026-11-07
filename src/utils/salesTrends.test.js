import { test } from 'node:test';
import assert from 'node:assert/strict';
import api from './api.js';
import { buildSalesTrends, fetchSalesTrends } from './salesTrends.js';

const now = new Date('2026-02-15T12:00:00Z');
const order = (overrides = {}) => ({ _id: 'one', orderStatus: 'delivered', paymentStatus: 'paid', subtotal: 100, totalAmount: 600, deliveredAt: '2026-02-01T00:00:00Z', ...overrides });

test('six-month window crosses years, fills zero months and uses Colombo month boundaries', () => {
  const result = buildSalesTrends([order({ deliveredAt: '2026-01-31T20:00:00Z' })], now);
  assert.deepEqual(result.months.map(month => month.month), ['2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02']);
  assert.equal(result.months[4].revenue, 0);
  assert.equal(result.months[5].revenue, 100);
  assert.equal(result.months[5].orders, 1);
  assert.equal(buildSalesTrends([], now).months.length, 6);
});

test('only paid delivered subtotals in the window count, excluding delivery fees', () => {
  const result = buildSalesTrends([
    order(), order({ _id: 'two', subtotal: 50.25 }),
    order({ _id: 'pending', paymentStatus: 'pending' }),
    order({ _id: 'refund', paymentStatus: 'refunded' }),
    order({ _id: 'cancelled', orderStatus: 'cancelled' }),
    order({ _id: 'old', deliveredAt: '2025-08-01T00:00:00Z' }),
  ], now);
  assert.equal(result.months[5].revenue, 150.25);
  assert.equal(result.months[5].orders, 2);
});

test('missing, invalid and future delivery dates are disclosed rather than assigned to creation month', () => {
  const result = buildSalesTrends([order({ deliveredAt: null }), order({ _id: 'bad', deliveredAt: 'invalid' }), order({ _id: 'future', deliveredAt: '2027-01-01' })], now);
  assert.equal(result.undatedOrders, 3);
  assert.ok(result.months.every(month => month.revenue === 0));
});

test('malformed history, duplicate orders and invalid amounts cannot become misleading sales', () => {
  for (const history of [null, [{}], [order(), order()], [order({ subtotal: -5 })], [order({ subtotal: '100' })]]) assert.throws(() => buildSalesTrends(history, now));
});

test('sales request authenticates, filters delivered orders and rejects changed sessions or server failures', async () => {
  let token = 'seller-token';
  globalThis.localStorage = { getItem: () => token };
  const previous = api.defaults.adapter;
  try {
    api.defaults.adapter = async config => {
      assert.equal(config.url, '/orders/seller');
      assert.equal(config.params.status, 'delivered');
      assert.equal(config.headers.get('Authorization'), 'Bearer seller-token');
      return { status: 200, config, data: { success: true, orders: [order()] } };
    };
    assert.equal((await fetchSalesTrends({ now })).months[5].revenue, 100);
    api.defaults.adapter = async config => { token = 'another-session'; return { status: 200, config, data: { success: true, orders: [] } }; };
    await assert.rejects(fetchSalesTrends({ now }), /session changed/);
    api.defaults.adapter = async config => ({ status: 200, config, data: { success: false } });
    await assert.rejects(fetchSalesTrends({ now }), /Unable to load/);
    token = '';
    await assert.rejects(fetchSalesTrends({ now }), /sign in/);
  } finally { api.defaults.adapter = previous; }
});
