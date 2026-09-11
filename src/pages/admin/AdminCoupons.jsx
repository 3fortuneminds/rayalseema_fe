import { Fragment, useEffect, useState } from "react";

import Button from "../../components/Button";
import Input from "../../components/Input";
import { toast } from "../../components/Toast";
import {
  createCoupon,
  deleteCoupon,
  getCouponUsage,
  listAdminCoupons,
  updateCoupon,
} from "../../services/adminApi";

const EMPTY_FORM = {
  code: "",
  description: "",
  discount_type: "percentage",
  discount_value: "",
  max_discount_amount: "",
  min_order_amount: "0",
  usage_limit: "",
  per_user_limit: "1",
  valid_from: "",
  valid_until: "",
  is_active: true,
};

function toDatetimeLocal(iso) {
  if (!iso) return "";
  return iso.slice(0, 16);
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [usageFor, setUsageFor] = useState(null);
  const [usageRows, setUsageRows] = useState([]);

  const refresh = () => {
    setLoading(true);
    listAdminCoupons()
      .then(({ data }) => setCoupons(data.data))
      .catch(() => toast.error("Could not load coupons"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        max_discount_amount: form.max_discount_amount || null,
        usage_limit: form.usage_limit || null,
      };
      await createCoupon(payload);
      toast.success("Coupon created");
      setShowForm(false);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.errors?.code?.[0] ?? "Could not create coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      const { data } = await updateCoupon(coupon.id, { is_active: !coupon.is_active });
      setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? data.data : c)));
      toast.success(coupon.is_active ? "Coupon deactivated" : "Coupon activated");
    } catch {
      toast.error("Could not update coupon");
    }
  };

  const handleDelete = async (coupon) => {
    try {
      await deleteCoupon(coupon.id);
      setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
      toast.success("Coupon deleted");
    } catch {
      toast.error("Could not delete coupon");
    }
  };

  const handleViewUsage = async (coupon) => {
    if (usageFor === coupon.id) {
      setUsageFor(null);
      return;
    }
    try {
      const { data } = await getCouponUsage(coupon.id);
      setUsageRows(data.data);
      setUsageFor(coupon.id);
    } catch {
      toast.error("Could not load usage");
    }
  };

  return (
    <div className="admin-list-page">
      <div className="page-header">
        <div>
          <h1>Coupons</h1>
          <p>Create, edit, and deactivate promotional coupons</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
          New coupon
        </button>
      </div>

      {showForm && (
        <div className="card">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <Input
                name="code"
                label="Code"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />
              <div className="input-group">
                <label htmlFor="discount_type">Discount type</label>
                <select
                  id="discount_type"
                  value={form.discount_type}
                  onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                >
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat</option>
                </select>
              </div>
            </div>
            <Input
              name="description"
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="form-row">
              <Input
                name="discount_value"
                label={form.discount_type === "percentage" ? "Discount %" : "Discount ₹"}
                type="number"
                value={form.discount_value}
                onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
              />
              <Input
                name="max_discount_amount"
                label="Max discount ₹ (optional)"
                type="number"
                value={form.max_discount_amount}
                onChange={(e) => setForm({ ...form, max_discount_amount: e.target.value })}
              />
            </div>
            <div className="form-row">
              <Input
                name="min_order_amount"
                label="Min order ₹"
                type="number"
                value={form.min_order_amount}
                onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
              />
              <Input
                name="usage_limit"
                label="Total usage limit (optional)"
                type="number"
                value={form.usage_limit}
                onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
              />
              <Input
                name="per_user_limit"
                label="Per-user limit"
                type="number"
                value={form.per_user_limit}
                onChange={(e) => setForm({ ...form, per_user_limit: e.target.value })}
              />
            </div>
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="valid_from">Valid from</label>
                <input
                  id="valid_from"
                  type="datetime-local"
                  value={toDatetimeLocal(form.valid_from)}
                  onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label htmlFor="valid_until">Valid until</label>
                <input
                  id="valid_until"
                  type="datetime-local"
                  value={toDatetimeLocal(form.valid_until)}
                  onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                />
              </div>
            </div>
            <div className="admin-table-actions">
              <Button type="submit" disabled={saving}>
                {saving ? "Creating…" : "Create coupon"}
              </Button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="page-loading">Loading…</div>
      ) : (
        <div className="card" style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Valid until</th>
                <th>Usage</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <Fragment key={c.id}>
                  <tr>
                    <td>
                      <strong>{c.code}</strong>
                      <p className="hint">{c.description}</p>
                    </td>
                    <td>
                      {c.discount_type === "percentage" ? `${c.discount_value}%` : `₹${c.discount_value}`}
                      {c.max_discount_amount && ` (max ₹${c.max_discount_amount})`}
                    </td>
                    <td>{new Date(c.valid_until).toLocaleDateString()}</td>
                    <td>
                      <button type="button" className="link-inline" onClick={() => handleViewUsage(c)}>
                        {c.usage_count} use{c.usage_count === 1 ? "" : "s"}
                      </button>
                    </td>
                    <td>
                      <span className={`badge status-${c.is_active ? "delivered" : "cancelled"}`}>
                        {c.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleToggleActive(c)}>
                          {c.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(c)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {usageFor === c.id && (
                    <tr>
                      <td colSpan={6}>
                        {usageRows.length === 0 ? (
                          <p className="empty-state">No usage yet.</p>
                        ) : (
                          <ul className="top-items-list">
                            {usageRows.map((u) => (
                              <li key={u.id}>
                                <span>
                                  {u.user_email} · Order #{u.order_id?.slice(0, 8) ?? "—"}
                                </span>
                                <span>{new Date(u.used_at).toLocaleDateString()}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No coupons yet.
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
