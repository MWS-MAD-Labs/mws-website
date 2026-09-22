import type { Context } from "hono";
import { toJsonSafe } from "../../lib/json-response";
import { PublicNewsService } from "../../services/public-news-service";
import { NewsService } from "../../services/news-service";

export class PublicNewsController {
  static async mediaFile(c: Context) {
    const file = await NewsService.getMediaFile(c.req.param("id"));
    c.header("Content-Type", file.contentType);
    c.header("Content-Length", String(file.size));
    c.header("Cache-Control", "public, max-age=300");
    return c.body(file.buffer);
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
