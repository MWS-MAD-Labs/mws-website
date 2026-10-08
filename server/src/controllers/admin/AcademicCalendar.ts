import type { Context } from "hono";
import { ResponseError } from "../../error/response-error";
import { toJsonSafe } from "../../lib/json-response";
import { AcademicCalendarService } from "../../services/academic-calendar-service";

async function readJson(c: Context) {
  try {
    return await c.req.json();
  } catch {
    throw new ResponseError(400, "Invalid JSON body.");
  }
}

export class AdminAcademicCalendarController {
  static async list(c: Context) {
    return c.json({ data: toJsonSafe(await AcademicCalendarService.list(c.req.query())) });
  }

  static async create(c: Context) {
    return c.json(
      { data: toJsonSafe(await AcademicCalendarService.create(await readJson(c))) },
      201,
    );
  }

  static async update(c: Context) {
    return c.json({
      data: toJsonSafe(
        await AcademicCalendarService.update(c.req.param("id"), await readJson(c)),
      ),
    });
  }

  static async delete(c: Context) {
    await AcademicCalendarService.delete(c.req.param("id"));
    return c.body(null, 204);
  }
}
