import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../../components/Button";
import Input from "../../components/Input";
import { toast } from "../../components/Toast";
import AuthLayout from "../../layouts/AuthLayout";
import { registerDeliveryPartner } from "../../services/deliveryApi";

const VEHICLE_TYPES = [
  { value: "bike", label: "Bike" },
  { value: "scooter", label: "Scooter" },
  { value: "bicycle", label: "Bicycle" },
  { value: "car", label: "Car" },
];

export default function DeliveryRegister() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    vehicle_type: "bike",
    vehicle_number: "",
    license_number: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerDeliveryPartner(form);
      toast.success("Check your email for a verification code");
      navigate("/delivery/verify-otp", { state: { email: form.email } });
    } catch (err) {
      const message = err.response?.data?.errors?.email?.[0] ?? "Registration failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Deliver with Rayalseema" subtitle="Register as a delivery partner to start earning">
      <form onSubmit={handleSubmit} className="auth-form">
        <Input name="full_name" label="Your name" value={form.full_name} onChange={update("full_name")} />
        <Input name="email" label="Email" type="email" value={form.email} onChange={update("email")} />
        <Input name="password" label="Password" type="password" value={form.password} onChange={update("password")} />

        <h3 className="auth-section-heading">Vehicle details</h3>
        <div className="input-group">
          <label htmlFor="vehicle_type">Vehicle type</label>
          <select id="vehicle_type" value={form.vehicle_type} onChange={update("vehicle_type")}>
            {VEHICLE_TYPES.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <Input name="vehicle_number" label="Vehicle number" value={form.vehicle_number} onChange={update("vehicle_number")} />
          <Input name="license_number" label="License number" value={form.license_number} onChange={update("license_number")} />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Registering…" : "Register as delivery partner"}
        </Button>
      </form>
      <p className="auth-footer">
        Already registered? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
