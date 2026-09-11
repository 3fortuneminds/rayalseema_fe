import { motion } from 'framer-motion'
import { ClipboardList, MapPin, User, UtensilsCrossed } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Link, Route, Routes } from 'react-router-dom'

import AdminLayout from './layouts/AdminLayout'
import AppLayout from './layouts/AppLayout'
import DeliveryLayout from './layouts/DeliveryLayout'
import RestaurantLayout from './layouts/RestaurantLayout'
import RootLayout from './layouts/RootLayout'
import AddressBook from './pages/addresses/AddressBook'
import AdminAuditLog from './pages/admin/AdminAuditLog'
import AdminCoupons from './pages/admin/AdminCoupons'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminDeliveryPartners from './pages/admin/AdminDeliveryPartners'
import AdminOrders from './pages/admin/AdminOrders'
import AdminPayments from './pages/admin/AdminPayments'
import AdminRestaurants from './pages/admin/AdminRestaurants'
import AdminSettings from './pages/admin/AdminSettings'
import AdminUsers from './pages/admin/AdminUsers'
import ForgotPassword from './pages/auth/ForgotPassword'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ResetPassword from './pages/auth/ResetPassword'
import VerifyOtp from './pages/auth/VerifyOtp'
import CartPage from './pages/cart/CartPage'
import CheckoutPage from './pages/checkout/CheckoutPage'
import PaymentPage from './pages/checkout/PaymentPage'
import DeliveryRegister from './pages/delivery-auth/DeliveryRegister'
import DeliveryVerifyOtp from './pages/delivery-auth/DeliveryVerifyOtp'
import ActiveDelivery from './pages/delivery/ActiveDelivery'
import AvailableOrders from './pages/delivery/AvailableOrders'
import DeliveryProfile from './pages/delivery/DeliveryProfile'
import Earnings from './pages/delivery/Earnings'
import MyDeliveries from './pages/delivery/MyDeliveries'
import HelpSupport from './pages/help/HelpSupport'
import Offers from './pages/offers/Offers'
import OrderDetail from './pages/orders/OrderDetail'
import OrderHistory from './pages/orders/OrderHistory'
import Profile from './pages/profile/Profile'
import RestaurantAuthRegister from './pages/restaurant-auth/RestaurantRegister'
import RestaurantVerifyOtp from './pages/restaurant-auth/RestaurantVerifyOtp'
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard'
import IncomingOrders from './pages/restaurant/IncomingOrders'
import MenuManagement from './pages/restaurant/MenuManagement'
import RestaurantProfile from './pages/restaurant/RestaurantProfile'
import RestaurantReviews from './pages/restaurant/RestaurantReviews'
import SalesReports from './pages/restaurant/SalesReports'
import Favorites from './pages/restaurants/Favorites'
import RestaurantDetail from './pages/restaurants/RestaurantDetail'
import RestaurantList from './pages/restaurants/RestaurantList'
import SearchResults from './pages/search/SearchResults'
import ProtectedRoute from './routes/ProtectedRoute'

function Home() {
  const user = useSelector((state) => state.auth.user)
  const firstName = user?.full_name?.split(' ')[0]

  return (
    <div className="dashboard">
      <section className="welcome-card">
        <div className="welcome-card-text">
          <h1>Welcome back{firstName ? `, ${firstName}` : ''} 👋</h1>
          <p>
            Signed in as {user?.email}
            <span className="welcome-badge">{user?.role}</span>
          </p>
        </div>
        <motion.div
          className="welcome-card-art"
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <span className="welcome-card-art-ring" />
          <UtensilsCrossed size={34} strokeWidth={1.75} />
        </motion.div>
      </section>

      <div className="quick-links">
        <Link to="/restaurants" className="quick-card">
          <span className="quick-card-icon">
            <UtensilsCrossed size={20} />
          </span>
          <div>
            <h3>Browse restaurants</h3>
            <p>Find something delicious nearby</p>
          </div>
        </Link>
        <Link to="/profile" className="quick-card">
          <span className="quick-card-icon">
            <User size={20} />
          </span>
          <div>
            <h3>Profile</h3>
            <p>View and edit your account details</p>
          </div>
        </Link>
        <Link to="/addresses" className="quick-card">
          <span className="quick-card-icon">
            <MapPin size={20} />
          </span>
          <div>
            <h3>Address book</h3>
            <p>Manage your delivery addresses</p>
          </div>
        </Link>
        <Link to="/orders" className="quick-card">
          <span className="quick-card-icon">
            <ClipboardList size={20} />
          </span>
          <div>
            <h3>Order history</h3>
            <p>Track and review your orders</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/restaurant/register" element={<RestaurantAuthRegister />} />
        <Route path="/restaurant/verify-otp" element={<RestaurantVerifyOtp />} />

        <Route path="/delivery/register" element={<DeliveryRegister />} />
        <Route path="/delivery/verify-otp" element={<DeliveryVerifyOtp />} />

        <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/restaurants" element={<RestaurantList />} />
            <Route path="/restaurants/:slug" element={<RestaurantDetail />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/checkout/pay/:orderId" element={<PaymentPage />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/orders/:orderId" element={<OrderDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/addresses" element={<AddressBook />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/help" element={<HelpSupport />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['restaurant']} />}>
          <Route element={<RestaurantLayout />}>
            <Route path="/restaurant" element={<RestaurantDashboard />} />
            <Route path="/restaurant/menu" element={<MenuManagement />} />
            <Route path="/restaurant/orders" element={<IncomingOrders />} />
            <Route path="/restaurant/reports" element={<SalesReports />} />
            <Route path="/restaurant/reviews" element={<RestaurantReviews />} />
            <Route path="/restaurant/profile" element={<RestaurantProfile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['delivery']} />}>
          <Route element={<DeliveryLayout />}>
            <Route path="/delivery" element={<AvailableOrders />} />
            <Route path="/delivery/my-deliveries" element={<MyDeliveries />} />
            <Route path="/delivery/my-deliveries/:assignmentId" element={<ActiveDelivery />} />
            <Route path="/delivery/earnings" element={<Earnings />} />
            <Route path="/delivery/profile" element={<DeliveryProfile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/restaurants" element={<AdminRestaurants />} />
            <Route path="/admin/delivery-partners" element={<AdminDeliveryPartners />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/coupons" element={<AdminCoupons />} />
            <Route path="/admin/audit-log" element={<AdminAuditLog />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default App
