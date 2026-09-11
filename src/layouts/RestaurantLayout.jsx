import { AlertTriangle, BarChart3, ClipboardList, LayoutDashboard, Star, User, UtensilsCrossed } from "lucide-react";
import { useState } from "react";

import PageTransition from "../components/PageTransition";
import PortalTopBar from "../components/PortalTopBar";
import Sidebar from "../components/Sidebar";
import { RestaurantProvider, useMyRestaurant } from "../context/RestaurantContext";

const NAV_ITEMS = [
  { to: "/restaurant", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/restaurant/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/restaurant/orders", label: "Orders", icon: ClipboardList },
  { to: "/restaurant/reports", label: "Reports", icon: BarChart3 },
  { to: "/restaurant/reviews", label: "Reviews", icon: Star },
  { to: "/restaurant/profile", label: "Profile", icon: User },
];

function PendingApprovalBanner() {
  const { restaurant, loading } = useMyRestaurant();
  if (loading || !restaurant || restaurant.is_approved) return null;

  return (
    <div className="pending-approval-banner">
      <AlertTriangle size={16} />
      Your restaurant is awaiting admin approval. You can still set up your profile and menu — orders will start
      arriving once you're approved.
    </div>
  );
}

function RestaurantShell() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="dashboard-shell">
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        navItems={NAV_ITEMS}
        brandTo="/restaurant"
        brandTagline="Restaurant Partner"
        profileTo="/restaurant/profile"
      />
      <div className="dashboard-shell-main">
        <PortalTopBar title="Restaurant Partner" onMenuClick={() => setMenuOpen(true)} profileTo="/restaurant/profile" />
        <PendingApprovalBanner />
        <main className="app-main">
          <PageTransition />
        </main>
      </div>
    </div>
  );
}

export default function RestaurantLayout() {
  return (
    <RestaurantProvider>
      <RestaurantShell />
    </RestaurantProvider>
  );
}
