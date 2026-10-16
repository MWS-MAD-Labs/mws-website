import { Hono } from "hono";
import {
  VirtualTourController,
  VirtualTourLinkController,
  VirtualTourSceneController,
} from "../../controllers/admin/virtual-tour-controller";
import { requireCmsPermission } from "../../middleware/require-cms-permission";
import type { SessionVariables } from "../../types/hono-context";

export const adminVirtualTourRoute = new Hono<{
  Variables: SessionVariables;
}>();

adminVirtualTourRoute.use("*", requireCmsPermission("content:manage"));

adminVirtualTourRoute.get("/", VirtualTourController.list);
adminVirtualTourRoute.post("/", VirtualTourController.create);

adminVirtualTourRoute.get("/:tourId/scenes", VirtualTourSceneController.list);
adminVirtualTourRoute.post("/:tourId/scenes", VirtualTourSceneController.create);
adminVirtualTourRoute.get(
  "/:tourId/scenes/:sceneId",
  VirtualTourSceneController.get,
);
adminVirtualTourRoute.patch(
  "/:tourId/scenes/:sceneId",
  VirtualTourSceneController.update,
);
adminVirtualTourRoute.put(
  "/:tourId/scenes/:sceneId",
  VirtualTourSceneController.update,
);
adminVirtualTourRoute.delete(
  "/:tourId/scenes/:sceneId",
  VirtualTourSceneController.delete,
);

adminVirtualTourRoute.get(
  "/:tourId/scenes/:sceneId/links",
  VirtualTourLinkController.list,
);
adminVirtualTourRoute.post(
  "/:tourId/scenes/:sceneId/links",
  VirtualTourLinkController.create,
);
adminVirtualTourRoute.patch(
  "/:tourId/scenes/:sceneId/links/:linkId",
  VirtualTourLinkController.update,
);
adminVirtualTourRoute.put(
  "/:tourId/scenes/:sceneId/links/:linkId",
  VirtualTourLinkController.update,
);
adminVirtualTourRoute.delete(
  "/:tourId/scenes/:sceneId/links/:linkId",
  VirtualTourLinkController.delete,
);

adminVirtualTourRoute.get("/:tourId", VirtualTourController.get);
adminVirtualTourRoute.patch("/:tourId", VirtualTourController.update);
adminVirtualTourRoute.put("/:tourId", VirtualTourController.update);
adminVirtualTourRoute.delete("/:tourId", VirtualTourController.delete);
