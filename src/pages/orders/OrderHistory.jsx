import { FileText, Headphones, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { toast } from "../../components/Toast";
import { ORDER_STATUS_LABELS } from "../../constants/orderStatus";
import { listOrders } from "../../services/orderApi";

export default function OrderHistory() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    listOrders()
      .then(({ data }) => setOrders(data.data))
      .catch(() => toast.error("Could not load orders"));
  }, []);

  if (orders === null) return <div className="page-loading">Loading…</div>;

  return (
    <div className="order-history-page">
      <div className="page-header">
        <div>
          <h1>Your orders</h1>
          <p>Track and review your past orders</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          No orders yet.{" "}
          <Link to="/restaurants" className="link-inline">
            Browse restaurants
          </Link>
        </div>
      ) : (
        <ul className="order-history-list">
          {orders.map((o) => (
            <li key={o.id}>
              <Link to={`/orders/${o.id}`} className="order-history-card">
                {o.restaurant_cover_image ? (
                  <img className="order-thumb" src={o.restaurant_cover_image} alt="" />
                ) : (
                  <span className="order-thumb order-thumb-fallback">🍽️</span>
                )}
                <div className="order-history-info">
                  <h3>{o.restaurant_name}</h3>
                  <p>
                    {o.item_count} item{o.item_count === 1 ? "" : "s"} ·{" "}
                    {new Date(o.placed_at).toLocaleDateString(undefined, { day: "numeric", month: "short" })} ·{" "}
                    {new Date(o.placed_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                  </p>
                  <span className="order-history-view-btn">
                    <FileText size={13} />
                    View details
                  </span>
                </div>
                <div className="order-history-right">
                  <span className={`badge status-${o.status}`}>{ORDER_STATUS_LABELS[o.status] ?? o.status}</span>
                  <strong>₹{Number(o.total_amount).toFixed(0)}</strong>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="order-history-trust-row">
        <div>
          <ShieldCheck size={18} />
          <div>
            <strong>Safe & Secure</strong>
            <span>100% secure payments</span>
          </div>
        </div>
        <div>
          <Headphones size={18} />
          <div>
            <strong>Need Help?</strong>
            <span>We're here to assist you</span>
          </div>
        </div>
        <div>
          <RefreshCw size={18} />
          <div>
            <strong>Easy Returns</strong>
            <span>Hassle free returns</span>
          </div>
        </div>
      </div>
    </div>
  );
}
