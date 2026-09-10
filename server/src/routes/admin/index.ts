import { Hono } from "hono";
import { AdminContactPageController } from "../../controllers/admin/ContactPage";
import { CmsUsersController } from "../../controllers/admin/CmsUsers";
import { DashboardController } from "../../controllers/admin/Dashboard";
import { adminAuthMiddleware } from "../../middleware/admin-auth-middleware";
import {
  requireCmsPermission,
  requireCmsRole,
} from "../../middleware/require-cms-permission";
import { sessionAuthMiddleware } from "../../middleware/session-auth-middleware";
import type { SessionVariables } from "../../types/hono-context";

export const adminRoute = new Hono<{ Variables: SessionVariables }>();

adminRoute.use("*", sessionAuthMiddleware, adminAuthMiddleware);
adminRoute.get(
  "/",
  requireCmsPermission("dashboard:read"),
  DashboardController.dashboard,
);
adminRoute.get(
  "/dashboard-data",
  requireCmsPermission("dashboard:read"),
  DashboardController.dashboard,
);
adminRoute.get("/users", requireCmsRole("SUPER_ADMIN"), CmsUsersController.listUsers);
adminRoute.patch(
  "/users/:id/role",
  requireCmsRole("SUPER_ADMIN"),
  CmsUsersController.updateUserRole,
);
adminRoute.get(
  "/contact-page",
  requireCmsPermission("content:manage"),
  AdminContactPageController.get,
);
adminRoute.put(
  "/contact-page",
  requireCmsPermission("content:manage"),
  AdminContactPageController.update,
);
adminRoute.delete(
  "/contact-page",
  requireCmsPermission("content:manage"),
  AdminContactPageController.delete,
);
