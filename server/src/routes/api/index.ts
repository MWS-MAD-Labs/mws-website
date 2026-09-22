import { Hono } from "hono";
import { publicGalleryMediaRoute } from "./gallery-media-route";
import { publicHeroSlideRoute } from "./hero-slide-route";
import { meRoute } from "./me-route";
import { publicPageRoute } from "./page-route";
import { publicNewsRoute } from "./news-route";
import type { SessionVariables } from "../../types/hono-context";

export const apiRoute = new Hono<{ Variables: SessionVariables }>();

apiRoute.route("/me", meRoute);
apiRoute.route("/pages", publicPageRoute);
apiRoute.route("/hero-slides", publicHeroSlideRoute);
apiRoute.route("/gallery-images", publicGalleryMediaRoute);
apiRoute.route("/news", publicNewsRoute);
