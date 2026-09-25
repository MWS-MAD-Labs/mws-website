import type { Context, Next } from "hono";
import { ResponseError } from "../error/response-error";
import { resolveCentralIdentity } from "../lib/central-client";
import type { SessionVariables } from "../types/hono-context";
import type { CentralUser } from "../types/central-types";

const CENTRAL_IDENTITY_TTL_MS = 90 * 1000;
const CENTRAL_IDENTITY_STALE_MS = 5 * 60 * 1000;

type CachedCentralIdentity = {
  value: CentralUser | null;
  fetchedAt: number;
};

const centralIdentityCache = new Map<string, CachedCentralIdentity>();

export function clearCentralIdentityCacheForTest() {
  centralIdentityCache.clear();
}

async function resolveCachedCentralIdentity(
  email: string,
  requireFresh: boolean,
): Promise<CentralUser | null> {
  const cacheKey = email.toLowerCase();
  const cached = centralIdentityCache.get(cacheKey);
  const now = Date.now();

  if (!requireFresh && cached && now - cached.fetchedAt <= CENTRAL_IDENTITY_TTL_MS) {
    return cached.value;
  }

  try {
    const value = await resolveCentralIdentity(email);
    centralIdentityCache.set(cacheKey, { value, fetchedAt: now });
    return value;
  } catch (error) {
    if (
      !requireFresh &&
      cached &&
      now - cached.fetchedAt <= CENTRAL_IDENTITY_STALE_MS
    ) {
      return cached.value;
    }
    throw error;
  }
}

export async function adminAuthMiddleware(
  c: Context<{ Variables: SessionVariables }>,
  next: Next,
) {
  const sessionUser = c.var.user;
  if (!sessionUser) {
    throw new ResponseError(401, "Not signed in.");
  }

  try {
    const requiresFreshCentral = c.req.path.startsWith("/admin/users");
    const currentUser = await resolveCachedCentralIdentity(
      sessionUser.central.email,
      requiresFreshCentral,
    );
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
