import { useState } from "react";
import { useDispatch } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import Button from "../../components/Button";
import Input from "../../components/Input";
import { toast } from "../../components/Toast";
import AuthLayout from "../../layouts/AuthLayout";
import { verifyRegistration } from "../../services/authApi";
import { setCredentials } from "../../store/authSlice";

export default function VerifyOtp() {
  const location = useLocation();
  const email = location.state?.email;
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!email) {
    return <Navigate to="/register" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await verifyRegistration({ email, code });
      const payload = data.data;
      dispatch(setCredentials({ access: payload.access, refresh: payload.refresh, user: payload.user }));
      toast.success("Account verified");
      navigate("/");
    } catch {
      toast.error("Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Verify your email" subtitle={`Enter the 6-digit code sent to ${email}`}>
      <form onSubmit={handleSubmit} className="auth-form">
        <Input name="code" label="Verification code" value={code} onChange={(e) => setCode(e.target.value)} />
        <Button type="submit" disabled={loading}>
          {loading ? "Verifying…" : "Verify"}
        </Button>
      </form>
    </AuthLayout>
  );
}
