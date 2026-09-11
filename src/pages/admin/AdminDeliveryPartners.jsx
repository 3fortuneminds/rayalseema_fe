import { useEffect, useState } from "react";

import { toast } from "../../components/Toast";
import {
  approveDeliveryPartner,
  listAdminDeliveryPartners,
  reactivateDeliveryPartner,
  suspendDeliveryPartner,
} from "../../services/adminApi";

const FILTERS = [
  { value: "", label: "All" },
  { value: "true", label: "Approved" },
  { value: "false", label: "Pending approval" },
];

export default function AdminDeliveryPartners() {
  const [partners, setPartners] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const refresh = () => {
    setLoading(true);
    listAdminDeliveryPartners(filter ? { is_approved: filter } : undefined)
      .then(({ data }) => setPartners(data.data))
      .catch(() => toast.error("Could not load delivery partners"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleApprove = async (p) => {
    setBusyId(p.id);
    try {
      const { data } = await approveDeliveryPartner(p.id);
      setPartners((prev) => prev.map((x) => (x.id === p.id ? data.data : x)));
      toast.success("Delivery partner approved");
    } catch {
      toast.error("Could not approve delivery partner");
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleActive = async (p) => {
    setBusyId(p.id);
    try {
      const { data } = p.is_active ? await suspendDeliveryPartner(p.id) : await reactivateDeliveryPartner(p.id);
      setPartners((prev) => prev.map((x) => (x.id === p.id ? data.data : x)));
      toast.success(p.is_active ? "Delivery partner suspended" : "Delivery partner reactivated");
    } catch {
      toast.error("Could not update delivery partner");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="admin-list-page">
      <div className="page-header">
        <div>
          <h1>Delivery partners</h1>
          <p>Approve new partners and manage their status</p>
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
                <th>Email</th>
                <th>Vehicle</th>
                <th>Online</th>
                <th>Approval</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id}>
                  <td>{p.user_full_name || "—"}</td>
                  <td>{p.user_email}</td>
                  <td>
                    {p.vehicle_type} {p.vehicle_number && `· ${p.vehicle_number}`}
                  </td>
                  <td>{p.is_online ? "Online" : "Offline"}</td>
                  <td>
                    <span className={`badge status-${p.is_approved ? "delivered" : "placed"}`}>
                      {p.is_approved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge status-${p.is_active ? "delivered" : "cancelled"}`}>
                      {p.is_active ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      {!p.is_approved && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={busyId === p.id}
                          onClick={() => handleApprove(p)}
                        >
                          Approve
                        </button>
                      )}
                      <button
                        type="button"
                        className={`btn btn-sm ${p.is_active ? "btn-danger" : "btn-secondary"}`}
                        disabled={busyId === p.id}
                        onClick={() => handleToggleActive(p)}
                      >
                        {p.is_active ? "Suspend" : "Reactivate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {partners.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-state">
                    No delivery partners found.
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
