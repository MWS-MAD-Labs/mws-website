import { useCallback, useEffect, useMemo, useState } from "react";
import { authApi } from "@/admin/api/authApi";
import { AuthContext } from "@/admin/auth/authContext";
import type { AuthUser } from "@/admin/types/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    let cancelled = false;

    authApi
      .currentUser()
      .then((currentUser) => {
        if (!cancelled) setUser(currentUser);
      })
      .finally(() => {
        if (!cancelled) setIsSessionLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const loginWithGoogle = useCallback(async (code: string) => {
    setIsLoggingIn(true);
    try {
      const loggedInUser = await authApi.loginWithGoogle(code);
      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = await authApi.currentUser();
    setUser(currentUser);
    return currentUser;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isSessionLoading,
      isLoggingIn,
      loginWithGoogle,
      logout,
      refreshUser,
    }),
    [user, isSessionLoading, isLoggingIn, loginWithGoogle, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
