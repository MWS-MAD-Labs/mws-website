import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AuthScreen } from "@/admin/components/AuthScreen";
import { env } from "@/config/env";

export default function GoogleCallbackPage() {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const hasCallbackPayload = params.has("code") && params.has("state");

  useEffect(() => {
    if (!hasCallbackPayload) return;

    const callbackUrl = new URL(
      `${env.apiBaseUrl}/auth/google/callback${search}`,
      window.location.origin,
    );
    window.location.replace(callbackUrl.toString());
  }, [hasCallbackPayload, search]);

  if (!hasCallbackPayload) {
    return <Navigate to="/admin/login?error=google_state" replace />;
  }

  return (
    <AuthScreen>
      <p className="text-sm text-[#625759]">Completing Google sign-in...</p>
    </AuthScreen>
  );
}
