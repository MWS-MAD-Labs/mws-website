import { Hono } from "hono";
import { AdminAdmissionsController } from "../../controllers/admin/PageEditors";
import { requireCmsPermission } from "../../middleware/require-cms-permission";
import type { SessionVariables } from "../../types/hono-context";

export const adminAdmissionRoute = new Hono<{ Variables: SessionVariables }>();

adminAdmissionRoute.use("*", requireCmsPermission("content:manage"));
adminAdmissionRoute.get("/", AdminAdmissionsController.get);
adminAdmissionRoute.put("/", AdminAdmissionsController.update);
