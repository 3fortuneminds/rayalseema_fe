import { Bike, Lock, Mail, Store, UserPlus } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import Button from "../../components/Button";
import Input from "../../components/Input";
import SocialAuthRow from "../../components/SocialAuthRow";
import { toast } from "../../components/Toast";
import AuthLayout from "../../layouts/AuthLayout";
import { homeForRole } from "../../routes/ProtectedRoute";
import { googleLogin } from "../../services/authApi";
import { promptGoogleSignIn } from "../../services/googleAuth";
import api from "../../services/api";
import { setCredentials } from "../../store/authSlice";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const applySession = (payload) => {
    dispatch(setCredentials({ access: payload.access, refresh: payload.refresh, user: payload.user }));
    toast.success("Logged in");
    navigate(homeForRole(payload.user.role));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/accounts/token/", { email, password });
      applySession(data.data);
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const idToken = await promptGoogleSignIn();
      const { data } = await googleLogin({ id_token: idToken });
      applySession(data.data);
    } catch (err) {
      if (err.unconfigured) toast("Google sign-in isn't set up yet");
      else if (err.message !== "Google sign-in was cancelled") toast.error("Google sign-in failed");
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue to Rayalseema">
      <form onSubmit={handleSubmit} className="auth-form">
        <Input
          name="email"
          label="Email"
          type="email"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          name="password"
          label="Password"
          type="password"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="auth-link-row">
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
        <Button type="submit" disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <SocialAuthRow onGoogle={handleGoogleLogin} />

      <ul className="auth-footer-links">
        <li>
          <span className="auth-footer-icon">
            <UserPlus size={13} />
          </span>
          No account? <Link to="/register">Register</Link>
        </li>
        <li>
          <span className="auth-footer-icon">
            <Store size={13} />
          </span>
          Own a restaurant? <Link to="/restaurant/register">Partner with us</Link>
        </li>
        <li>
          <span className="auth-footer-icon">
            <Bike size={13} />
          </span>
          Want to deliver? <Link to="/delivery/register">Become a delivery partner</Link>
        </li>
      </ul>
    </AuthLayout>
  );
}
