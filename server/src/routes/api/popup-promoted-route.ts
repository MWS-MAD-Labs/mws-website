import { Hono } from "hono";
import { PublicPopupPromotedController } from "../../controllers/api/PopupPromoted";

export const publicPopupPromotedRoute = new Hono();

publicPopupPromotedRoute.get("/active", PublicPopupPromotedController.active);
