import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../../components/Button";
import Input from "../../components/Input";
import { toast } from "../../components/Toast";
import AuthLayout from "../../layouts/AuthLayout";
import { forgotPassword } from "../../services/authApi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword({ email });
      toast.success("If that account exists, a reset code has been sent");
      navigate("/reset-password", { state: { email } });
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot password" subtitle="We'll email you a code to reset it">
      <form onSubmit={handleSubmit} className="auth-form">
        <Input name="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit" disabled={loading}>
          {loading ? "Sending…" : "Send reset code"}
        </Button>
      </form>
      <p className="auth-footer">
        <Link to="/login">Back to login</Link>
      </p>
    </AuthLayout>
  );
}
