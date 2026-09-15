import { Hono } from "hono";
import {
  AdminGalleriesController,
  AdminGalleryImagesController,
} from "../../controllers/admin/Galleries";
import { requireCmsPermission } from "../../middleware/require-cms-permission";
import type { SessionVariables } from "../../types/hono-context";

export const adminGalleryRoute = new Hono<{ Variables: SessionVariables }>();
export const adminGalleryImageRoute = new Hono<{ Variables: SessionVariables }>();

adminGalleryRoute.use("*", requireCmsPermission("content:manage"));
adminGalleryRoute.get("/", AdminGalleriesController.list);
adminGalleryRoute.post("/", AdminGalleriesController.create);
adminGalleryRoute.get("/:id", AdminGalleriesController.detail);
adminGalleryRoute.patch("/:id", AdminGalleriesController.update);
adminGalleryRoute.delete("/:id", AdminGalleriesController.delete);
adminGalleryRoute.post("/:id/images", AdminGalleriesController.uploadImage);

adminGalleryImageRoute.use("*", requireCmsPermission("content:manage"));
adminGalleryImageRoute.get("/:id/file", AdminGalleryImagesController.file);
adminGalleryImageRoute.patch("/:id", AdminGalleryImagesController.update);
adminGalleryImageRoute.delete("/:id", AdminGalleryImagesController.delete);
