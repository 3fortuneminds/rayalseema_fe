import { useEffect, useState } from "react";

import Button from "../../components/Button";
import Input from "../../components/Input";
import { toast } from "../../components/Toast";
import { getPlatformSettings, updatePlatformSettings } from "../../services/adminApi";

export default function AdminSettings() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPlatformSettings()
      .then(({ data }) => setForm(data.data))
      .catch(() => toast.error("Could not load settings"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updatePlatformSettings(form);
      setForm(data.data);
      toast.success("Settings updated");
    } catch {
      toast.error("Could not update settings");
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <div className="page-loading">Loading…</div>;

  return (
    <div className="admin-list-page">
      <div className="page-header">
        <div>
          <h1>Platform settings</h1>
          <p>Configure commission, delivery radius, and support contact</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <Input
              name="commission_percent"
              label="Commission %"
              type="number"
              value={form.commission_percent}
              onChange={(e) => setForm({ ...form, commission_percent: e.target.value })}
            />
            <Input
              name="delivery_radius_km"
              label="Delivery radius (km)"
              type="number"
              value={form.delivery_radius_km}
              onChange={(e) => setForm({ ...form, delivery_radius_km: e.target.value })}
            />
          </div>
          <div className="form-row">
            <Input
              name="support_email"
              label="Support email"
              type="email"
              value={form.support_email}
              onChange={(e) => setForm({ ...form, support_email: e.target.value })}
            />
            <Input
              name="support_phone"
              label="Support phone"
              value={form.support_phone}
              onChange={(e) => setForm({ ...form, support_phone: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save settings"}
          </Button>
        </form>
      </div>
    </div>
  );
}
