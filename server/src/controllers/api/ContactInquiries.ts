import type { Context } from "hono";
import { ContactInquiryService } from "../../services/contact-inquiry-service";

export class ContactInquiryController {
  static async submit(c: Context) {
    const body = await c.req.json();
    const ipAddress =
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
      c.req.header("x-real-ip") ||
      null;
    const userAgent = c.req.header("user-agent") || null;

    const inquiry = await ContactInquiryService.submit(body, {
      ipAddress,
      userAgent,
    });

    return c.json({ data: inquiry }, 201);
  }
}
