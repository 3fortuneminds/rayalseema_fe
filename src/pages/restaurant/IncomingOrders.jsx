import { useEffect, useState } from "react";

import { toast } from "../../components/Toast";
import { ORDER_STATUS_LABELS } from "../../constants/orderStatus";
import { useMyRestaurant } from "../../context/RestaurantContext";
import { acceptOrder, advanceOrder, getRestaurantOrder, listRestaurantOrders, rejectOrder } from "../../services/restaurantOrderApi";
import { createSocket } from "../../services/websocket";

const ADVANCE_LABEL = {
  accepted: "Start preparing",
  preparing: "Mark ready for pickup",
};

function OrderCard({ order, onChanged }) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);

  const toggleExpand = async () => {
    if (!expanded && !detail) {
      try {
        const { data } = await getRestaurantOrder(order.id);
        setDetail(data.data);
      } catch {
        toast.error("Could not load order detail");
      }
    }
    setExpanded((e) => !e);
  };

  const handleAccept = async () => {
    setBusy(true);
    try {
      await acceptOrder(order.id);
      toast.success("Order accepted");
      onChanged();
    } catch {
      toast.error("Could not accept order");
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    setBusy(true);
    try {
      await rejectOrder(order.id);
      toast.success("Order rejected");
      onChanged();
    } catch {
      toast.error("Could not reject order");
    } finally {
      setBusy(false);
    }
  };

  const handleAdvance = async () => {
    setBusy(true);
    try {
      await advanceOrder(order.id);
      toast.success("Status updated");
      onChanged();
    } catch {
      toast.error("Could not update status");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="order-queue-card">
      <button type="button" className="order-queue-header" onClick={toggleExpand}>
        <div>
          <strong>Order #{order.id.slice(0, 8)}</strong>
          <p>
            {order.item_count} item{order.item_count === 1 ? "" : "s"} · ₹{Number(order.total_amount).toFixed(0)}
          </p>
        </div>
        <span className={`badge status-${order.status}`}>{ORDER_STATUS_LABELS[order.status] ?? order.status}</span>
      </button>

      {expanded && detail && (
        <div className="order-queue-detail">
          <p className="order-queue-customer">
            {detail.customer_name}
            {detail.customer_phone && ` · ${detail.customer_phone}`}
          </p>
          <ul className="checkout-summary-items">
            {detail.items.map((item) => (
              <li key={item.id}>
                <span>
                  {item.quantity} × {item.food_name}
                  {item.variant_name && ` (${item.variant_name})`}
                </span>
                <span>₹{Number(item.line_total).toFixed(0)}</span>
              </li>
            ))}
          </ul>
          <p className="order-address">
            {detail.address_line1}
            {detail.address_line2 ? `, ${detail.address_line2}` : ""}, {detail.address_city} {detail.address_state}{" "}
            {detail.address_postal_code}
          </p>
        </div>
      )}

      <div className="order-queue-actions">
        {order.status === "placed" && (
          <>
            <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={handleAccept}>
              Accept
            </button>
            <button type="button" className="btn btn-danger btn-sm" disabled={busy} onClick={handleReject}>
              Reject
            </button>
          </>
        )}
        {ADVANCE_LABEL[order.status] && (
          <button type="button" className="btn btn-secondary btn-sm" disabled={busy} onClick={handleAdvance}>
            {ADVANCE_LABEL[order.status]}
          </button>
        )}
      </div>
    </div>
  );
}

export default function IncomingOrders() {
  const { restaurant } = useMyRestaurant();
  const [orders, setOrders] = useState([]);
  const [live, setLive] = useState(false);

  const refresh = () => {
    listRestaurantOrders()
      .then(({ data }) => setOrders(data.data))
      .catch(() => toast.error("Could not load orders"));
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!restaurant) return undefined;
    const socket = createSocket(`/restaurants/${restaurant.id}/orders/`, {
      onOpen: () => setLive(true),
      onClose: () => setLive(false),
      onMessage: (msg) => {
        if (msg.type === "order.new") {
          toast.success("New order received!");
          setOrders((prev) => [msg.order, ...prev]);
        }
      },
    });
    return () => socket.close();
  }, [restaurant]);

  const active = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const past = orders.filter((o) => ["delivered", "cancelled"].includes(o.status));

  return (
    <div className="orders-queue-page">
      <div className="page-header">
        <div>
          <h1>Incoming orders</h1>
          <p>Manage orders as they come in</p>
        </div>
        <span className={`live-indicator${live ? " connected" : ""}`}>
          <span className="live-dot" />
          {live ? "Live" : "Connecting…"}
        </span>
      </div>

      {active.length === 0 ? (
        <div className="empty-state">No active orders right now.</div>
      ) : (
        <div className="order-queue-list">
          {active.map((o) => (
            <OrderCard key={o.id} order={o} onChanged={refresh} />
          ))}
        </div>
      )}

      {past.length > 0 && (
        <>
          <h2 className="section-title">Past orders</h2>
          <div className="order-queue-list">
            {past.map((o) => (
              <OrderCard key={o.id} order={o} onChanged={refresh} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
