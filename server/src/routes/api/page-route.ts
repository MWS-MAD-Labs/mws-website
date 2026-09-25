import { Hono } from "hono";
import { PublicPagesController } from "../../controllers/api/Pages";

export const publicPageRoute = new Hono();

publicPageRoute.get(
  "/academic-assets/:objectName",
  PublicPagesController.getAcademicAsset,
);
publicPageRoute.get("/academic/:levelKey", PublicPagesController.getAcademicLevel);
publicPageRoute.get("/:slug", PublicPagesController.get);
