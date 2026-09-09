import { afterEach, beforeAll, describe, expect, it, mock, spyOn } from "bun:test";
import { Hono } from "hono";
import { authRoute } from "../routes/auth-route";
import { ResponseError } from "../error/response-error";
import { AuthService } from "../services/auth-services";
import { CmsAuthService } from "../services/cms-auth-service";
import * as centralClient from "../lib/central-client";
import { cmsSessionUser, testUser } from "./test-helpers";
import type { SessionVariables } from "../types/hono-context";

beforeAll(() => {
  process.env.JWT_SECRET = "test-jwt-secret-for-bun-test";
});

afterEach(() => {
  mock.restore();
  process.env.FRONTEND_ORIGIN = "http://localhost:5173";
});

function buildApp() {
  const app = new Hono<{ Variables: SessionVariables }>();
  app.route("/auth", authRoute);
  app.onError((err, c) => {
    if (err instanceof ResponseError) {
      return c.json({ errors: err.message }, err.status as 400);
    }
    throw err;
  });
  return app;
}

describe("CMS LoginController", () => {
  it("completes Google login, stores the session cookie, and returns CMS user", async () => {
    const user = cmsSessionUser("SUPER_ADMIN");
    spyOn(AuthService, "loginWithGoogle").mockResolvedValue({
      token: "signed-session-token",
      user,
    });

    const res = await buildApp().request("/auth/google", {
      method: "POST",
      body: JSON.stringify({ code: "google-code" }),
      headers: { "Content-Type": "application/json" },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toContain("mws_cms_session=signed-session-token");
    expect(((await res.json()) as { data: unknown }).data).toEqual(user);
  });

  it("rejects Google login without a code", async () => {
    const res = await buildApp().request("/auth/google", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });

    expect(res.status).toBe(400);
    expect(((await res.json()) as { errors: string }).errors).toBe(
      "Google auth code is required.",
    );
  });

  it("returns current CMS user from a valid token", async () => {
    const user = cmsSessionUser("VIEWER");
    spyOn(centralClient, "resolveCentralIdentity").mockResolvedValue(testUser);
    spyOn(CmsAuthService, "requireFreshSessionUser").mockResolvedValue(user);
    const token = await import("../lib/session").then((session) =>
      session.signSession(user),
    );
    const res = await buildApp().request("/auth/me", {
      headers: { Cookie: `mws_cms_session=${token}` },
    });

    expect(res.status).toBe(200);
    expect(((await res.json()) as { data: unknown }).data).toEqual(user);
  });

  it("redirects an invalid callback state back to admin login", async () => {
    process.env.FRONTEND_ORIGIN = "http://cms.test";
    const res = await buildApp().request(
      "/auth/google/callback?code=code&state=actual",
      {
        headers: { Cookie: "mws_cms_google_oauth_state=expected" },
      },
    );

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(
      "http://cms.test/admin/login?error=google_state",
    );
  });
});
