import type { Context } from "hono";
import { sendStoredFile } from "../../lib/file-response";
import { GalleryService } from "../../services/gallery-service";

export class PublicGalleryMediaController {
  static async image(c: Context) {
    const file = await GalleryService.getImageFile(c.req.param("id"));
    return sendStoredFile(c, file, {
      cacheControl: "public, max-age=300",
    });
  }

  static async video(c: Context) {
    const file = await GalleryService.getVideoFile(c.req.param("id"));
    return sendStoredFile(c, file, {
      acceptRanges: true,
      cacheControl: "public, max-age=300",
    });
  }
}
