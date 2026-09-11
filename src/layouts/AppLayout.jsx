import {
  ClipboardList,
  Headphones,
  Heart,
  Home,
  MapPin,
  Percent,
  ShoppingCart,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

import PageTransition from "../components/PageTransition";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

const NAV_ITEMS = [
  { to: "/restaurants", label: "Restaurants", icon: UtensilsCrossed },
  { to: "/orders", label: "Orders", icon: ClipboardList },
  { to: "/profile", label: "My Profile", icon: User },
  { to: "/addresses", label: "Addresses", icon: MapPin },
  { to: "/favorites", label: "Favorites", icon: Heart },
  { to: "/offers", label: "Offers", icon: Percent },
  { to: "/help", label: "Help & Support", icon: Headphones },
];

const PROMO = (
  <NavLink to="/restaurants" className="sidebar-promo">
    <strong>Get 20% OFF</strong>
    <span>On your first order</span>
    <span className="sidebar-promo-btn">Order now</span>
  </NavLink>
);

const bottomNavLinkClass = ({ isActive }) => `bottom-nav-link${isActive ? " active" : ""}`;

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = useSelector((state) => state.cart.items.reduce((sum, i) => sum + i.quantity, 0));

  return (
    <div className="dashboard-shell">
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        navItems={NAV_ITEMS}
        promo={PROMO}
        profileTo="/profile"
      />
      <div className="dashboard-shell-main">
        <TopBar onMenuClick={() => setMenuOpen(true)} />
        <main className="app-main">
          <PageTransition />
        </main>
      </div>

      <nav className="bottom-nav" aria-label="Primary">
        <NavLink to="/" end className={bottomNavLinkClass}>
          <Home size={20} />
          Home
        </NavLink>
        <NavLink to="/restaurants" className={bottomNavLinkClass}>
          <UtensilsCrossed size={20} />
          Restaurants
        </NavLink>
        <NavLink to="/cart" className={bottomNavLinkClass}>
          <ShoppingCart size={20} />
          {cartCount > 0 && <span className="bottom-nav-badge">{cartCount}</span>}
          Cart
        </NavLink>
        <NavLink to="/orders" className={bottomNavLinkClass}>
          <ClipboardList size={20} />
          Orders
        </NavLink>
        <NavLink to="/profile" className={bottomNavLinkClass}>
          <User size={20} />
          Profile
        </NavLink>
      </nav>
    </div>
  );
}
