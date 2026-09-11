import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { toast } from "../../components/Toast";
import { ORDER_STATUS_LABELS } from "../../constants/orderStatus";
import { listMyDeliveries } from "../../services/deliveryApi";

const ASSIGNMENT_LABELS = {
  assigned: "Assigned",
  picked_up: "Picked up",
  delivered: "Delivered",
};

export default function MyDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyDeliveries()
      .then(({ data }) => setDeliveries(data.data))
      .catch(() => toast.error("Could not load your deliveries"))
      .finally(() => setLoading(false));
  }, []);

  const active = deliveries.filter((d) => d.status !== "delivered");
  const past = deliveries.filter((d) => d.status === "delivered");

  if (loading) return <div className="page-loading">Loading…</div>;

  return (
    <div className="orders-queue-page">
      <div className="page-header">
        <div>
          <h1>My deliveries</h1>
          <p>Active and past deliveries</p>
        </div>
      </div>

      {active.length === 0 ? (
        <div className="empty-state">No active deliveries. Accept one from the available orders list.</div>
      ) : (
        <div className="order-queue-list">
          {active.map((d) => (
            <Link key={d.id} to={`/delivery/my-deliveries/${d.id}`} className="order-queue-card">
              <div className="order-queue-header">
                <div className="order-queue-header-main">
                  {d.order.restaurant_cover_image ? (
                    <img className="order-thumb" src={d.order.restaurant_cover_image} alt="" />
                  ) : (
                    <span className="order-thumb order-thumb-fallback">🍽️</span>
                  )}
                  <div>
                    <strong>{d.order.restaurant_name}</strong>
                    <p>
                      {d.order.item_count} item{d.order.item_count === 1 ? "" : "s"} · ₹
                      {Number(d.order.total_amount).toFixed(0)}
                    </p>
                  </div>
                </div>
                <span className={`badge status-${d.status}`}>{ASSIGNMENT_LABELS[d.status] ?? d.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <>
          <h2 className="section-title">Past deliveries</h2>
          <div className="order-queue-list">
            {past.map((d) => (
              <Link key={d.id} to={`/delivery/my-deliveries/${d.id}`} className="order-queue-card">
                <div className="order-queue-header">
                  <div className="order-queue-header-main">
                    {d.order.restaurant_cover_image ? (
                      <img className="order-thumb" src={d.order.restaurant_cover_image} alt="" />
                    ) : (
                      <span className="order-thumb order-thumb-fallback">🍽️</span>
                    )}
                    <div>
                      <strong>{d.order.restaurant_name}</strong>
                      <p>
                        Earned ₹{Number(d.earning_amount).toFixed(0)} ·{" "}
                        {ORDER_STATUS_LABELS[d.order.status] ?? d.order.status}
                      </p>
                    </div>
                  </div>
                  <span className="badge status-delivered">Delivered</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
