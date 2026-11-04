import type { Context } from "hono";
import { sendStoredImage } from "../../lib/file-response";
import { toJsonSafe } from "../../lib/json-response";
import { PublicNewsService } from "../../services/public-news-service";
import { NewsService } from "../../services/news-service";
import { NewsContentImageService } from "../../services/news-content-image-service";

export class PublicNewsController {
  static async mediaFile(c: Context) {
    const file = await NewsService.getMediaFile(c.req.param("id"));
    // Media ids are never reused, so the file behind one never changes.
    return sendStoredImage(c, file, {
      cacheControl: "public, max-age=31536000, immutable",
    });
  }

  static async contentImage(c: Context) {
    const file = await NewsContentImageService.getFile(c.req.param("name"));
    // Names are random and never reused, so the file can be cached for good.
    return sendStoredImage(c, file, {
      cacheControl: "public, max-age=31536000, immutable",
    });
  }

  static async list(c: Context) {
    return c.json({
      data: toJsonSafe(await PublicNewsService.list(c.req.query())),
    });
  }

  static async categories(c: Context) {
    return c.json({ data: toJsonSafe(await PublicNewsService.categories()) });
  }

  static async detail(c: Context) {
    return c.json({
      data: toJsonSafe(await PublicNewsService.detail(c.req.param("slug"))),
    });
  }
}
