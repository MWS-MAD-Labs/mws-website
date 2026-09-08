import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "@/app/App";
import AdminApp from "@/admin/app/App";
import GoogleCallbackPage from "@/admin/pages/GoogleCallbackPage";

export default function RootApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  );
}
