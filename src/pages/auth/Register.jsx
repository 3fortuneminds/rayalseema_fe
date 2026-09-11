import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../../components/Button";
import Input from "../../components/Input";
import { toast } from "../../components/Toast";
import AuthLayout from "../../layouts/AuthLayout";
import { register } from "../../services/authApi";

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "", full_name: "", phone_number: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success("Check your email for a verification code");
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      const message = err.response?.data?.errors?.email?.[0] || "Registration failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Join Rayalseema to start ordering">
      <form onSubmit={handleSubmit} className="auth-form">
        <Input name="full_name" label="Full name" value={form.full_name} onChange={update("full_name")} />
        <Input name="email" label="Email" type="email" value={form.email} onChange={update("email")} />
        <Input
          name="phone_number"
          label="Phone number (optional)"
          value={form.phone_number}
          onChange={update("phone_number")}
        />
        <Input
          name="password"
          label="Password"
          type="password"
          value={form.password}
          onChange={update("password")}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Creating account…" : "Register"}
        </Button>
      </form>
      <p className="auth-footer">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
