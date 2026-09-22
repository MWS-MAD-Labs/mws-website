import { Hono } from "hono";
import { PublicNewsController } from "../../controllers/api/News";

export const publicNewsRoute = new Hono();

publicNewsRoute.get("/", PublicNewsController.list);
publicNewsRoute.get("/categories", PublicNewsController.categories);
publicNewsRoute.get("/media/:id/file", PublicNewsController.mediaFile);
publicNewsRoute.get("/:slug", PublicNewsController.detail);
