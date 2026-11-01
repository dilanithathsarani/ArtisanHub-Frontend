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

This checkout contains frontend code only. The following routes are inferred from existing calls and have not been verified against a running backend:

| Area | Existing requests |
| --- | --- |
| Authentication | POST `/auth/login`, `/auth/register`, `/auth/forgotPassword`, `/auth/reset-password/:token` |
| Catalog | GET `/products`, `/products/:id`, `/categories` |
| Artisans | GET `/sellers`, `/sellers/:slug`; existing fallbacks use `/artisans` and product seller data |
| Contact | POST `/contact` |
| Wishlist | POST `/wishlist` with `{ productId }`; DELETE `/wishlist/:productId` |
| Cart | DELETE `/cart`; POST `/cart/items` with `{ productId, quantity }` |
| Orders | POST `/orders`; GET `/orders/mine`; PUT `/orders/:id/cancel` |

Connectivity check: with the backend running, open Shop and confirm the products request succeeds in the browser Network panel. Then sign in and confirm `/orders/mine` uses Bearer authentication. Verify the browser origin is allowed by CORS. A successful production build does not verify backend connectivity.

Before cart integration, confirm GET-cart response shape, item identifiers, quantity update/removal endpoints, stock errors, pagination, and order status/cancellation rules with the backend. Do not invent those endpoints from this table.

Cart and wishlist still use browser storage. Automatic guest merging is deferred until the backend contract is confirmed. The intended merge policy is to preserve guest data until server acknowledgement, combine product quantities within server stock limits, and deduplicate wishlist product IDs. Checkout's existing cart replacement/synchronization and card UI still need the later buyer-flow work described in `NEXT_DEVELOPMENT_PLAN.md`; this foundation does not establish a completed payment integration.

## Development order

Continue with backend contract verification and cart integration, then wishlist, checkout, orders, seller workflows, and admin workflows. See `NEXT_DEVELOPMENT_PLAN.md` for acceptance criteria and remaining tasks.
