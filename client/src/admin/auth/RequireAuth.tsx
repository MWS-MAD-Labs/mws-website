import { Navigate, useLocation } from "react-router-dom";
import { AuthScreen } from "@/admin/components/AuthScreen";
import { useAuth } from "@/admin/auth/useAuth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isSessionLoading } = useAuth();
  const location = useLocation();

  if (isSessionLoading) {
    return (
      <AuthScreen>
        <p className="text-sm text-[#625759]">Checking session...</p>
      </AuthScreen>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
}
