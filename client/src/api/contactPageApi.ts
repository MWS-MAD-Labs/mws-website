import { apiRequest } from "@/lib/api";
import type { ContactPage, ContactPageContent } from "@/features/contact/contactPageData";

export type ContactInquiryPayload = {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  source?: string;
};

export const contactPageApi = {
  async publicContactPage(): Promise<ContactPage> {
    const response = await apiRequest<{ data: ContactPage }>("/api/pages/contact");
    return response!.data;
  },

  async submitInquiry(payload: ContactInquiryPayload): Promise<void> {
    await apiRequest("/api/contact/inquiries", {
      method: "POST",
      body: payload,
    });
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
