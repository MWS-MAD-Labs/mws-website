import { ApiError, apiRequest } from "@/lib/api";
import type { AuthUser } from "@/admin/types/auth";

export const authApi = {
  async currentUser(): Promise<AuthUser | null> {
    try {
      const response = await apiRequest<{ data: AuthUser }>("/auth/me");
      return response?.data ?? null;
    } catch (error) {
      if (error instanceof ApiError && [401, 403].includes(error.status ?? 0)) {
        return null;
      }
      throw error;
    }
  },

  async loginWithGoogle(code: string): Promise<AuthUser> {
    const response = await apiRequest<{ data: AuthUser }>("/auth/google", {
      method: "POST",
      body: { code },
    });
    return response!.data;
  },

  async logout(): Promise<void> {
    await apiRequest("/auth/logout", { method: "POST" });
  },
};
