import { apiRequest } from "@/lib/api";
import type {
  ContactPage,
  ContactPageContent,
} from "@/features/contact/contactPageData";
import type { AuthUser, CmsRoleName } from "@/admin/types/auth";

export type AdminDashboardData = {
  message: string;
  user: AuthUser;
};

export type CmsUserListItem = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  isActive: boolean;
  role: {
    name: CmsRoleName;
    label: string | null;
  } | null;
};

export type CmsRoleListItem = {
  name: CmsRoleName;
  label: string | null;
};

export type CmsUsersData = {
  users: CmsUserListItem[];
  roles: CmsRoleListItem[];
};

export const adminApi = {
  async dashboard(): Promise<AdminDashboardData> {
    const response = await apiRequest<{ data: AdminDashboardData }>(
      "/admin/dashboard-data",
    );
    return response!.data;
  },

  async users(): Promise<CmsUsersData> {
    const response = await apiRequest<{ data: CmsUsersData }>("/admin/users");
    return response!.data;
  },

  async updateUserRole(
    userId: string,
    roleName: CmsRoleName | null,
  ): Promise<CmsUserListItem> {
    const response = await apiRequest<{ data: CmsUserListItem }>(
      `/admin/users/${userId}/role`,
      {
        method: "PATCH",
        body: { roleName },
      },
    );
    return response!.data;
  },

  async contactPage(): Promise<ContactPage> {
    const response = await apiRequest<{ data: ContactPage }>("/admin/contact-page");
    return response!.data;
  },

  async updateContactPage(content: ContactPageContent): Promise<ContactPage> {
    const response = await apiRequest<{ data: ContactPage }>("/admin/contact-page", {
      method: "PUT",
      body: content,
    });
    return response!.data;
  },

  async resetContactPage(): Promise<void> {
    await apiRequest("/admin/contact-page", { method: "DELETE" });
  },

};
