import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/admin/auth/AuthProvider";
import { RequireAuth } from "@/admin/auth/RequireAuth";
import { useAuth } from "@/admin/auth/useAuth";
import { hasCmsPermission } from "@/admin/types/auth";
import CmsUsersPage from "@/admin/pages/CmsUsersPage";
import Dashboard from "@/admin/pages/Dashboard";
import LoginPage from "@/admin/pages/LoginPage";

function RequireUsersPermission({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!hasCmsPermission(user, "users:manage")) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route
          index
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="users"
          element={
            <RequireAuth>
              <RequireUsersPermission>
                <CmsUsersPage />
              </RequireUsersPermission>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AuthProvider>
  );
}
