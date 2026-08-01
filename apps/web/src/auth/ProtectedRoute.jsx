import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import LoadingScreen from "../components/LoadingScreen";

// Guards a route subtree: redirects to /login while unauthenticated
// (preserving the intended destination), shows a loading screen while the
// silent-refresh check on first load is still in flight, and optionally
// gates by role (adminOnly).
export default function ProtectedRoute({ adminOnly = false }) {
  const { status, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (status === "checking") {
    return <LoadingScreen label="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
