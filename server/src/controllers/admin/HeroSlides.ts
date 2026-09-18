import type { Context } from "hono";
import { ResponseError } from "../../error/response-error";
import { toJsonSafe } from "../../lib/json-response";
import { HeroSlideService } from "../../services/hero-slide-service";

async function readJson(c: Context) {
  try {
    return await c.req.json();
  } catch {
    throw new ResponseError(400, "Invalid JSON body.");
  }
}

export class AdminHeroSlidesController {
  static async list(c: Context) {
    const slides = await HeroSlideService.listAdmin();
    return c.json({ data: toJsonSafe(slides) });
  }

  static async create(c: Context) {
    const slide = await HeroSlideService.create(await readJson(c));
    return c.json({ data: toJsonSafe(slide) }, 201);
  }

  static async update(c: Context) {
    const slide = await HeroSlideService.update(c.req.param("id"), await readJson(c));
    return c.json({ data: toJsonSafe(slide) });
  }

  static async delete(c: Context) {
    await HeroSlideService.delete(c.req.param("id"));
    return c.body(null, 204);
  }
}
