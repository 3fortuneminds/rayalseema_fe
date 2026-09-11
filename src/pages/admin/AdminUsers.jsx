import { useEffect, useState } from "react";

import { toast } from "../../components/Toast";
import { listUsers, reactivateUser, suspendUser } from "../../services/adminApi";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const refresh = () => {
    setLoading(true);
    listUsers(search ? { search } : undefined)
      .then(({ data }) => setUsers(data.data))
      .catch(() => toast.error("Could not load users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    refresh();
  };

  const handleToggle = async (user) => {
    setBusyId(user.id);
    try {
      if (user.is_active) {
        const { data } = await suspendUser(user.id);
        setUsers((prev) => prev.map((u) => (u.id === user.id ? data.data : u)));
        toast.success("User suspended");
      } else {
        const { data } = await reactivateUser(user.id);
        setUsers((prev) => prev.map((u) => (u.id === user.id ? data.data : u)));
        toast.success("User reactivated");
      }
    } catch {
      toast.error("Could not update user");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="admin-list-page">
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>View and moderate customer accounts</p>
        </div>
      </div>

      <form className="admin-filter-bar" onSubmit={handleSearchSubmit}>
        <input
          type="search"
          placeholder="Search by email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary btn-sm">
          Search
        </button>
      </form>

      {loading ? (
        <div className="page-loading">Loading…</div>
      ) : (
        <div className="card" style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Verified</th>
                <th>Status</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.full_name || "—"}</td>
                  <td>{u.is_verified ? "Yes" : "No"}</td>
                  <td>
                    <span className={`badge status-${u.is_active ? "delivered" : "cancelled"}`}>
                      {u.is_active ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td>{new Date(u.date_joined).toLocaleDateString()}</td>
                  <td>
                    <button
                      type="button"
                      className={`btn btn-sm ${u.is_active ? "btn-danger" : "btn-secondary"}`}
                      disabled={busyId === u.id}
                      onClick={() => handleToggle(u)}
                    >
                      {u.is_active ? "Suspend" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No customers found.
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
