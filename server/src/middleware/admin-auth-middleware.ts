import type { Context, Next } from "hono";
import { ResponseError } from "../error/response-error";
import { resolveCentralIdentity } from "../lib/central-client";
import type { SessionVariables } from "../types/hono-context";

export async function adminAuthMiddleware(
  c: Context<{ Variables: SessionVariables }>,
  next: Next,
) {
  const sessionUser = c.var.user;
  if (!sessionUser) {
    throw new ResponseError(401, "Not signed in.");
  }

  try {
    const currentUser = await resolveCentralIdentity(sessionUser.email);
    if (!currentUser) {
      throw new ResponseError(403, "Central identity is no longer registered.");
    }

    const { CmsAuthService } = await import("../services/cms-auth-service");
    const freshCmsUser = await CmsAuthService.requireFreshSessionUser(
      sessionUser,
      currentUser,
    );

    c.set("user", freshCmsUser);
  } catch (error) {
    if (error instanceof ResponseError) throw error;
    console.error("Central lookup failed during CMS authorization:", error);
    throw new ResponseError(503, "Cannot verify Central identity right now.");
  }

  await next();
}
