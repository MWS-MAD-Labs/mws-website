import { Hono } from "hono";
import { PopupPromotedController } from "../../controllers/admin/popup-promoted-controller";
import { requireCmsPermission } from "../../middleware/require-cms-permission";
import type { SessionVariables } from "../../types/hono-context";

export const popupPromotedRoute = new Hono<{
  Variables: SessionVariables;
}>();

popupPromotedRoute.use("*", requireCmsPermission("content:manage"));

popupPromotedRoute.get("/", PopupPromotedController.list);

popupPromotedRoute.get("/:id", PopupPromotedController.get);

popupPromotedRoute.post("/", PopupPromotedController.create);

popupPromotedRoute.patch("/:id", PopupPromotedController.update);

popupPromotedRoute.put("/:id", PopupPromotedController.update);

popupPromotedRoute.delete("/:id", PopupPromotedController.delete);
