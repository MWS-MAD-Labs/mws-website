import { Hono } from "hono";
import { PublicPartnersController } from "../../controllers/api/Partners";

export const publicPartnersRoute = new Hono();

publicPartnersRoute.get("/", PublicPartnersController.list);
