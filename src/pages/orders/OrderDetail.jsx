import { CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import LiveTrackingMap from "../../components/LiveTrackingMap";
import OrderReviewSection from "../../components/OrderReviewSection";
import OrderStatusStepper from "../../components/OrderStatusStepper";
import { toast } from "../../components/Toast";
import { ORDER_STATUS_LABELS } from "../../constants/orderStatus";
import { getOrder } from "../../services/orderApi";
import { createSocket } from "../../services/websocket";

export default function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [location, setLocation] = useState(null);
  const [live, setLive] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    getOrder(orderId)
      .then(({ data }) => setOrder(data.data))
      .catch(() => toast.error("Order not found"));
  }, [orderId]);

  useEffect(() => {
    const socket = createSocket(`/orders/${orderId}/`, {
      onOpen: () => setLive(true),
      onClose: () => setLive(false),
      onMessage: (msg) => {
        if (msg.type === "snapshot" || msg.type === "order.status") {
          setOrder((prev) => (prev ? { ...prev, status: msg.status, payment_status: msg.payment_status } : prev));
        }
        if (msg.type === "snapshot" && msg.location) {
          setLocation({ lat: Number(msg.location.latitude), lng: Number(msg.location.longitude) });
        }
        if (msg.type === "location.update") {
          setLocation({ lat: Number(msg.latitude), lng: Number(msg.longitude) });
        }
      },
    });
    socketRef.current = socket;
    return () => socket.close();
  }, [orderId]);

  if (!order) return <div className="page-loading">Loading…</div>;

  const destination =
    order.latitude != null && order.longitude != null
      ? { lat: Number(order.latitude), lng: Number(order.longitude) }
      : null;

  return (
    <div className="order-detail-page">
      {order.payment_status === "paid" && order.status === "placed" && (
        <div className="order-confirmed-banner">
          <CheckCircle2 size={20} />
          Order confirmed — thank you!
        </div>
      )}

      <div className="card">
        <div className="page-header">
          <div>
            <h1>{order.restaurant_name}</h1>
            <p>Order #{order.id.slice(0, 8)}</p>
          </div>
          <div className="order-status-col">
            <span className={`badge status-${order.status}`}>{ORDER_STATUS_LABELS[order.status] ?? order.status}</span>
            <span className={`live-indicator${live ? " connected" : ""}`}>
              <span className="live-dot" />
              {live ? "Live" : "Connecting…"}
            </span>
          </div>
        </div>

        <OrderStatusStepper status={order.status} />

        {order.status === "out_for_delivery" && (
          <div className="tracking-section">
            <h3>Live delivery tracking</h3>
            <LiveTrackingMap location={location} destination={destination} />
          </div>
        )}

        <ul className="checkout-summary-items">
          {order.items.map((item) => (
            <li key={item.id}>
              <span>
                {item.quantity} × {item.food_name}
                {item.variant_name && ` (${item.variant_name})`}
              </span>
              <span>₹{Number(item.line_total).toFixed(0)}</span>
            </li>
          ))}
        </ul>

        <div className="summary-row">
          <span>Subtotal</span>
          <span>₹{Number(order.subtotal).toFixed(0)}</span>
        </div>
        <div className="summary-row">
          <span>Delivery fee</span>
          <span>₹{Number(order.delivery_fee).toFixed(0)}</span>
        </div>
        {Number(order.discount_amount) > 0 && (
          <div className="summary-row discount">
            <span>Discount</span>
            <span>-₹{Number(order.discount_amount).toFixed(0)}</span>
          </div>
        )}
        <div className="summary-row total">
          <span>Total</span>
          <span>₹{Number(order.total_amount).toFixed(0)}</span>
        </div>

        <h3 className="order-address-heading">Delivery address</h3>
        <p className="order-address">
          {order.address_label && <strong>{order.address_label}: </strong>}
          {order.address_line1}
          {order.address_line2 ? `, ${order.address_line2}` : ""}, {order.address_city} {order.address_state}{" "}
          {order.address_postal_code}
        </p>

        <OrderReviewSection
          order={order}
          onReviewSubmitted={(review) => setOrder((prev) => ({ ...prev, review }))}
        />
      </div>

      <Link to="/restaurants" className="link-inline">
        Continue browsing
      </Link>
    </div>
  );
}
