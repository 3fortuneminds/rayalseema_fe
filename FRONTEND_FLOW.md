# Rayalseema — Frontend Flow

React single-page app for the Rayalseema food-delivery platform. One app,
four experiences: it renders a completely different layout, navigation, and
route tree depending on the logged-in user's `role` — customer, restaurant
owner, delivery partner, or admin — all against the same Django REST backend
documented in `../backend/BACKEND_FLOW.md`.

## Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Vite 6 |
| Routing | React Router 7 (`BrowserRouter`, nested routes, layout routes) |
| Global state | Redux Toolkit — two slices: `auth` (session) and `cart` (in-memory, not persisted) |
| Server state | TanStack React Query — per-page data fetching/caching, not stored in Redux |
| HTTP | Axios instance with a request interceptor (attaches JWT) and a response interceptor (auto-refreshes on 401) |
| Realtime | Native `WebSocket`, one small helper (`services/websocket.js`) — used for live order status and delivery location |
| Styling | Plain CSS, no framework — a single `src/index.css` design-token system (colors/type/spacing as CSS custom properties), consumed via class names |
| Toasts | `react-hot-toast` |
| Icons | `lucide-react` |

No TypeScript — plain `.jsx`. No CSS-in-JS, no Tailwind, no component
library — every visual component (`Button`, `Input`, `FoodCard`, etc.) is
hand-rolled in `src/components/`.

## Boot sequence (`main.jsx`)

```
<Provider store={reduxStore}>          Redux — auth + cart
  <QueryClientProvider>                React Query — server-state cache
    <BrowserRouter>
      <App />                         route table (App.jsx)
```

`store/index.js` combines `authSlice` + `cartSlice`. On first load,
`authSlice`'s initial state is read straight out of `localStorage` (via
`services/tokenStorage.js`) — so a page refresh doesn't log you out, but
closing the *cart* does clear it (cart is intentionally not persisted).

## Auth flow

```
Login.jsx
  → POST /accounts/token/ (services/authApi.js)
  → dispatch(setCredentials({ access, refresh, user }))
       → tokenStorage.setSession(...) writes access/refresh/user to localStorage
       → navigate(homeForRole(user.role))   e.g. "/", "/restaurant", "/delivery", "/admin"
```

Every subsequent request goes through the shared `axios` instance in
`services/api.js`:

- **Request interceptor** — reads the access token from `tokenStorage` and
  sets `Authorization: Bearer <token>` on every outgoing request.
- **Response interceptor** — on a `401`, it transparently calls
  `POST /accounts/token/refresh/` with the stored refresh token, retries the
  original request once with the new access token, and only if *that* fails
  does it clear the session and hard-redirect to `/login`. Concurrent 401s
  share a single in-flight refresh call (`refreshPromise`) so a burst of
  requests doesn't trigger a burst of refresh calls.

`routes/ProtectedRoute.jsx` gates entire route subtrees:

```jsx
<Route element={<ProtectedRoute allowedRoles={['customer']} />}>
  <Route element={<AppLayout />}>
    ...customer-only pages...
```

If you're not authenticated it redirects to `/login`; if you're authenticated
but the wrong role, it redirects to *your* role's home instead of showing a
403 — e.g. a delivery partner hitting `/admin` lands back on `/delivery`.

## Route tree (`App.jsx`)

```
/login, /register, /verify-otp, /forgot-password, /reset-password        (public)
/restaurant/register, /restaurant/verify-otp                             (public — restaurant signup)
/delivery/register, /delivery/verify-otp                                 (public — delivery signup)

[customer]  AppLayout (Navbar + bottom tab bar on mobile)
  /                        Home dashboard
  /restaurants             Browse
  /restaurants/:slug       Restaurant detail + menu
  /search                  Cross-restaurant search
  /cart, /checkout, /checkout/pay/:orderId
  /orders, /orders/:orderId
  /profile, /addresses

[restaurant]  RestaurantLayout
  /restaurant               Dashboard
  /restaurant/menu          Menu management
  /restaurant/orders        Incoming orders queue
  /restaurant/reports       Sales reports
  /restaurant/reviews       Reviews + responses
  /restaurant/profile       Business profile + opening hours

[delivery]  DeliveryLayout
  /delivery                       Available orders
  /delivery/my-deliveries         Assignment history
  /delivery/my-deliveries/:id     Active delivery (live map)
  /delivery/earnings
  /delivery/profile

[admin]  AdminLayout
  /admin, /admin/users, /admin/restaurants, /admin/delivery-partners,
  /admin/orders, /admin/payments, /admin/coupons, /admin/audit-log, /admin/settings
```

Each role has its own `<Role>Layout.jsx` (in `src/layouts/`) that renders
that role's navbar component (`Navbar`, `RestaurantNavbar`, `DeliveryNavbar`,
`AdminNavbar` in `src/components/`) plus an `<Outlet/>`. All four navbars
share the same CSS classes (`.navbar`, `.navbar-links`, `.nav-link`, …) so
the responsive/hamburger/mobile behavior is defined once in `index.css` and
applies everywhere.

## Data flow: how a page gets its data

Pages don't call `axios` directly — they call a function from
`src/services/<domain>Api.js`, which is a thin wrapper around the shared
`api` instance:

```js
// services/orderApi.js
import api from "./api";
export const createOrder = (payload) => api.post("/orders/", payload);
export const getOrder = (id) => api.get(`/orders/${id}/`);
export const listOrders = () => api.get("/orders/");
```

One service module per backend app: `authApi`, `addressApi`, `restaurantApi`,
`restaurantOwnerApi`, `foodApi`, `menuApi`, `searchApi`, `orderApi`,
`restaurantOrderApi`, `paymentApi`, `couponApi`, `notificationApi`,
`reviewApi`, `deliveryApi`, `analyticsApi`, `adminApi` — 1:1 with the backend
apps documented in `BACKEND_FLOW.md`.

Pages then use React Query to call those functions, so loading/error state
and caching are handled for free instead of hand-rolled `useEffect` +
`useState`:

```jsx
const { data, isLoading } = useQuery({
  queryKey: ['restaurants', filters],
  queryFn: () => listRestaurants(filters),
});
```

Redux is deliberately *not* used for server data — only for the two pieces
of truly global client state: who's logged in (`auth`) and what's in the
cart (`cart`). Everything else (restaurant lists, orders, reviews, admin
tables…) lives in React Query's cache, scoped to whichever page asked for it.

## Cart → checkout → payment

The cart (`store/cartSlice.js`) is pure client-side state — it is **not**
persisted to `localStorage` and is **not** synced to the backend until
checkout. Adding an item from a different restaurant than what's already in
the cart clears the cart first (single-restaurant-per-order, matching the
backend constraint). Flow:

```
RestaurantDetail → add items → CartPage (local review, qty +/-)
  → CheckoutPage → pick a saved address, apply a coupon (validated live
     against POST /coupons/validate/) → "Place order" → POST /orders/
  → PaymentPage (/checkout/pay/:orderId) → POST /payments/create/
     → (stub or real Razorpay checkout) → POST /payments/verify/
  → OrderDetail — polls/subscribes to status, shows the live tracking map
     once the order is out_for_delivery
```

## Realtime

`services/websocket.js` opens a plain `WebSocket` to
`${VITE_WS_BASE_URL}<path>?token=<access_token>` and exposes
`onOpen/onMessage/onClose/onError` callbacks. It's used by:
- `OrderDetail` / `LiveTrackingMap` — live delivery partner location and
  order status pushes, so a customer watching an active order doesn't have
  to poll.
- `NotificationBell` — live unread-notification updates.

## Design system

Everything visual is driven by CSS custom properties defined once in
`src/index.css` — colors (`--primary`, `--accent`, `--success`, `--danger`,
`--bg`, `--surface`, `--text`, `--heading`, …), a light/dark pair for each
(via `prefers-color-scheme` + a `data-theme` override), spacing/radius/shadow
scales, and a single typeface (Inter) for both UI and headings. Components
are plain class names (`.btn`, `.card`, `.food-card`, `.admin-table`, …), not
CSS modules or styled-components, so the whole app re-themes by editing the
token values at the top of that one file.

Responsive behavior: all four navbars collapse into a hamburger dropdown
below 860px; the customer app additionally shows a fixed bottom tab bar
(Home / Restaurants / Cart / Orders / Profile) below 640px. Data tables
(`admin-table`, `report-table`) scroll horizontally inside their card rather
than squeezing columns illegibly on narrow screens.

## Environment variables (`.env`)

```
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_WS_BASE_URL=ws://127.0.0.1:8000/ws
VITE_GOOGLE_MAPS_API_KEY=        # optional — address map picker
VITE_GOOGLE_OAUTH_CLIENT_ID=     # optional — "Sign in with Google"
```

## Local setup

See `../SETUP.md` at the project root for the one-command setup, or manually:

```bash
cd frontend
npm install
copy .env.example .env    # cp on macOS/Linux, or create the file per the table above
npm run dev                # http://localhost:5173
```

`npm run build` produces a production bundle; `npm run lint` runs `oxlint`.
