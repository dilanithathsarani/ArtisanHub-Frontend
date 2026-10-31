# ArtisanHub Next Development Plan

## Current baseline

The frontend already includes the main buyer routes:

- Home, shop, categories, artisans, and product details
- Cart, checkout, order success, my orders, and wishlist
- Authentication and password-reset screens

Cart and wishlist interactions currently rely on `localStorage`, while checkout
and my orders contain partial Axios integration. The next implementation stage
should move these flows to a consistent backend-backed experience without
removing the existing UI behavior.

## Shared foundation

Complete these cross-cutting pieces before expanding marketplace features:

- [ ] Confirm the backend API contract, authentication token format, resource
      shapes, error responses, pagination, and order status values.
- [ ] Add a shared Axios client using `VITE_API_URL`, request authentication,
      and consistent error handling.
- [ ] Add reusable auth and API-loading patterns for protected pages.
- [ ] Define shared product, cart, wishlist, address, order, and user data
      shapes.
- [ ] Decide how guest cart/wishlist data is merged or discarded at login.
- [ ] Add environment configuration documentation and backend connectivity
      checks.

## Phase 1: Buyer functionality

### 1. Cart integration

- [ ] Add an authenticated `Add to Cart` action to `ProductCard` and
      `ProductDetailsPage`.
- [ ] Fetch the current cart from the backend when `CartPage` loads.
- [ ] Support quantity updates and item removal through backend endpoints.
- [ ] Show loading, empty, stock-limit, authentication, and API error states.
- [ ] Keep local cart data only as a deliberate guest fallback, then synchronize
      it after login.
- [ ] Update cart counts and totals after every successful mutation.

**Acceptance criteria:** a buyer can add a product, refresh the page, change
quantity, remove an item, and see the same cart from another authenticated
session.

### 2. Wishlist integration

- [ ] Replace the local-only wishlist source with backend fetch, add, remove,
      and clear operations for logged-in users.
- [ ] Update the heart state consistently across product cards, product
      details, and the wishlist page.
- [ ] Handle duplicate requests, unavailable products, and failed
      synchronization explicitly.
- [ ] Define guest wishlist behavior and merge rules at login.

**Acceptance criteria:** wishlist changes persist across refreshes and devices
for the same buyer, and all wishlist surfaces remain synchronized.

### 3. Checkout and order placement

- [ ] Load checkout items and authoritative prices from the backend cart.
- [ ] Validate delivery details with field-level messages and server-side
      validation feedback.
- [ ] Keep payment handling secure; never send or persist raw card data unless a
      backend-approved payment provider flow is in place.
- [ ] Submit one validated order request and handle duplicate-submit prevention.
- [ ] Clear the cart only after confirmed order creation.
- [ ] Display the created order number, totals, delivery details, and next
      steps on the order-success page.

**Acceptance criteria:** invalid checkout data cannot create an order, a
successful order is stored once, and a failed request leaves the cart intact.

### 4. My Orders and tracking

- [ ] Fetch paginated buyer order history from the backend.
- [ ] Add order detail access with items, totals, address summary, and dates.
- [ ] Implement cancellation only when the backend says the order is
      cancellable.
- [ ] Display the tracking timeline:
      `Placed -> Confirmed -> Processing -> Shipped -> Delivered`.
- [ ] Support cancelled and failed states without treating them as successful
      delivery states.
- [ ] Add refresh/retry behavior and accessible status labels.

**Acceptance criteria:** buyers can view current and historical orders, see
the server status, and cancel eligible orders without stale UI state.

### 5. Product reviews

- [ ] Add a review endpoint and buyer eligibility check for delivered orders.
- [ ] Add rating and review form validation.
- [ ] Display approved reviews and aggregate rating data on product details.
- [ ] Prevent duplicate reviews and expose moderation/error responses.

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
