import type { Context } from "hono";
import { ResponseError } from "../../error/response-error";
import { SiteSettingsService } from "../../services/site-settings-service";
import type { SessionVariables } from "../../types/hono-context";

async function readJson(c: Context) {
  try {
    return await c.req.json();
  } catch {
    throw new ResponseError(400, "Invalid JSON body.");
  }
}

export class AdminSiteSettingsController {
  static async get(c: Context) {
    return c.json({ data: await SiteSettingsService.get() });
  }

  static async updateGroup(c: Context<{ Variables: SessionVariables }>) {
    const payload = await readJson(c);
    const data = await SiteSettingsService.updateGroup(
      c.req.param("group") ?? "",
      payload,
      c.var.user?.id ?? null,
    );

    return c.json({ data });
  }
}
