import type { Context } from "hono";
import { toJsonSafe } from "../../lib/json-response";
import { VirtualTourService } from "../../services/virtual-tour/virtual-tour";

export class PublicVirtualToursController {
  static async list(c: Context) {
    return c.json({ data: toJsonSafe(await VirtualTourService.listPublic()) });
  }

  static async get(c: Context) {
    return c.json({
      data: toJsonSafe(await VirtualTourService.getPublic(c.req.param("slug"))),
    });
  }
}
