import { Bike, ShoppingBag, TrendingUp, Users, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";

import CountUpValue from "../../components/CountUpValue";
import { toast } from "../../components/Toast";
import { getPlatformDashboard } from "../../services/adminApi";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getPlatformDashboard()
      .then(({ data }) => setStats(data.data))
      .catch(() => toast.error("Could not load platform dashboard"));
  }, []);

  if (!stats) return <div className="page-loading">Loading…</div>;

  const maxRevenue = Math.max(1, ...stats.order_volume.map((d) => Number(d.revenue)));

  return (
    <div className="dashboard">
      <section className="welcome-card">
        <h1>Platform dashboard</h1>
        <p>Operate, monitor, and moderate Rayalseema</p>
      </section>

      <div className="stat-grid">
        <div className="card stat-card">
          <span className="stat-card-icon">
            <ShoppingBag size={20} />
          </span>
          <div>
            <p className="stat-card-label">Today's orders</p>
            <p className="stat-card-value">
              <CountUpValue value={stats.today.orders} />
            </p>
          </div>
        </div>
        <div className="card stat-card">
          <span className="stat-card-icon">
            <TrendingUp size={20} />
          </span>
          <div>
            <p className="stat-card-label">Today's revenue</p>
            <p className="stat-card-value">
              <CountUpValue value={stats.today.revenue} prefix="₹" />
            </p>
          </div>
        </div>
        <div className="card stat-card">
          <span className="stat-card-icon">
            <Users size={20} />
          </span>
          <div>
            <p className="stat-card-label">Active customers</p>
            <p className="stat-card-value">
              <CountUpValue value={stats.active_customers} />
            </p>
          </div>
        </div>
        <div className="card stat-card">
          <span className="stat-card-icon">
            <UtensilsCrossed size={20} />
          </span>
          <div>
            <p className="stat-card-label">Active restaurants</p>
            <p className="stat-card-value">
              <CountUpValue value={stats.active_restaurants} />
            </p>
            {stats.pending_restaurant_approvals > 0 && (
              <p className="hint">{stats.pending_restaurant_approvals} pending approval</p>
            )}
          </div>
        </div>
        <div className="card stat-card">
          <span className="stat-card-icon">
            <Bike size={20} />
          </span>
          <div>
            <p className="stat-card-label">Active delivery partners</p>
            <p className="stat-card-value">
              <CountUpValue value={stats.active_delivery_partners} />
            </p>
            {stats.pending_delivery_approvals > 0 && (
              <p className="hint">{stats.pending_delivery_approvals} pending approval</p>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">This week</h2>
        <div className="summary-row">
          <span>Orders</span>
          <span>{stats.this_week.orders}</span>
        </div>
        <div className="summary-row">
          <span>Revenue</span>
          <span>₹{Number(stats.this_week.revenue).toFixed(0)}</span>
        </div>
        <h2 className="section-title">This month</h2>
        <div className="summary-row">
          <span>Orders</span>
          <span>{stats.this_month.orders}</span>
        </div>
        <div className="summary-row total">
          <span>Revenue</span>
          <span>₹{Number(stats.this_month.revenue).toFixed(0)}</span>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Order volume (last 14 days)</h2>
        {stats.order_volume.length === 0 ? (
          <p className="empty-state">No orders yet.</p>
        ) : (
          <div className="volume-chart">
            {stats.order_volume.map((d, i) => (
              <div key={d.date} className="volume-chart-bar-col" title={`${d.date}: ₹${Number(d.revenue).toFixed(0)} · ${d.order_count} orders`}>
                <div
                  className="volume-chart-bar"
                  style={{
                    height: `${Math.max(4, (Number(d.revenue) / maxRevenue) * 100)}%`,
                    animationDelay: `${Math.min(i * 0.03, 0.4)}s`,
                  }}
                />
                <span className="volume-chart-label">{d.date.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
