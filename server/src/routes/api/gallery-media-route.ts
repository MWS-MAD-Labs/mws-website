import { Hono } from "hono";
import { PublicGalleryMediaController } from "../../controllers/api/GalleryMedia";

export const publicGalleryMediaRoute = new Hono();

publicGalleryMediaRoute.get("/:id/file", PublicGalleryMediaController.image);
publicGalleryMediaRoute.get("/videos/:id/file", PublicGalleryMediaController.video);
