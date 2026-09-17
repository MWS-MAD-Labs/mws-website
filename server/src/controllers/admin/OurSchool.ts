import type { Context } from "hono";
import { ResponseError } from "../../error/response-error";
import { toJsonSafe } from "../../lib/json-response";
import { OurSchoolService } from "../../services/our-school-service";

async function readJson(c: Context) {
  try {
    return await c.req.json();
  } catch {
    throw new ResponseError(400, "Invalid JSON body.");
  }
}

export class AdminOurSchoolController {
  static async list(c: Context) {
    const items = await OurSchoolService.list();
    return c.json({ data: toJsonSafe(items) });
  }

  static async detail(c: Context) {
    const item = await OurSchoolService.get(c.req.param("id"));
    return c.json({ data: toJsonSafe(item) });
  }

  static async create(c: Context) {
    const item = await OurSchoolService.create(await readJson(c));
    return c.json({ data: toJsonSafe(item) }, 201);
  }

  static async update(c: Context) {
    const item = await OurSchoolService.update(
      c.req.param("id"),
      await readJson(c),
    );
    return c.json({ data: toJsonSafe(item) });
  }

  static async delete(c: Context) {
    await OurSchoolService.delete(c.req.param("id"));
    return c.body(null, 204);
  }
}
