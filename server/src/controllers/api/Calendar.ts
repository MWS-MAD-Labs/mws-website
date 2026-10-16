import type { Context } from "hono";
import { AcademicCalendarService } from "../../services/academic/academic-calendar-service";
import { listGoogleCalendarEvents } from "../../lib/google-calendar";

export class PublicCalendarController {
  static async events(c: Context) {
    const result = await listGoogleCalendarEvents(c.req.query());

    c.header("Cache-Control", "public, max-age=60");
    return c.json({ data: result });
  }

  static async academicEvents(c: Context) {
    const result = await AcademicCalendarService.listPublic(c.req.query());
    // Browsers and the nginx proxy may reuse the list briefly.
    c.header("Cache-Control", "public, max-age=60");
    return c.json({ data: result });
  }
}
