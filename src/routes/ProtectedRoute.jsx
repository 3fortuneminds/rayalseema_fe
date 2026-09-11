import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export const ROLE_HOME = {
  customer: "/",
  restaurant: "/restaurant",
  delivery: "/delivery",
  admin: "/admin",
};

export function homeForRole(role) {
  return ROLE_HOME[role] ?? "/login";
}

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={homeForRole(user?.role)} replace />;
  }

  return <Outlet />;
}
