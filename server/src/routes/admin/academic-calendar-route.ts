import { Hono } from "hono";
import { AdminAcademicCalendarController } from "../../controllers/admin/AcademicCalendar";
import { requireCmsPermission } from "../../middleware/require-cms-permission";
import type { SessionVariables } from "../../types/hono-context";

export const adminAcademicCalendarRoute = new Hono<{
  Variables: SessionVariables;
}>();

adminAcademicCalendarRoute.use("*", requireCmsPermission("content:manage"));
adminAcademicCalendarRoute.get("/", AdminAcademicCalendarController.list);
adminAcademicCalendarRoute.post("/", AdminAcademicCalendarController.create);
adminAcademicCalendarRoute.patch("/:id", AdminAcademicCalendarController.update);
adminAcademicCalendarRoute.put("/:id", AdminAcademicCalendarController.update);
adminAcademicCalendarRoute.delete("/:id", AdminAcademicCalendarController.delete);
