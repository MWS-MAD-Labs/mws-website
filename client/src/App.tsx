import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from '@/app/App';

// The CMS is only for signed-in staff; keep it out of the public bundle.
const AdminApp = lazy(() => import('@/admin/app/App'));
const GoogleCallbackPage = lazy(() => import('@/admin/pages/GoogleCallbackPage'));

export default function RootApp() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
