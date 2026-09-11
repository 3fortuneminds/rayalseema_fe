import {
  Bike,
  ClipboardList,
  CreditCard,
  History,
  LayoutDashboard,
  Percent,
  Settings,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import { useState } from "react";

import PageTransition from "../components/PageTransition";
import PortalTopBar from "../components/PortalTopBar";
import Sidebar from "../components/Sidebar";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/restaurants", label: "Restaurants", icon: UtensilsCrossed },
  { to: "/admin/delivery-partners", label: "Delivery", icon: Bike },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/coupons", label: "Coupons", icon: Percent },
  { to: "/admin/audit-log", label: "Audit log", icon: History },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="dashboard-shell">
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        navItems={NAV_ITEMS}
        brandTo="/admin"
        brandTagline="Admin Console"
      />
      <div className="dashboard-shell-main">
        <PortalTopBar title="Admin Console" onMenuClick={() => setMenuOpen(true)} />
        <main className="app-main">
          <PageTransition />
        </main>
      </div>
    </div>
  );
}
