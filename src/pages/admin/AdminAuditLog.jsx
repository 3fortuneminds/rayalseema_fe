import { useEffect, useState } from "react";

import { toast } from "../../components/Toast";
import { listAuditLog } from "../../services/adminApi";

export default function AdminAuditLog() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAuditLog()
      .then(({ data }) => setRows(data.data))
      .catch(() => toast.error("Could not load audit log"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading…</div>;

  return (
    <div className="admin-list-page">
      <div className="page-header">
        <div>
          <h1>Audit log</h1>
          <p>Every admin action taken on the platform</p>
        </div>
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Target</th>
              <th>Admin</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.action.replaceAll("_", " ")}</td>
                <td>
                  {r.target_type && (
                    <span>
                      {r.target_type} · {r.target_id?.slice(0, 8)}
                    </span>
                  )}
                </td>
                <td>{r.actor_email ?? "—"}</td>
                <td>{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="empty-state">
                  No actions recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
