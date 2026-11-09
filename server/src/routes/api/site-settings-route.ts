import { Hono } from "hono";
import { PublicSiteSettingsController } from "../../controllers/api/SiteSettings";

export const publicSiteSettingsRoute = new Hono();

publicSiteSettingsRoute.get("/", PublicSiteSettingsController.get);
