import { Hono } from "hono";
import { MeController } from "../../controllers/api/Me";
import { adminAuthMiddleware } from "../../middleware/admin-auth-middleware";
import { sessionAuthMiddleware } from "../../middleware/session-auth-middleware";
import type { SessionVariables } from "../../types/hono-context";

export const meRoute = new Hono<{ Variables: SessionVariables }>();

meRoute.get("/", sessionAuthMiddleware, adminAuthMiddleware, MeController.me);
