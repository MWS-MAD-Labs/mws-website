import type { Context } from "hono";
import { ResponseError } from "../../error/response-error";
import { toJsonSafe } from "../../lib/json-response";
import { ContactInquiryService } from "../../services/contact-inquiry-service";
import type { SessionVariables } from "../../types/hono-context";

type AdminContext = Context<{
  Variables: SessionVariables;
}>;

async function readJson(c: AdminContext) {
  try {
    return await c.req.json();
  } catch {
    throw new ResponseError(400, "Invalid JSON body.");
  }
}

export class AdminContactInquiriesController {
  static async list(c: AdminContext) {
    return c.json({
      data: toJsonSafe(await ContactInquiryService.list(c.req.query())),
    });
  }

  static async get(c: AdminContext) {
    return c.json({
      data: toJsonSafe(await ContactInquiryService.get(c.req.param("id"))),
    });
  }

  static async updateStatus(c: AdminContext) {
    const body = await readJson(c);

    return c.json({
      data: toJsonSafe(
        await ContactInquiryService.updateStatus(c.req.param("id"), body),
      ),
    });
  }
}
