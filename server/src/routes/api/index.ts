import { Hono } from "hono";
import { meRoute } from "./me-route";
import { publicPageRoute } from "./page-route";
import type { SessionVariables } from "../../types/hono-context";

export const apiRoute = new Hono<{ Variables: SessionVariables }>();

apiRoute.route("/me", meRoute);
apiRoute.route("/pages", publicPageRoute);
