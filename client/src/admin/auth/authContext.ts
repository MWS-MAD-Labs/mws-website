import { createContext } from "react";
import type { AuthUser } from "@/admin/types/auth";

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isSessionLoading: boolean;
  isLoggingIn: boolean;
  loginWithGoogle: (code: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
