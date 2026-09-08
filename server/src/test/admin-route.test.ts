import { afterEach, beforeAll, describe, expect, it, mock, spyOn } from "bun:test";
import { Hono } from "hono";
import { adminRoute } from "../routes/admin-route";
import { ResponseError } from "../error/response-error";
import { signSession } from "../lib/session";
import * as centralClient from "../lib/central-client";
import { testUser } from "./test-helpers";
import type { SessionVariables } from "../types/hono-context";

beforeAll(() => {
  process.env.JWT_SECRET = "test-jwt-secret-for-bun-test";
});

afterEach(() => {
  mock.restore();
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

describe("adminRoute", () => {
  it("redirect is handled by frontend, while backend refuses unauthenticated admin API access", async () => {
    const res = await buildApp().request("/admin/dashboard-data");

    expect(res.status).toBe(401);
    expect(((await res.json()) as { errors: string }).errors).toBe("Not signed in.");
  });

  it("allows an authenticated Central user to access dashboard data", async () => {
    spyOn(centralClient, "resolveCentralIdentity").mockResolvedValue(testUser);
    const token = await signSession(testUser);

    const res = await buildApp().request("/admin/dashboard-data", {
      headers: { Cookie: `mws_cms_session=${token}` },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { message: string; user: unknown } };
    expect(body.data.message).toBe("Halo, Test Employee");
    expect(body.data.user).toEqual(testUser);
  });

  it("refuses access when Central no longer recognizes the session identity", async () => {
    spyOn(centralClient, "resolveCentralIdentity").mockResolvedValue(null);
    const token = await signSession(testUser);

    const res = await buildApp().request("/admin/dashboard-data", {
      headers: { Cookie: `mws_cms_session=${token}` },
    });

    expect(res.status).toBe(403);
    expect(((await res.json()) as { errors: string }).errors).toBe(
      "Central identity is no longer registered.",
    );
  });
});
