import type { Context } from "hono";
import { GalleryService } from "../../services/gallery-service";

export class PublicGalleryMediaController {
  static async image(c: Context) {
    const file = await GalleryService.getImageFile(c.req.param("id"));
    c.header("Content-Type", file.contentType);
    c.header("Content-Length", String(file.size));
    c.header("Cache-Control", "public, max-age=300");
    return c.body(file.buffer);
  }

  static async video(c: Context) {
    const file = await GalleryService.getVideoFile(c.req.param("id"));
    c.header("Content-Type", file.contentType);
    c.header("Content-Length", String(file.size));
    c.header("Cache-Control", "public, max-age=300");
    return c.body(file.buffer);
  }
}
