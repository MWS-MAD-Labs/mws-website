import { Hono } from "hono";
import { AdminContactInquiriesController } from "../../controllers/admin/ContactInquiries";
import { requireCmsPermission } from "../../middleware/require-cms-permission";
import type { SessionVariables } from "../../types/hono-context";

export const adminContactInquiryRoute = new Hono<{
  Variables: SessionVariables;
}>();

adminContactInquiryRoute.use("*", requireCmsPermission("content:manage"));

adminContactInquiryRoute.get("/", AdminContactInquiriesController.list);
adminContactInquiryRoute.get("/:id", AdminContactInquiriesController.get);
adminContactInquiryRoute.patch("/:id", AdminContactInquiriesController.updateStatus);
