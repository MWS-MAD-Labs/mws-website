import { Hono } from "hono";
import { PublicHeroSlidesController } from "../../controllers/api/HeroSlides";

export const publicHeroSlideRoute = new Hono();

publicHeroSlideRoute.get("/", PublicHeroSlidesController.list);
