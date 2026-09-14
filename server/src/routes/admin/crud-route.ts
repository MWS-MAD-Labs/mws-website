import { Hono } from "hono";
import { AdminCrudController } from "../../controllers/admin/Crud";
import { requireCmsPermission } from "../../middleware/require-cms-permission";
import { type AdminCrudResource } from "../../models/admin-crud-model";
import type { SessionVariables } from "../../types/hono-context";

export function createAdminCrudRoute(resource: AdminCrudResource) {
  const route = new Hono<{ Variables: SessionVariables }>();

  route.use("*", requireCmsPermission("content:manage"));
  route.get("/", AdminCrudController.list(resource));
  route.post("/", AdminCrudController.create(resource));
  route.get("/:id", AdminCrudController.detail(resource));
  route.patch("/:id", AdminCrudController.update(resource));
  route.put("/:id", AdminCrudController.update(resource));
  route.delete("/:id", AdminCrudController.delete(resource));

  return route;
}
