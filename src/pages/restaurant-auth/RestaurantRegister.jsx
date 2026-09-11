import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../../components/Button";
import Input from "../../components/Input";
import { toast } from "../../components/Toast";
import AuthLayout from "../../layouts/AuthLayout";
import { registerRestaurant } from "../../services/restaurantOwnerApi";

export default function RestaurantRegister() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone_number: "",
    restaurant_name: "",
    city: "",
    address_line: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerRestaurant(form);
      toast.success("Check your email for a verification code");
      navigate("/restaurant/verify-otp", { state: { email: form.email } });
    } catch (err) {
      const message = err.response?.data?.errors?.email?.[0] ?? "Registration failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Partner with Rayalseema" subtitle="Register your restaurant to start receiving orders">
      <form onSubmit={handleSubmit} className="auth-form">
        <Input name="restaurant_name" label="Restaurant name" value={form.restaurant_name} onChange={update("restaurant_name")} />
        <div className="form-row">
          <Input name="city" label="City" value={form.city} onChange={update("city")} />
          <Input name="address_line" label="Address" value={form.address_line} onChange={update("address_line")} />
        </div>
        <Input name="description" label="Description (optional)" value={form.description} onChange={update("description")} />

        <h3 className="auth-section-heading">Owner account</h3>
        <Input name="full_name" label="Your name" value={form.full_name} onChange={update("full_name")} />
        <Input name="email" label="Email" type="email" value={form.email} onChange={update("email")} />
        <Input name="phone_number" label="Phone number (optional)" value={form.phone_number} onChange={update("phone_number")} />
        <Input name="password" label="Password" type="password" value={form.password} onChange={update("password")} />

        <Button type="submit" disabled={loading}>
          {loading ? "Registering…" : "Register restaurant"}
        </Button>
      </form>
      <p className="auth-footer">
        Already partnered? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
