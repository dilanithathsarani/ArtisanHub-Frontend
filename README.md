# ArtisanHub frontend

React 19 marketplace frontend built with Vite and Tailwind CSS.

## Local setup

1. Install Node.js compatible with the installed Vite version, then run `npm ci`.
2. Copy `.env.example` to `.env` and set `VITE_API_URL` to the backend API root, including `/api` when required.
3. Start the backend separately, then run `npm run dev`.
4. Run `npm run lint`, `npm test`, and `npm run build` before shipping changes.

Vite environment variables are public browser configuration. Do not put secrets in them. Restart Vite after changing `.env`. Production hosting needs an SPA fallback to `index.html` for direct route visits, and the backend must allow the frontend origin through CORS.

## API and authentication foundation

All API calls use `src/utils/api.js`: one base URL, a 15-second timeout, request-time Bearer authentication, and shared user-facing error messages. Authentication endpoints do not inherit a previous session token. An authenticated 401 clears that session; a late response cannot clear a newer login. Checkout, order success, and order history redirect unauthenticated visitors to login and preserve the return path.

Login accepts `token`, `accessToken`, or `access_token`, directly or inside `data`, and an optional `user` at either level. Missing tokens fail login. Tokens remain in localStorage to preserve the current application contract. The Remember Me checkbox currently records a preference only; it does not change session lifetime. Backend authorization remains required for every protected action.

## Backend verification required

The neighboring `../../Backend` directory contains the API source. Cart and wishlist routes, response fields, buyer authorization, stock validation, and order-side cart clearing have been checked against that source. The other routes below reflect existing frontend calls. The local products endpoint responded HTTP 200; authenticated cart operations still need end-to-end validation with a buyer account.

| Area | Existing requests |
| --- | --- |
| Authentication | POST `/auth/login`, `/auth/register`, `/auth/forgotPassword`, `/auth/reset-password/:token` |
| Catalog | GET `/products`, `/products/:id`, `/categories` |
| Artisans | GET `/sellers`, `/sellers/:slug`; existing fallbacks use `/artisans` and product seller data |
| Contact | POST `/contact` |
| Wishlist | GET `/wishlist`; POST `/wishlist` with `{ productId }`; DELETE `/wishlist/:productId`; DELETE `/wishlist` |
| Cart | GET `/cart`; POST `/cart/items` with `{ productId, quantity }`; PUT `/cart/items/:productId` with `{ quantity }`; DELETE `/cart/items/:productId`; DELETE `/cart` |
| Orders | POST `/orders`; GET `/orders/mine`; PUT `/orders/:id/cancel` |

Connectivity check: with the backend running, open Shop and confirm the products request succeeds in the browser Network panel. Then sign in and confirm `/orders/mine` uses Bearer authentication. Verify the browser origin is allowed by CORS. A successful production build does not verify backend connectivity.

## Cart behavior

Authenticated buyer carts use the server as their source of truth. Every mutation returns `{ success, cart: { items: [{ product, quantity, subtotal }], totalItems, totalAmount } }`. Product `_id` identifies cart items; PUT sets an absolute quantity and POST adds quantity. Server prices and stock are displayed after successful responses. Failed mutations leave the displayed cart intact. Sellers and admins cannot use buyer carts.

Guests keep `artisanhub-cart` on this device. Login triggers synchronization without clearing the server cart. For a product present in both carts, the larger quantity wins; quantities are not added together. This makes retrying after a lost response safe. Guest entries are removed only after acknowledgement. Failed entries remain available for retry; the cart page also offers an explicit action to discard guest entries and use the saved cart. Stock errors are surfaced rather than silently reducing quantities. Wishlist synchronization is implemented as described below.

Checkout now reads the server-backed cart and no longer clears/rebuilds it from localStorage. Checkout validation, cash-on-delivery placement, server-derived receipts, and frontend duplicate-submit prevention are implemented. A payment-provider flow remains future work.

## Wishlist behavior

Buyer wishlists use the backend response `{ success, wishlist: { products: [...] } }`. Shared state drives product-card hearts, the product-details save action, wishlist grid, and navbar count. Save, remove, and clear operations update the UI after server confirmation. Repeated clicks are blocked while a request is pending. Duplicate-add and already-removed responses are reconciled with a fresh server fetch; unrelated errors remain visible. The backend filters inactive or unapproved products from returned lists.

Guests save items under `artisanhub-wishlist`. Login merges the union of unique product IDs without clearing the saved server list. Each guest entry is removed only after acknowledgement. Failed or unavailable entries remain for retry, and the wishlist page offers an explicit action to discard remaining guest entries. Logout/account changes reset shared state so another buyer cannot see the previous list. The wishlist page provides a refresh action for updates made elsewhere.

Verification: `npm test` covers guest operations, server persistence, failed mutations, union merges, duplicate requests, unavailable products, and logout races. Browser verification could not run because no browser connection was available. Authenticated and cross-device acceptance testing still requires a buyer session.

## Checkout and receipts

Checkout validates required delivery fields, Sri Lankan phone format, five-digit postal codes, and the selected district. It maps the backend's required-field messages and structured field errors into accessible inline messages. It submits only a trimmed shipping address and `paymentMethod: cash-on-delivery`. Card fields and unsupported order notes were removed; raw payment-card data is never collected.

The order controller groups cart items by seller, validates server prices/stock, charges `DELIVERY_FEE` per seller order, and clears the cart in its database transaction. There is no checkout quote endpoint, so the frontend shows the items subtotal and explains delivery fees separately instead of displaying an incorrect single delivery fee. The success page uses confirmed server order numbers, item snapshots, shipping addresses, payment status, per-order totals, and aggregate fees. A missing or malformed receipt shows a link to order history, not a success claim. Receipts are associated with the signed-in buyer in route state; no receipt is written to localStorage.

A synchronous UI lock and a shared request lock prevent concurrent submissions in this frontend instance. Timeout/network errors, server errors, and malformed success responses are treated as uncertain outcomes. Automatic retries are blocked in memory until the buyer checks My Orders and explicitly reloads the cart. The backend does not implement idempotency keys; exactly-once guarantees across page reloads, tabs, or devices require backend support. A delivery quote endpoint is also needed to confirm final shipping costs before submission. These backend gaps remain open. Failed requests never clear the cart in frontend code.

`npm test` includes checkout validation, sanitized payloads, concurrent requests, uncertain outcomes, server field feedback, malformed receipts, multiple-artisan fee totals, and account-change regression cases. No live order was created during verification. Browser and authenticated end-to-end testing remain pending because no browser connection was available in this session.

## Development order

Validate authenticated cart and wishlist workflows against the running backend, then continue with order history/tracking, seller workflows, and admin workflows. Resolve the checkout backend gaps above before release. See `NEXT_DEVELOPMENT_PLAN.md` for acceptance criteria and remaining tasks.
