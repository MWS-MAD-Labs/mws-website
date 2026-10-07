import type { Context } from "hono";
import { ResponseError } from "../../error/response-error";
import { ContactPageService } from "../../services/contact-page-service";
import type { SessionVariables } from "../../types/hono-context";

async function readJson(c: Context) {
  try {
    return await c.req.json();
  } catch {
    throw new ResponseError(400, "Invalid JSON body.");
  }
}

export class AdminContactPageController {
  static async get(c: Context) {
    const page = await ContactPageService.getAdmin();

    return c.json({ data: page });
  }

  static async update(c: Context<{ Variables: SessionVariables }>) {
    const payload = await readJson(c);
    const page = await ContactPageService.update(payload, c.var.user?.id ?? null);

    return c.json({ data: page });
  }

  static async delete(c: Context) {
    await ContactPageService.delete();

    return c.body(null, 204);
  }
}
