import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/admin/auth/AuthProvider";
import { RequireAuth } from "@/admin/auth/RequireAuth";
import { useAuth } from "@/admin/auth/useAuth";
import { hasCmsPermission } from "@/admin/types/auth";
import ContactPageEditor from "@/admin/features/contact/ContactPageEditor";
import PageEditorPage from "@/admin/features/page/PageEditorPage";
import PagesManagementPage from "@/admin/features/page/PagesManagementPage";
import AdmissionsPage from "@/admin/features/placeholders/AdmissionsPage";
import AffiliationsPage from "@/admin/features/placeholders/AffiliationsPage";
import AuditLogsPage from "@/admin/features/placeholders/AuditLogsPage";
import CampusTourPage from "@/admin/features/placeholders/CampusTourPage";
import CurriculumPage from "@/admin/features/placeholders/CurriculumPage";
import ElementaryPage from "@/admin/features/placeholders/ElementaryPage";
import GalleryImagesPage from "@/admin/features/placeholders/GalleryImagesPage";
import GalleryVideosPage from "@/admin/features/placeholders/GalleryVideosPage";
import HelpPage from "@/admin/features/placeholders/HelpPage";
import JuniorHighPage from "@/admin/features/placeholders/JuniorHighPage";
import KindergartenPage from "@/admin/features/placeholders/KindergartenPage";
import OurSchoolPage from "@/admin/features/placeholders/OurSchoolPage";
import PermissionsPage from "@/admin/features/placeholders/PermissionsPage";
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
          path="our-school"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <OurSchoolPage />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
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
          path="academic/kindergarten"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <KindergartenPage />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="academic/elementary"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <ElementaryPage />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="academic/junior-high"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <JuniorHighPage />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="programs/admissions"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <AdmissionsPage />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="programs/campus-tour"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <CampusTourPage />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="programs/curriculum"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <CurriculumPage />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="programs/affiliations"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <AffiliationsPage />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="gallery/images"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <GalleryImagesPage />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="gallery/videos"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <GalleryVideosPage />
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
        <Route
          path="permissions"
          element={
            <RequireAuth>
              <RequireUsersPermission>
                <PermissionsPage />
              </RequireUsersPermission>
            </RequireAuth>
          }
        />
        <Route
          path="audit-logs"
          element={
            <RequireAuth>
              <AuditLogsPage />
            </RequireAuth>
          }
        />
        <Route
          path="help"
          element={
            <RequireAuth>
              <HelpPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AuthProvider>
  );
}
