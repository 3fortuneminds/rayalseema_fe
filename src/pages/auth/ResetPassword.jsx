import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Button from "../../components/Button";
import Input from "../../components/Input";
import { toast } from "../../components/Toast";
import AuthLayout from "../../layouts/AuthLayout";
import { resetPassword } from "../../services/authApi";

export default function ResetPassword() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email ?? "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword({ email, code, new_password: newPassword });
      toast.success("Password reset — please log in");
      navigate("/login");
    } catch {
      toast.error("Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset password" subtitle="Enter the code we emailed you and a new password">
      <form onSubmit={handleSubmit} className="auth-form">
        <Input name="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input name="code" label="Reset code" value={code} onChange={(e) => setCode(e.target.value)} />
        <Input
          name="new_password"
          label="New password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Resetting…" : "Reset password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
