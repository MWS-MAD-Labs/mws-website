import { Hono } from "hono";
import { ContactInquiryController } from "../../controllers/api/ContactInquiries";

export const publicContactInquiryRoute = new Hono();

publicContactInquiryRoute.post("/inquiries", ContactInquiryController.submit);
