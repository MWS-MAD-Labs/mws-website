import { Hono } from "hono";
import { AdminSiteSettingsController } from "../../controllers/admin/SiteSettings";
import { requireCmsPermission } from "../../middleware/require-cms-permission";
import type { SessionVariables } from "../../types/hono-context";

export const adminSiteSettingsRoute = new Hono<{ Variables: SessionVariables }>();

adminSiteSettingsRoute.use("*", requireCmsPermission("content:manage"));
adminSiteSettingsRoute.get("/", AdminSiteSettingsController.get);
adminSiteSettingsRoute.put("/:group", AdminSiteSettingsController.updateGroup);
