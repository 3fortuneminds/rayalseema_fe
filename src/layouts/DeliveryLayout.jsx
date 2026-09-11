import { AlertTriangle, Search, Truck, User, Wallet } from "lucide-react";
import { useState } from "react";

import PageTransition from "../components/PageTransition";
import PortalTopBar from "../components/PortalTopBar";
import Sidebar from "../components/Sidebar";
import { toast } from "../components/Toast";
import { DeliveryProvider, useMyDeliveryPartner } from "../context/DeliveryContext";
import { toggleOnline } from "../services/deliveryApi";

const NAV_ITEMS = [
  { to: "/delivery", label: "Available Orders", icon: Search, end: true },
  { to: "/delivery/my-deliveries", label: "My Deliveries", icon: Truck },
  { to: "/delivery/earnings", label: "Earnings", icon: Wallet },
  { to: "/delivery/profile", label: "Profile", icon: User },
];

function PendingApprovalBanner() {
  const { partner, loading } = useMyDeliveryPartner();
  if (loading || !partner || partner.is_approved) return null;

  return (
    <div className="pending-approval-banner">
      <AlertTriangle size={16} />
      Your delivery partner account is awaiting admin approval. You'll be able to go online and accept deliveries
      once you're approved.
    </div>
  );
}

function OnlineToggle() {
  const { partner, setPartner } = useMyDeliveryPartner();
  const [toggling, setToggling] = useState(false);
  if (!partner) return null;

  const handleToggleOnline = async () => {
    setToggling(true);
    try {
      const { data } = await toggleOnline();
      setPartner(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Could not update availability");
    } finally {
      setToggling(false);
    }
  };

  return (
    <button
      type="button"
      className={`online-toggle${partner.is_online ? " online" : ""}`}
      onClick={handleToggleOnline}
      disabled={toggling || !partner.is_approved}
      title={partner.is_approved ? "Toggle availability" : "Pending approval"}
    >
      <span className="online-toggle-dot" />
      <span className="online-toggle-label">{partner.is_online ? "Online" : "Offline"}</span>
    </button>
  );
}

function DeliveryShell() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="dashboard-shell">
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        navItems={NAV_ITEMS}
        brandTo="/delivery"
        brandTagline="Delivery Partner"
        profileTo="/delivery/profile"
      />
      <div className="dashboard-shell-main">
        <PortalTopBar
          title="Delivery Partner"
          onMenuClick={() => setMenuOpen(true)}
          profileTo="/delivery/profile"
          extra={<OnlineToggle />}
        />
        <PendingApprovalBanner />
        <main className="app-main">
          <PageTransition />
        </main>
      </div>
    </div>
  );
}

export default function DeliveryLayout() {
  return (
    <DeliveryProvider>
      <DeliveryShell />
    </DeliveryProvider>
  );
}
