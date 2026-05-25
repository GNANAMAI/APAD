import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getToken } from "../lib/auth";

interface Props {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly }: Props) {
  const { user, isAdmin } = useAuth();
  const token = getToken();

  if (!token) {
    return <Navigate to={adminOnly ? "/admin/login" : "/login"} replace />;
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  if (!adminOnly && user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}
