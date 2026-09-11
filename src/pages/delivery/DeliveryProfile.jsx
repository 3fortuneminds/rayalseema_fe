import { useEffect, useState } from "react";

import Button from "../../components/Button";
import Input from "../../components/Input";
import { toast } from "../../components/Toast";
import { useMyDeliveryPartner } from "../../context/DeliveryContext";
import { updateMyDeliveryPartner } from "../../services/deliveryApi";

const VEHICLE_TYPES = [
  { value: "bike", label: "Bike" },
  { value: "scooter", label: "Scooter" },
  { value: "bicycle", label: "Bicycle" },
  { value: "car", label: "Car" },
];

export default function DeliveryProfile() {
  const { partner, refresh, loading } = useMyDeliveryPartner();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!partner) return;
    setForm({
      vehicle_type: partner.vehicle_type,
      vehicle_number: partner.vehicle_number,
      license_number: partner.license_number,
    });
  }, [partner]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateMyDeliveryPartner(form);
      toast.success("Profile updated");
      refresh();
    } catch {
      toast.error("Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <div className="page-loading">Loading…</div>;

  return (
    <div className="restaurant-profile-page">
      <div className="page-header">
        <div>
          <h1>Delivery partner profile</h1>
          <p>Keep your vehicle details up to date</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="vehicle_type">Vehicle type</label>
            <select
              id="vehicle_type"
              value={form.vehicle_type}
              onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
            >
              {VEHICLE_TYPES.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <Input
              name="vehicle_number"
              label="Vehicle number"
              value={form.vehicle_number}
              onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })}
            />
            <Input
              name="license_number"
              label="License number"
              value={form.license_number}
              onChange={(e) => setForm({ ...form, license_number: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}
