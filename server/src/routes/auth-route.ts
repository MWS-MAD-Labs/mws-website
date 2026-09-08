import { Hono } from "hono";
import { AuthController } from "../controllers/auth-controller";
import { sessionAuthMiddleware } from "../middleware/session-auth-middleware";
import type { SessionVariables } from "../types/hono-context";

export const authRoute = new Hono<{ Variables: SessionVariables }>();

authRoute.get("/google/start", AuthController.startGoogleLogin);
authRoute.get("/google/callback", AuthController.googleCallback);
authRoute.post("/google", AuthController.loginWithGoogle);
authRoute.post("/logout", AuthController.logout);
authRoute.get("/me", sessionAuthMiddleware, AuthController.me);
