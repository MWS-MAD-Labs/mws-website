import { Hono } from "hono";
import { AdminAdmissionGuidelinesController } from "../../controllers/admin/PageEditors";
import { requireCmsPermission } from "../../middleware/require-cms-permission";
import type { SessionVariables } from "../../types/hono-context";

export const adminAdmissionGuidelinesRoute = new Hono<{
  Variables: SessionVariables;
}>();

adminAdmissionGuidelinesRoute.use("*", requireCmsPermission("content:manage"));
adminAdmissionGuidelinesRoute.get("/", AdminAdmissionGuidelinesController.get);
adminAdmissionGuidelinesRoute.put("/", AdminAdmissionGuidelinesController.update);
