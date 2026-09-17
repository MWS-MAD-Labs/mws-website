import { Hono } from "hono";
import { AdminOurSchoolController } from "../../controllers/admin/OurSchool";
import { requireCmsPermission } from "../../middleware/require-cms-permission";
import type { SessionVariables } from "../../types/hono-context";

export const adminOurSchoolRoute = new Hono<{ Variables: SessionVariables }>();

adminOurSchoolRoute.use("*", requireCmsPermission("content:manage"));
adminOurSchoolRoute.get("/", AdminOurSchoolController.list);
adminOurSchoolRoute.post("/", AdminOurSchoolController.create);
adminOurSchoolRoute.get("/:id", AdminOurSchoolController.detail);
adminOurSchoolRoute.patch("/:id", AdminOurSchoolController.update);
adminOurSchoolRoute.delete("/:id", AdminOurSchoolController.delete);
