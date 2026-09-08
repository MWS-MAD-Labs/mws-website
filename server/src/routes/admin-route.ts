import { Hono } from "hono";
import { DashboardController } from "../controllers/admin/Dashboard";
import { adminAuthMiddleware } from "../middleware/admin-auth-middleware";
import { sessionAuthMiddleware } from "../middleware/session-auth-middleware";
import type { SessionVariables } from "../types/hono-context";

export const adminRoute = new Hono<{ Variables: SessionVariables }>();

adminRoute.use("*", sessionAuthMiddleware, adminAuthMiddleware);
adminRoute.get("/", DashboardController.dashboard);
adminRoute.get("/dashboard-data", DashboardController.dashboard);
