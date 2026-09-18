import type { Context } from "hono";
import { toJsonSafe } from "../../lib/json-response";
import { HeroSlideService } from "../../services/hero-slide-service";

export class PublicHeroSlidesController {
  static async list(c: Context) {
    const slides = await HeroSlideService.listPublic();
    return c.json({ data: toJsonSafe(slides) });
  }
}
