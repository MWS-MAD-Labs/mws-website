import type { Context } from "hono";
import { SiteSettingsService } from "../../services/site-settings-service";

export class PublicSiteSettingsController {
  static async get(c: Context) {
    const settings = await SiteSettingsService.getSettings();
    return c.json({ data: settings });
  }
}
