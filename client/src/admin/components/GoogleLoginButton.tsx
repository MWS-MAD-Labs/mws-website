import { useState } from "react";
import Button from "@/admin/components/ui/Button";
import { env } from "@/config/env";

export function GoogleLoginButton() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  function handleLogin() {
    setIsLoggingIn(true);
    const startUrl = new URL(
      `${env.apiBaseUrl}/auth/google/start`,
      window.location.origin,
    );
    window.location.assign(startUrl.toString());
  }

  return (
    <div className="mt-6 grid gap-2.5">
      <Button fullWidth disabled={isLoggingIn} onClick={handleLogin}>
        {isLoggingIn ? "Signing in..." : "Continue with Google"}
      </Button>
    </div>
  );
}
