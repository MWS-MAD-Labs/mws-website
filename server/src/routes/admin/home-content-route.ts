import { Hono } from "hono";
import { AdminHomeContentController } from "../../controllers/admin/PageEditors";
import { requireCmsPermission } from "../../middleware/require-cms-permission";
import type { SessionVariables } from "../../types/hono-context";

export const adminHomeContentRoute = new Hono<{ Variables: SessionVariables }>();

adminHomeContentRoute.use("*", requireCmsPermission("content:manage"));
adminHomeContentRoute.get("/", AdminHomeContentController.get);
adminHomeContentRoute.put("/settings", AdminHomeContentController.updateSettings);
adminHomeContentRoute.post("/spotlights", AdminHomeContentController.createSpotlight);
adminHomeContentRoute.patch(
  "/spotlights/:id",
  AdminHomeContentController.updateSpotlight,
);
adminHomeContentRoute.put(
  "/spotlights/:id",
  AdminHomeContentController.updateSpotlight,
);
adminHomeContentRoute.delete(
  "/spotlights/:id",
  AdminHomeContentController.deleteSpotlight,
);
