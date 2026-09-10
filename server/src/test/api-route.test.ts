import { afterEach, beforeAll, describe, expect, it, mock, spyOn } from "bun:test";
import { Hono } from "hono";
import { ResponseError } from "../error/response-error";
import { signSession } from "../lib/session";
import * as centralClient from "../lib/central-client";
import { apiRoute } from "../routes/api-router";
import { CmsAuthService } from "../services/cms-auth-service";
import { cmsSessionUser, testUser } from "./test-helpers";
import type { SessionVariables } from "../types/hono-context";

beforeAll(() => {
  process.env.JWT_SECRET = "test-jwt-secret-for-bun-test";
});

afterEach(() => {
  mock.restore();
});

function buildApp() {
  const app = new Hono<{ Variables: SessionVariables }>();
  app.route("/api", apiRoute);
  app.onError((err, c) => {
    if (err instanceof ResponseError) {
      return c.json({ errors: err.message }, err.status as 400);
    }
    throw err;
  });
  return app;
}

describe("apiRoute", () => {
  it("refuses unauthenticated /api/me requests", async () => {
    const res = await buildApp().request("/api/me");

    expect(res.status).toBe(401);
    expect(((await res.json()) as { errors: string }).errors).toBe("Not signed in.");
  });

  it("returns the fresh CMS session user from /api/me", async () => {
    const cmsUser = cmsSessionUser("ADMIN");
    spyOn(centralClient, "resolveCentralIdentity").mockResolvedValue(testUser);
    spyOn(CmsAuthService, "requireFreshSessionUser").mockResolvedValue(cmsUser);
    const token = await signSession(cmsUser);

    const res = await buildApp().request("/api/me", {
      headers: { Cookie: `mws_cms_session=${token}` },
    });

    expect(res.status).toBe(200);
    expect(((await res.json()) as { data: unknown }).data).toEqual(cmsUser);
  });
});
