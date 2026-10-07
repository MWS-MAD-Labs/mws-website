import type { Context } from "hono";
import { ResponseError } from "../../error/response-error";
import { ContactInquiryService } from "../../services/contact-inquiry-service";

async function readJson(c: Context) {
  try {
    return await c.req.json();
  } catch {
    throw new ResponseError(400, "Invalid JSON body.");
  }
}

export class ContactInquiryController {
  static async submit(c: Context) {
    const body = await readJson(c);
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
