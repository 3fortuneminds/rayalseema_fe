import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import LiveTrackingMap from "../../components/LiveTrackingMap";
import { toast } from "../../components/Toast";
import { getMyDelivery, markDelivered, markPickedUp, pushLocation } from "../../services/deliveryApi";

const LOCATION_PUSH_INTERVAL_MS = 10000;

export default function ActiveDelivery() {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [location, setLocation] = useState(null);
  const [busy, setBusy] = useState(false);
  const watchIdRef = useRef(null);
  const pushIntervalRef = useRef(null);
  const navigate = useNavigate();

  const refresh = () => {
    getMyDelivery(assignmentId)
      .then(({ data }) => setAssignment(data.data))
      .catch(() => toast.error("Delivery not found"));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  useEffect(() => {
    if (!assignment || assignment.status !== "picked_up" || !navigator.geolocation) return undefined;

    const pushCurrentPosition = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ lat: latitude, lng: longitude });
          pushLocation(assignment.order.id, latitude, longitude).catch(() => {});
        },
        () => {},
      );
    };

    pushCurrentPosition();
    pushIntervalRef.current = setInterval(pushCurrentPosition, LOCATION_PUSH_INTERVAL_MS);

    return () => {
      clearInterval(pushIntervalRef.current);
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [assignment]);

  const handlePickedUp = async () => {
    setBusy(true);
    try {
      await markPickedUp(assignmentId);
      toast.success("Marked as picked up");
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Could not update status");
    } finally {
      setBusy(false);
    }
  };

  const handleDelivered = async () => {
    setBusy(true);
    try {
      await markDelivered(assignmentId);
      toast.success("Delivery completed");
      navigate("/delivery/my-deliveries");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Could not update status");
    } finally {
      setBusy(false);
    }
  };

  if (!assignment) return <div className="page-loading">Loading…</div>;

  const { order } = assignment;
  const destination =
    order.latitude != null && order.longitude != null
      ? { lat: Number(order.latitude), lng: Number(order.longitude) }
      : null;

  return (
    <div className="order-detail-page">
      <div className="card">
        <div className="page-header">
          <div>
            <h1>{order.restaurant_name}</h1>
            <p>Order #{order.id.slice(0, 8)}</p>
          </div>
          <span className={`badge status-${assignment.status}`}>
            {assignment.status === "assigned" && "Assigned"}
            {assignment.status === "picked_up" && "Picked up"}
            {assignment.status === "delivered" && "Delivered"}
          </span>
        </div>

        {assignment.status === "picked_up" && (
          <div className="tracking-section">
            <h3>Live location</h3>
            <LiveTrackingMap location={location} destination={destination} />
          </div>
        )}

        <p className="order-queue-customer">
          {order.customer_name}
          {order.customer_phone && ` · ${order.customer_phone}`}
        </p>

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

        <h3 className="order-address-heading">Delivery address</h3>
        <p className="order-address">
          {order.address_label && <strong>{order.address_label}: </strong>}
          {order.address_line1}
          {order.address_line2 ? `, ${order.address_line2}` : ""}, {order.address_city} {order.address_state}{" "}
          {order.address_postal_code}
        </p>

        <div className="summary-row total">
          <span>Your earning</span>
          <span>₹{Number(assignment.earning_amount).toFixed(0)}</span>
        </div>

        <div className="order-queue-actions">
          {assignment.status === "assigned" && (
            <button type="button" className="btn btn-primary" disabled={busy} onClick={handlePickedUp}>
              Mark picked up
            </button>
          )}
          {assignment.status === "picked_up" && (
            <button type="button" className="btn btn-primary" disabled={busy} onClick={handleDelivered}>
              Mark delivered
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
