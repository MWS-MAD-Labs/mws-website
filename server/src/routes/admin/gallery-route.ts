  import { Hono } from "hono";
import {
  AdminGalleriesController,
  AdminGalleryImagesController,
  AdminGalleryVideosController,
} from "../../controllers/admin/Galleries";
import { requireCmsPermission } from "../../middleware/require-cms-permission";
import type { SessionVariables } from "../../types/hono-context";

export const adminGalleryRoute = new Hono<{ Variables: SessionVariables }>();
export const adminGalleryImageRoute = new Hono<{ Variables: SessionVariables }>();
export const adminGalleryVideoRoute = new Hono<{ Variables: SessionVariables }>();

adminGalleryRoute.use("*", requireCmsPermission("content:manage"));
adminGalleryRoute.get("/", AdminGalleriesController.list);
adminGalleryRoute.post("/", AdminGalleriesController.create);
adminGalleryRoute.get("/:id", AdminGalleriesController.detail);
adminGalleryRoute.patch("/:id", AdminGalleriesController.update);
adminGalleryRoute.delete("/:id", AdminGalleriesController.delete);
adminGalleryRoute.post("/:id/images", AdminGalleriesController.uploadImage);
adminGalleryRoute.post("/:id/videos/upload", AdminGalleriesController.uploadVideo);
adminGalleryRoute.post("/:id/videos/youtube", AdminGalleriesController.createYoutubeVideo);

adminGalleryImageRoute.use("*", requireCmsPermission("content:manage"));
adminGalleryImageRoute.get("/:id/file", AdminGalleryImagesController.file);
adminGalleryImageRoute.patch("/:id", AdminGalleryImagesController.update);
adminGalleryImageRoute.delete("/:id", AdminGalleryImagesController.delete);

adminGalleryVideoRoute.use("*", requireCmsPermission("content:manage"));
adminGalleryVideoRoute.get("/:id/file", AdminGalleryVideosController.file);
adminGalleryVideoRoute.patch("/:id", AdminGalleryVideosController.update);
adminGalleryVideoRoute.delete("/:id", AdminGalleryVideosController.delete);
