import { Hono } from "hono";
import { PublicCalendarController } from "../../controllers/api/Calendar";

export const publicCalendarRoute = new Hono();

publicCalendarRoute.get("/events", PublicCalendarController.events);
