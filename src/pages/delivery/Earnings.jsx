import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

import CountUpValue from "../../components/CountUpValue";
import { toast } from "../../components/Toast";
import { getEarningsSummary, listMyDeliveries } from "../../services/deliveryApi";

export default function Earnings() {
  const [summary, setSummary] = useState(null);
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    getEarningsSummary()
      .then(({ data }) => setSummary(data.data))
      .catch(() => toast.error("Could not load earnings"));
    listMyDeliveries()
      .then(({ data }) => setDeliveries(data.data.filter((d) => d.status === "delivered")))
      .catch(() => {});
  }, []);

  if (!summary) return <div className="page-loading">Loading…</div>;

  return (
    <div className="dashboard">
      <section className="welcome-card">
        <h1>Earnings</h1>
        <p>Track your delivery earnings over time</p>
      </section>

      <div className="stat-grid">
        <div className="card stat-card">
          <span className="stat-card-icon">
            <TrendingUp size={20} />
          </span>
          <div>
            <p className="stat-card-label">Today</p>
            <p className="stat-card-value">
              <CountUpValue value={summary.today.earnings} prefix="₹" />
            </p>
            <p className="hint">{summary.today.deliveries} deliveries</p>
          </div>
        </div>
        <div className="card stat-card">
          <span className="stat-card-icon">
            <TrendingUp size={20} />
          </span>
          <div>
            <p className="stat-card-label">This week</p>
            <p className="stat-card-value">
              <CountUpValue value={summary.this_week.earnings} prefix="₹" />
            </p>
            <p className="hint">{summary.this_week.deliveries} deliveries</p>
          </div>
        </div>
        <div className="card stat-card">
          <span className="stat-card-icon">
            <TrendingUp size={20} />
          </span>
          <div>
            <p className="stat-card-label">All time</p>
            <p className="stat-card-value">
              <CountUpValue value={summary.all_time.earnings} prefix="₹" />
            </p>
            <p className="hint">{summary.all_time.deliveries} deliveries</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Delivery history</h2>
        {deliveries.length === 0 ? (
          <p className="empty-state">No completed deliveries yet.</p>
        ) : (
          <ul className="top-items-list">
            {deliveries.map((d) => (
              <li key={d.id}>
                <span>{d.order.restaurant_name}</span>
                <span className="badge">₹{Number(d.earning_amount).toFixed(0)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
