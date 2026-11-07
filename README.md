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

## Order history and tracking

`/orders` fetches `/orders/mine`, sorts newest first, filters on `orderStatus`, and displays five orders per page. The backend returns the entire history and has no page/limit contract, so pagination is currently client-side. Server pagination remains unchecked in the development plan. Protected `/orders/:id` fetches `/orders/:id` and supports both database IDs and order numbers, as the backend does.

Order displays use saved order-item snapshots, server totals, payment status, seller name, shipping address, creation/update dates, and delivered date when present. The timeline follows `placed -> confirmed -> processing -> shipped -> delivered`. Cancelled, failed, and unknown states never mark a successful delivery timeline; failed payment status is shown separately. The current backend schema does not emit a failed order status or per-stage timestamps, so those are not fabricated.

Cancellation checks a fresh server detail response and allows only `placed` or `confirmed` orders, respecting an explicit `canCancel: false` if supplied. It sends PUT `/orders/:id/cancel` and requires a returned cancelled order before showing success. Both success and failure trigger a refresh so status changes by sellers are reflected. Concurrent duplicate cancellations are blocked. Server authorization remains authoritative. No live cancellation was made during verification.

The order-loading hook aborts superseded/unmounted requests and separates results by token and order identifier. API services also reject responses after account changes. Regression tests cover status mapping, eligibility, fresh checks, failed and duplicate cancellation, filtering/pages, authorization/session changes, malformed responses, and date fallbacks. Browser and authenticated end-to-end verification remain pending because no browser connection was available.

## Product reviews

Product details load GET `/reviews/product/:productId`, render visible reviews, and update the header with the server's `averageRating` and `reviewCount`. Public review errors and buyer eligibility errors have separate feedback and retry controls. The backend makes new reviews visible by default; admins may hide them. There is no pending-approval state, and the frontend does not invent one.

Buyer eligibility comes from delivered orders containing the actual product database ID. Visible reviews matching the current buyer/order are excluded from the form. Submission fetches the selected order again, then POSTs `/reviews` with `{ productId, orderId, rating, comment }`. Ratings must be whole numbers from 1 to 5; trimmed comments must contain 5–1,000 characters. The server enforces authorization, delivered-purchase eligibility, and the unique buyer/product/order constraint. Concurrent duplicate submissions are blocked in the frontend. The public endpoint excludes hidden reviews, so an existing hidden duplicate may still appear selectable; the backend rejects it and its response is shown to the buyer. Failed submissions retain the draft. Successful submissions refresh both reviews and aggregate ratings.

Regression tests cover rating/comment boundaries, product/order eligibility, duplicate selection, public filtering and aggregates, sanitized request fields, unauthorized users, stale order status, duplicate/moderation errors, concurrent requests, malformed responses, and session changes. No live review was created. The local catalog returned no products for a live public-review read; authenticated/browser acceptance checks remain pending.

## Development order

Seller registration is available through the account type selector on `/signup`. Seller login defaults to `/seller`; the My Shop navigation link opens the same page. This page verifies the account with GET `/auth/profile` rather than relying on the locally stored role. Pending and rejected sellers can check their application status; only approved sellers can create or edit their shop. Existing buyers cannot change their role through profile editing.

Shop creation uses POST `/sellers`; editing uses PUT `/sellers/me`. Both require an active, approved seller. Payload fields are shopName, bio, city, district, country, contactEmail, contactPhone, craftCategories (category IDs from GET `/categories`), logo, bannerImage, website, facebook, and instagram. The create response contains `seller.sellerProfile`; update returns `sellerProfile`. Images use hosted HTTP(S) URLs. There is no image upload or seller application resubmission endpoint. Rejected applicants are directed to contact support. These contracts were checked against the neighboring backend source; authenticated live acceptance testing remains pending.

Validate authenticated cart and wishlist workflows against the running backend, then continue with seller registration/profile, seller dashboards, and admin workflows. Resolve the checkout backend gaps above before release. See `NEXT_DEVELOPMENT_PLAN.md` for acceptance criteria and remaining tasks.
