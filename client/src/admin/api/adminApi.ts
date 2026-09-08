import { apiRequest } from "@/lib/api";
import type { AuthUser } from "@/admin/types/auth";

export type AdminDashboardData = {
  message: string;
  user: AuthUser;
};

export const adminApi = {
  async dashboard(): Promise<AdminDashboardData> {
    const response = await apiRequest<{ data: AdminDashboardData }>(
      "/admin/dashboard-data",
    );
    return response!.data;
  },
};
