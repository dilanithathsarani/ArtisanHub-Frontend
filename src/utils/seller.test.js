import test from 'node:test';
import assert from 'node:assert/strict';
import { shopDraft, validateShop } from './seller.js';

test('profile validation rejects whitespace, excessive content and unsafe URLs', () => {
  const errors = validateShop({ ...shopDraft(), shopName: ' ', bio: 'a'.repeat(1001), contactEmail: 'invalid', logo: 'javascript:alert(1)' });
  for (const field of ['shopName', 'bio', 'city', 'district', 'contactEmail', 'contactPhone', 'logo']) assert.ok(errors[field]);
});

test('valid shop values and hosted images pass; drafts exclude server-owned fields', () => {
  const draft = shopDraft({ shopId: 'SHP-00001', shopName: 'Clay Studio', bio: 'Handmade pottery', city: 'Kandy', district: 'Kandy', contactEmail: 'studio@example.com', contactPhone: '+94 77 123 4567', logo: 'https://example.com/logo.png' });
  assert.deepEqual(validateShop(draft), {});
  assert.equal(draft.country, 'Sri Lanka');
  assert.equal('shopId' in draft, false);
});
