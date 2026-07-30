import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PublicRoute() {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return <Outlet />;
}
