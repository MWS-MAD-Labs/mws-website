import { Hono } from "hono";
import { PublicPagesController } from "../../controllers/api/Pages";

export const publicPageRoute = new Hono();

publicPageRoute.get("/:slug", PublicPagesController.get);
