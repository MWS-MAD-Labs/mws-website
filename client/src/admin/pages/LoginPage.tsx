import { Navigate, useSearchParams } from "react-router-dom";
import { AuthScreen } from "@/admin/components/AuthScreen";
import { GoogleLoginButton } from "@/admin/components/GoogleLoginButton";
import { useAuth } from "@/admin/auth/useAuth";
export default function LoginPage() {
  const { isAuthenticated, isSessionLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const loginError = readableLoginError(searchParams.get("error"));
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  return (
    <AuthScreen>
      <section className="w-full max-w-sm">
        <div className="rounded-lg border border-[rgba(36,23,24,0.14)] bg-white px-6 py-8 shadow-sm sm:px-8">
          <div className="mb-8 text-center">
            <img
              src="https://app.mws.web.id/assets/logo-nPmE2HJi.webp"
              alt="Millennia World School"
              className="mx-auto h-16 w-16 object-contain"
            />
            <p className="mt-3 text-sm font-semibold tracking-normal text-[#241718]">
              MWS CMS
            </p>
          </div>
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-normal text-[#241718]">
              Sign in to Dashboard
            </h1>
            <p className="mt-2 text-sm text-[#625759]">
              Use your MWS Google account to continue.
            </p>
          </div>
          <div className="space-y-4">
            <GoogleLoginButton />
            {loginError && (
              <div
                role="alert"
                className="rounded-md bg-[#7e1518]/10 px-3 py-2.5 text-center text-sm text-[#7e1518]"
              >
                {loginError}
              </div>
            )}
            {isSessionLoading && (
              <div className="flex items-center justify-center gap-2 text-xs text-[#625759]">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#625759]/25 border-t-[#625759]" />
                <span>Checking session...</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </AuthScreen>
  );
}
function readableLoginError(errorCode: string | null): string | null {
  switch (errorCode) {
    case "google_state":
      return "Google sign-in state is invalid. Please try again.";
    case "google_auth_failed":
      return "Google sign-in failed. Please try again.";
    case "not_registered":
      return "This account is not registered in Central yet.";
    case "unauthorized":
      return "You are not authorized to access this dashboard.";
    case "login_failed":
      return "Sign-in could not be completed. Please try again.";
    default:
      return null;
  }
}
