import { useEffect, useState } from "react";

import { toast } from "../../components/Toast";
import { ORDER_STATUS_LABELS } from "../../constants/orderStatus";
import { getAdminOrder, listAdminOrders } from "../../services/adminApi";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "placed", label: "Placed" },
  { value: "accepted", label: "Accepted" },
  { value: "preparing", label: "Preparing" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function OrderRow({ order }) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState(null);

  const toggleExpand = async () => {
    if (!expanded && !detail) {
      try {
        const { data } = await getAdminOrder(order.id);
        setDetail(data.data);
      } catch {
        toast.error("Could not load order detail");
      }
    }
    setExpanded((e) => !e);
  };

  return (
    <>
      <tr onClick={toggleExpand} style={{ cursor: "pointer" }}>
        <td>#{order.id.slice(0, 8)}</td>
        <td>
          <span className="admin-table-restaurant">
            {order.restaurant_cover_image ? (
              <img src={order.restaurant_cover_image} alt="" />
            ) : (
              <span className="admin-table-restaurant-fallback">🍽️</span>
            )}
            {order.restaurant_name}
          </span>
        </td>
        <td>
          <span className={`badge status-${order.status}`}>{ORDER_STATUS_LABELS[order.status] ?? order.status}</span>
        </td>
        <td>{order.payment_status}</td>
        <td>₹{Number(order.total_amount).toFixed(0)}</td>
        <td>{new Date(order.placed_at).toLocaleString()}</td>
      </tr>
      {expanded && detail && (
        <tr>
          <td colSpan={6}>
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
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listAdminOrders(status ? { status } : undefined)
      .then(({ data }) => setOrders(data.data))
      .catch(() => toast.error("Could not load orders"))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div className="admin-list-page">
      <div className="page-header">
        <div>
          <h1>All orders</h1>
          <p>Platform-wide order oversight</p>
        </div>
      </div>

      <div className="admin-filter-bar">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`chip${status === f.value ? " active" : ""}`}
            onClick={() => setStatus(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="page-loading">Loading…</div>
      ) : (
        <div className="card" style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Restaurant</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Placed at</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <OrderRow key={o.id} order={o} />
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
