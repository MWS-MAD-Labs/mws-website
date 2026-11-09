import type { Context } from "hono";
import { listGoogleCalendarEvents } from "../../lib/google-calendar";

export class PublicCalendarController {
  static async events(c: Context) {
    const result = await listGoogleCalendarEvents(c.req.query());

    c.header("Cache-Control", "public, max-age=60");
    return c.json({ data: result });
  }
}
