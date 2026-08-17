import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { selectIsAuthenticated, selectIsAdmin } from "../features/auth/authSlice";

function useAuthGate() {
  return useSelector((state) => state.auth.isInitializing);
}

export function ProtectedRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitializing = useAuthGate();
  const location = useLocation();

  // Wait for the initial session check to resolve before deciding — otherwise
  // a returning logged-in user flashes to /login before /auth/me responds.
  if (isInitializing) return null;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <Outlet />;
}

export function AdminRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const isInitializing = useAuthGate();
  const location = useLocation();

  if (isInitializing) return null;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
