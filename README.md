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

The neighboring `../../Backend` directory contains the API source. Cart routes, response fields, buyer authorization, stock validation, and order-side cart clearing have been checked against that source. The other routes below reflect existing frontend calls. The local products endpoint responded HTTP 200; authenticated cart operations still need end-to-end validation with a buyer account.

| Area | Existing requests |
| --- | --- |
| Authentication | POST `/auth/login`, `/auth/register`, `/auth/forgotPassword`, `/auth/reset-password/:token` |
| Catalog | GET `/products`, `/products/:id`, `/categories` |
| Artisans | GET `/sellers`, `/sellers/:slug`; existing fallbacks use `/artisans` and product seller data |
| Contact | POST `/contact` |
| Wishlist | POST `/wishlist` with `{ productId }`; DELETE `/wishlist/:productId` |
| Cart | GET `/cart`; POST `/cart/items` with `{ productId, quantity }`; PUT `/cart/items/:productId` with `{ quantity }`; DELETE `/cart/items/:productId`; DELETE `/cart` |
| Orders | POST `/orders`; GET `/orders/mine`; PUT `/orders/:id/cancel` |

Connectivity check: with the backend running, open Shop and confirm the products request succeeds in the browser Network panel. Then sign in and confirm `/orders/mine` uses Bearer authentication. Verify the browser origin is allowed by CORS. A successful production build does not verify backend connectivity.

## Cart behavior

Authenticated buyer carts use the server as their source of truth. Every mutation returns `{ success, cart: { items: [{ product, quantity, subtotal }], totalItems, totalAmount } }`. Product `_id` identifies cart items; PUT sets an absolute quantity and POST adds quantity. Server prices and stock are displayed after successful responses. Failed mutations leave the displayed cart intact. Sellers and admins cannot use buyer carts.

Guests keep `artisanhub-cart` on this device. Login triggers synchronization without clearing the server cart. For a product present in both carts, the larger quantity wins; quantities are not added together. This makes retrying after a lost response safe. Guest entries are removed only after acknowledgement. Failed entries remain available for retry; the cart page also offers an explicit action to discard guest entries and use the saved cart. Stock errors are surfaced rather than silently reducing quantities. The wishlist still uses its existing storage behavior and needs the next integration step.

Checkout now reads the server-backed cart and no longer clears/rebuilds it from localStorage. The remaining checkout validation, payment-provider flow, authoritative order receipt, and duplicate-submit work is tracked separately in `NEXT_DEVELOPMENT_PLAN.md`.

## Development order

Validate the authenticated cart workflow against the running backend, then continue with wishlist, checkout, orders, seller workflows, and admin workflows. See `NEXT_DEVELOPMENT_PLAN.md` for acceptance criteria and remaining tasks.
