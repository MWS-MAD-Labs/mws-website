import { Hono } from "hono";
import { AdminAcademicLevelsController } from "../../controllers/admin/AcademicLevels";
import { requireCmsPermission } from "../../middleware/require-cms-permission";
import type { SessionVariables } from "../../types/hono-context";

export const adminAcademicLevelRoute = new Hono<{
  Variables: SessionVariables;
}>();

adminAcademicLevelRoute.get(
  "/",
  requireCmsPermission("content:manage"),
  AdminAcademicLevelsController.list,
);
adminAcademicLevelRoute.post(
  "/:levelKey/assets",
  requireCmsPermission("content:manage"),
  AdminAcademicLevelsController.uploadAsset,
);
adminAcademicLevelRoute.get(
  "/:levelKey",
  requireCmsPermission("content:manage"),
  AdminAcademicLevelsController.get,
);
adminAcademicLevelRoute.put(
  "/:levelKey",
  requireCmsPermission("content:manage"),
  AdminAcademicLevelsController.update,
);
