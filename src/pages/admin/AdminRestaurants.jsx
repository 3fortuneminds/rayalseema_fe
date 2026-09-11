import { useEffect, useState } from "react";

import { toast } from "../../components/Toast";
import {
  approveRestaurant,
  listAdminRestaurants,
  reactivateRestaurant,
  suspendRestaurant,
} from "../../services/adminApi";

const FILTERS = [
  { value: "", label: "All" },
  { value: "true", label: "Approved" },
  { value: "false", label: "Pending approval" },
];

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const refresh = () => {
    setLoading(true);
    listAdminRestaurants(filter ? { is_approved: filter } : undefined)
      .then(({ data }) => setRestaurants(data.data))
      .catch(() => toast.error("Could not load restaurants"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleApprove = async (r) => {
    setBusyId(r.id);
    try {
      const { data } = await approveRestaurant(r.id);
      setRestaurants((prev) => prev.map((x) => (x.id === r.id ? data.data : x)));
      toast.success("Restaurant approved");
    } catch {
      toast.error("Could not approve restaurant");
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleActive = async (r) => {
    setBusyId(r.id);
    try {
      const { data } = r.is_active ? await suspendRestaurant(r.id) : await reactivateRestaurant(r.id);
      setRestaurants((prev) => prev.map((x) => (x.id === r.id ? data.data : x)));
      toast.success(r.is_active ? "Restaurant suspended" : "Restaurant reactivated");
    } catch {
      toast.error("Could not update restaurant");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="admin-list-page">
      <div className="page-header">
        <div>
          <h1>Restaurants</h1>
          <p>Approve new partners and manage restaurant status</p>
        </div>
      </div>

      <div className="admin-filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`chip${filter === f.value ? " active" : ""}`}
            onClick={() => setFilter(f.value)}
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
                <th>Name</th>
                <th>City</th>
                <th>Owner</th>
                <th>Rating</th>
                <th>Approval</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.city || "—"}</td>
                  <td>{r.owner_email || "—"}</td>
                  <td>
                    {Number(r.avg_rating).toFixed(1)} ({r.rating_count})
                  </td>
                  <td>
                    <span className={`badge status-${r.is_approved ? "delivered" : "placed"}`}>
                      {r.is_approved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge status-${r.is_active ? "delivered" : "cancelled"}`}>
                      {r.is_active ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      {!r.is_approved && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={busyId === r.id}
                          onClick={() => handleApprove(r)}
                        >
                          Approve
                        </button>
                      )}
                      <button
                        type="button"
                        className={`btn btn-sm ${r.is_active ? "btn-danger" : "btn-secondary"}`}
                        disabled={busyId === r.id}
                        onClick={() => handleToggleActive(r)}
                      >
                        {r.is_active ? "Suspend" : "Reactivate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {restaurants.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-state">
                    No restaurants found.
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
