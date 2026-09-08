import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/admin/auth/AuthProvider";
import { RequireAuth } from "@/admin/auth/RequireAuth";
import Dashboard from "@/admin/pages/Dashboard";
import LoginPage from "@/admin/pages/LoginPage";

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
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AuthProvider>
  );
}
