import { apiRequest } from "@/lib/api";
import type { ContactPage } from "@/features/contact/contactPageData";

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
};
