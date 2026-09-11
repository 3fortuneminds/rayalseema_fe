import { Package, ShoppingBag, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

import CountUpValue from "../../components/CountUpValue";
import { toast } from "../../components/Toast";
import { useMyRestaurant } from "../../context/RestaurantContext";
import { getDashboardStats } from "../../services/analyticsApi";

export default function RestaurantDashboard() {
  const { restaurant } = useMyRestaurant();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getDashboardStats()
      .then(({ data }) => setStats(data.data))
      .catch(() => toast.error("Could not load dashboard"));
  }, []);

  return (
    <div className="dashboard">
      <section className="welcome-card">
        <h1>{restaurant ? restaurant.name : "Dashboard"}</h1>
        <p>Here's how your restaurant is doing today</p>
      </section>

      {stats && (
        <>
          <div className="stat-grid">
            <div className="card stat-card">
              <span className="stat-card-icon">
                <ShoppingBag size={20} />
              </span>
              <div>
                <p className="stat-card-label">Today's orders</p>
                <p className="stat-card-value">
                  <CountUpValue value={stats.today_orders} />
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
                  <CountUpValue value={stats.today_revenue} prefix="₹" />
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="section-title">
              <Package size={18} /> Top selling items (last 30 days)
            </h2>
            {stats.top_items.length === 0 ? (
              <p className="empty-state">No sales yet.</p>
            ) : (
              <ul className="top-items-list">
                {stats.top_items.map((item) => (
                  <li key={item.food_name}>
                    <span>{item.food_name}</span>
                    <span className="badge">{item.total_quantity} sold</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
