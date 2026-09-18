import { Hono } from "hono";
import { AdminHeroSlidesController } from "../../controllers/admin/HeroSlides";
import { requireCmsPermission } from "../../middleware/require-cms-permission";
import type { SessionVariables } from "../../types/hono-context";

export const adminHeroSlideRoute = new Hono<{ Variables: SessionVariables }>();

adminHeroSlideRoute.use("*", requireCmsPermission("content:manage"));
adminHeroSlideRoute.get("/", AdminHeroSlidesController.list);
adminHeroSlideRoute.post("/", AdminHeroSlidesController.create);
adminHeroSlideRoute.patch("/:id", AdminHeroSlidesController.update);
adminHeroSlideRoute.put("/:id", AdminHeroSlidesController.update);
adminHeroSlideRoute.delete("/:id", AdminHeroSlidesController.delete);
