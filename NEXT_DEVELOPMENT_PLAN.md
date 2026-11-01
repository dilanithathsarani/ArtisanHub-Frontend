# ArtisanHub Next Development Plan

## Current baseline

The frontend already includes the main buyer routes:

- Home, shop, categories, artisans, and product details
- Cart, checkout, order success, my orders, and wishlist
- Authentication and password-reset screens

Authenticated carts and wishlists now use the backend; guest selections remain in `localStorage`. Checkout
and my orders contain partial API integration. The next implementation stage
should move these flows to a consistent backend-backed experience without
removing the existing UI behavior.

## Shared foundation

Complete these cross-cutting pieces before expanding marketplace features:

- [ ] Confirm the backend API contract, authentication token format, resource
      shapes, error responses, pagination, and order status values.
- [x] Add a shared Axios client using `VITE_API_URL`, request authentication,
      and consistent error handling.
- [ ] Add reusable auth and API-loading patterns for protected pages.
- [ ] Define shared product, cart, wishlist, address, order, and user data
      shapes.
- [x] Decide how guest cart/wishlist data is merged or discarded at login.
- [ ] Add environment configuration documentation and backend connectivity
      checks.

Shared client and route authentication are implemented. README documents inferred API routes and setup. Cart/wishlist contracts and guest synchronization are implemented; the remaining marketplace contracts and shared resource shapes still need verification. Cart and wishlist expose reusable loading/error hooks. API/session regression tests use `npm test`.

## Phase 1: Buyer functionality

### 1. Cart integration

- [x] Add an authenticated `Add to Cart` action to `ProductCard` and
      `ProductDetailsPage`.
- [x] Fetch the current cart from the backend when `CartPage` loads.
- [x] Support quantity updates and item removal through backend endpoints.
- [x] Show loading, empty, stock-limit, authentication, and API error states.
- [x] Keep local cart data only as a deliberate guest fallback, then synchronize
      it after login.
- [x] Update cart counts and totals after every successful mutation.

Implemented against the neighboring backend cart routes/controllers. Guest merge keeps the larger per-product quantity and removes guest entries only after acknowledgement. Checkout consumes the shared server cart without replacing it. Regression tests cover persistence, stock limits, failure preservation, guest retries, and session changes. Local products connectivity returned HTTP 200. Authenticated browser and cross-device acceptance testing remain pending.

**Acceptance criteria:** a buyer can add a product, refresh the page, change
quantity, remove an item, and see the same cart from another authenticated
session.

### 2. Wishlist integration

- [x] Replace the local-only wishlist source with backend fetch, add, remove,
      and clear operations for logged-in users.
- [x] Update the heart state consistently across product cards, product
      details, and the wishlist page.
- [x] Handle duplicate requests, unavailable products, and failed
      synchronization explicitly.
- [x] Define guest wishlist behavior and merge rules at login.

Implemented against `../../Backend/routes/wishlistRoutes.js` and its controller. Shared state updates cards, product details, navbar counts, and the wishlist page. Guest items merge by unique product ID and remain in device storage until server acknowledgement. Duplicate adds reconcile against server state; failed mutations preserve saved items. Unavailable guest entries expose retry/discard controls. Regression tests pass; authenticated browser and cross-device acceptance testing remain pending.

**Acceptance criteria:** wishlist changes persist across refreshes and devices
for the same buyer, and all wishlist surfaces remain synchronized.

### 3. Checkout and order placement

- [x] Load checkout items and authoritative prices from the backend cart.
- [x] Validate delivery details with field-level messages and server-side
      validation feedback.
- [x] Keep payment handling secure; never send or persist raw card data unless a
      backend-approved payment provider flow is in place.
- [x] Submit one validated order request and handle duplicate-submit prevention.
- [x] Clear the cart only after confirmed order creation.
- [x] Display the created order number, totals, delivery details, and next
      steps on the order-success page.

Frontend implementation complete: delivery fields show accessible validation and server feedback; only cash on delivery is offered; a synchronous submission lock prevents concurrent requests. Uncertain results block automatic retries and direct buyers to My Orders. Receipts use confirmed server orders and sum delivery fees per artisan. No order request was submitted against the live API during development. Backend delivery quotes and idempotency are still required for confirmed pre-submit totals and exactly-once guarantees across reloads/devices; authenticated end-to-end acceptance testing remains pending.

**Acceptance criteria:** invalid checkout data cannot create an order, a
successful order is stored once, and a failed request leaves the cart intact.

### 4. My Orders and tracking

- [ ] Fetch paginated buyer order history from the backend (the current endpoint returns the entire history; client-side paging is implemented).
- [x] Add order detail access with items, totals, address summary, and dates.
- [x] Implement cancellation only when the backend says the order is
      cancellable.
- [x] Display the tracking timeline:
      `Placed -> Confirmed -> Processing -> Shipped -> Delivered`.
- [x] Support cancelled and failed states without treating them as successful
      delivery states.
- [x] Add refresh/retry behavior and accessible status labels.

Order history now uses `orderStatus` and the actual `placed`/`confirmed` cancellation rules. Added protected `/orders/:id` details, server snapshot items/totals, address and dates, status filters, a five-stage accessible timeline, client-side pages, and refresh/retry controls. Cancellation fetches the latest order first, accepts only a server-confirmed cancelled response, and refreshes after either success or rejection. Request/session guards prevent stale responses being displayed. The backend currently emits no failed order status; failed/unknown statuses are handled defensively without showing a completed delivery. Server-side pagination and authenticated browser/cross-device acceptance tests remain pending.

**Acceptance criteria:** buyers can view current and historical orders, see
the server status, and cancel eligible orders without stale UI state.

### 5. Product reviews

- [x] Add a review endpoint and buyer eligibility check for delivered orders.
- [x] Add rating and review form validation.
- [x] Display approved reviews and aggregate rating data on product details.
- [x] Prevent duplicate reviews and expose moderation/error responses.

Implemented using the existing backend review routes/controller. Product details now show visible reviews and server aggregate ratings, with a buyer form restricted to delivered purchases containing that product. The form validates a whole-number 1–5 rating and a trimmed 5–1,000 character comment; submission rechecks the selected order. Visible reviews exclude already-reviewed purchases from selection, concurrent requests are blocked, and backend duplicate/permission/moderation errors are surfaced without clearing the draft. The backend makes reviews visible by default and provides admin visibility controls rather than a pending-approval workflow. Hidden existing reviews are not exposed by the public endpoint, so duplicate enforcement for those remains server-authoritative. All regression checks pass; live verification remains pending because the local catalog returned no products and no browser connection was available. No live review was submitted.

## Phase 2: Seller functionality

### 6. Seller registration and profile

- [ ] Build seller application form with validation and submission status.
- [ ] Add seller profile/shop data, location, description, and image handling.
- [ ] Show pending, approved, rejected, and resubmission states.

### 7. Seller dashboard

- [ ] Add protected seller routes and role checks.
- [ ] Display product count, order count, revenue, and sales trends.
- [ ] Add date-range and status filters with clear empty states.

### 8. Product and shop management

- [ ] Add create, edit, delete, availability, category, stock, price, and image
      workflows.
- [ ] Add server validation and confirmation for destructive actions.
- [ ] Add shop name, description, location, and profile-image editing.

### 9. Seller order management

- [ ] List seller-owned order items with buyer-safe delivery information.
- [ ] Allow valid status transitions only.
- [ ] Notify the buyer when an order status changes.

## Phase 3: Admin functionality

- [ ] Add protected admin routes and role-based authorization checks.
- [ ] Build marketplace dashboard statistics.
- [ ] Add seller application approval and rejection workflows.
- [ ] Add product moderation and availability controls.
- [ ] Add all-order management with filters and status actions.
- [ ] Add user management for buyers, sellers, and account states.
- [ ] Record and surface audit-friendly success and error feedback.

## Phase 4: Additional marketplace features

Implement after the core buyer, seller, and admin workflows are stable:

1. Search and filters by product name, category, price, and artisan
2. Payment gateway integration using a provider-hosted or tokenized flow
3. Buyer and seller notifications for order events
4. AI-generated product descriptions with seller confirmation before saving
5. Image-based similarity search
6. Personalized product recommendations

Each feature should have an explicit API contract, loading/error states,
permission checks, and an opt-in or feature flag where rollout risk is high.

## Phase 5: Testing and release

- [ ] Add component tests for product cards, cart mutations, forms, and status
      displays.
- [ ] Add API integration tests for authentication, cart, wishlist, checkout,
      orders, seller actions, and admin actions.
- [ ] Test buyer, seller, and admin workflows end to end.
- [ ] Test authorization boundaries and invalid/malicious input handling.
- [ ] Test responsive layouts on mobile, tablet, and desktop breakpoints.
- [ ] Run lint, production build, and any configured test suites in CI.
- [ ] Configure production API URLs, environment variables, logging, and error
      monitoring.
- [ ] Update README, setup instructions, API prerequisites, screenshots, and
      release notes.

## Recommended implementation order

1. Shared Axios/auth/API foundation
2. Cart integration
3. Wishlist integration
4. Checkout and order placement
5. My Orders, cancellation, and tracking
6. Product reviews
7. Seller registration and dashboard
8. Seller product, shop, and order management
9. Admin dashboard and moderation
10. Testing, deployment, and documentation

## Definition of done for each feature

- Backend contract is documented and verified against a running API.
- Protected operations enforce authentication and authorization.
- Loading, empty, validation, success, and failure states are implemented.
- Refreshing the page does not lose server-backed state.
- Existing navigation and responsive layout remain functional.
- The smallest relevant lint, build, and test commands pass.
