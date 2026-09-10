import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/admin/auth/AuthProvider";
import { RequireAuth } from "@/admin/auth/RequireAuth";
import { useAuth } from "@/admin/auth/useAuth";
import { hasCmsPermission } from "@/admin/types/auth";
import ContactPageEditor from "@/admin/features/contact/ContactPageEditor";
import PageEditorPage from "@/admin/features/page/PageEditorPage";
import PagesManagementPage from "@/admin/features/page/PagesManagementPage";
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

function RequireContentPermission({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!hasCmsPermission(user, "content:manage")) {
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
          path="pages"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <PagesManagementPage />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="pages/:pageId/edit"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <PageEditorPage />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route path="hero" element={<Navigate to="/admin/pages" replace />} />
        <Route
          path="contact"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <ContactPageEditor />
              </RequireContentPermission>
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
