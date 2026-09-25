import { afterEach, beforeAll, describe, expect, it, mock, spyOn } from "bun:test";
import { Hono } from "hono";
import { ResponseError } from "../error/response-error";
import { signSession } from "../lib/session";
import { clearCentralIdentityCacheForTest } from "../middleware/admin-auth-middleware";
import * as centralClient from "../lib/central-client";
import { adminRoute } from "../routes/admin";
import { CmsAuthService } from "../services/cms-auth-service";
import { cmsSessionUser, testUser } from "./test-helpers";
import type { SessionVariables } from "../types/hono-context";

beforeAll(() => {
  process.env.JWT_SECRET = "test-jwt-secret-for-bun-test";
});

afterEach(() => {
  mock.restore();
  clearCentralIdentityCacheForTest();
});

function buildApp() {
  const app = new Hono<{ Variables: SessionVariables }>();
  app.route("/admin", adminRoute);
  app.onError((err, c) => {
    if (err instanceof ResponseError) {
      return c.json({ errors: err.message }, err.status as 400);
    }
    throw err;
  });
  return app;
}

async function authHeaders() {
  const user = cmsSessionUser("ADMIN");
  spyOn(centralClient, "resolveCentralIdentity").mockResolvedValue(testUser);
  spyOn(CmsAuthService, "requireFreshSessionUser").mockResolvedValue(user);
  const token = await signSession(user);

  return { Cookie: `mws_cms_session=${token}` };
}

describe("legacy admin CRUD routes", () => {
  it("does not expose the generic CRUD resource directory", async () => {
    const res = await buildApp().request("/admin/crud-resources", {
      headers: await authHeaders(),
    });

    expect(res.status).toBe(404);
  });

  it("does not expose removed generic resource endpoints", async () => {
    const res = await buildApp().request("/admin/campuses", {
      headers: await authHeaders(),
    });

    expect(res.status).toBe(404);
  });
});
