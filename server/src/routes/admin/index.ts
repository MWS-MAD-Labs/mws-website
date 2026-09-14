import { Hono } from "hono";
import { AdminContactPageController } from "../../controllers/admin/ContactPage";
import { AdminCrudController } from "../../controllers/admin/Crud";
import { CmsUsersController } from "../../controllers/admin/CmsUsers";
import { DashboardController } from "../../controllers/admin/Dashboard";
import { adminAuthMiddleware } from "../../middleware/admin-auth-middleware";
import {
  requireCmsPermission,
  requireCmsRole,
} from "../../middleware/require-cms-permission";
import { sessionAuthMiddleware } from "../../middleware/session-auth-middleware";
import { adminCrudResourceNames } from "../../models/admin-crud-model";
import type { SessionVariables } from "../../types/hono-context";
import { createAdminCrudRoute } from "./crud-route";

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

adminRoute.get(
  "/crud-resources",
  requireCmsPermission("content:manage"),
  AdminCrudController.resources,
);

for (const resource of adminCrudResourceNames) {
  adminRoute.route(`/${resource}`, createAdminCrudRoute(resource));
}
