import { Hono } from "hono";
import { PublicAnalyticsController } from "../../controllers/api/Analytics";

export const publicAnalyticsRoute = new Hono();

publicAnalyticsRoute.post("/pageview", PublicAnalyticsController.pageView);
