import type { Context } from "hono";
import { AcademicCalendarService } from "../../services/academic-calendar-service";

export class PublicCalendarController {
  static async academicEvents(c: Context) {
    const result = await AcademicCalendarService.listPublic(c.req.query());
    // Browsers and the nginx proxy may reuse the list briefly.
    c.header("Cache-Control", "public, max-age=60");
    return c.json({ data: result });
  }
}
