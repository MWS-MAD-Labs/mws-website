import { apiRequest } from "@/lib/api";
import type { ContactPage, ContactPageContent } from "@/features/contact/contactPageData";

export const contactPageApi = {
  async publicContactPage(): Promise<ContactPage> {
    const response = await apiRequest<{ data: ContactPage }>("/api/pages/contact");
    return response!.data;
  },

  async adminContactPage(): Promise<ContactPage> {
    const response = await apiRequest<{ data: ContactPage }>("/admin/contact-page");
    return response!.data;
  },

  async updateAdminContactPage(
    content: ContactPageContent,
  ): Promise<ContactPage> {
    const response = await apiRequest<{ data: ContactPage }>("/admin/contact-page", {
      method: "PUT",
      body: content,
    });
    return response!.data;
  },

  async resetAdminContactPage(): Promise<void> {
    await apiRequest("/admin/contact-page", { method: "DELETE" });
  },
};
