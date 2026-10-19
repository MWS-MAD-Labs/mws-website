import { Hono } from "hono";
import { PublicVirtualToursController } from "../../controllers/api/VirtualTours";

export const publicVirtualTourRoute = new Hono();

publicVirtualTourRoute.get("/", PublicVirtualToursController.list);
publicVirtualTourRoute.get("/:slug", PublicVirtualToursController.get);
