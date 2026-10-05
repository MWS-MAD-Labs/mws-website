import { Hono } from "hono";
import { PartnersController } from "../../controllers/admin/partners-controller";
import { requireCmsPermission } from "../../middleware/require-cms-permission";
import type { SessionVariables } from "../../types/hono-context";

export const partnersRoute = new Hono<{
  Variables: SessionVariables;
}>();

partnersRoute.use("*", requireCmsPermission("content:manage"));

partnersRoute.get("/", PartnersController.list);

partnersRoute.get("/:id", PartnersController.get);

partnersRoute.post("/", PartnersController.create);

partnersRoute.patch("/:id", PartnersController.update);

partnersRoute.put("/:id", PartnersController.update);

partnersRoute.delete("/:id", PartnersController.delete);
