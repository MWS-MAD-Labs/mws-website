import { afterEach, beforeAll, describe, expect, it, mock, spyOn } from "bun:test";
import { Hono } from "hono";
import { adminRoute } from "../routes/admin-route";
import { ResponseError } from "../error/response-error";
import { signSession } from "../lib/session";
import * as centralClient from "../lib/central-client";
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
    const cmsUser = cmsSessionUser("ADMIN");
    spyOn(centralClient, "resolveCentralIdentity").mockResolvedValue(testUser);
    spyOn(CmsAuthService, "requireFreshSessionUser").mockResolvedValue(cmsUser);
    const token = await signSession(cmsUser);

    const res = await buildApp().request("/admin/dashboard-data", {
      headers: { Cookie: `mws_cms_session=${token}` },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { message: string; user: unknown } };
    expect(body.data.message).toBe("Halo, Test Employee");
    expect(body.data.user).toEqual(cmsUser);
  });

  it("allows SUPER_ADMIN to access dashboard data", async () => {
    const cmsUser = cmsSessionUser("SUPER_ADMIN");
    spyOn(centralClient, "resolveCentralIdentity").mockResolvedValue(testUser);
    spyOn(CmsAuthService, "requireFreshSessionUser").mockResolvedValue(cmsUser);
    const token = await signSession(cmsUser);

    const res = await buildApp().request("/admin/dashboard-data", {
      headers: { Cookie: `mws_cms_session=${token}` },
    });

    expect(res.status).toBe(200);
  });

  it("allows VIEWER to access dashboard data", async () => {
    const cmsUser = cmsSessionUser("VIEWER");
    spyOn(centralClient, "resolveCentralIdentity").mockResolvedValue(testUser);
    spyOn(CmsAuthService, "requireFreshSessionUser").mockResolvedValue(cmsUser);
    const token = await signSession(cmsUser);

    const res = await buildApp().request("/admin/dashboard-data", {
      headers: { Cookie: `mws_cms_session=${token}` },
    });

    expect(res.status).toBe(200);
  });

  it("refuses access when Central no longer recognizes the session identity", async () => {
    spyOn(centralClient, "resolveCentralIdentity").mockResolvedValue(null);
    const token = await signSession(cmsSessionUser("SUPER_ADMIN"));

    const res = await buildApp().request("/admin/dashboard-data", {
      headers: { Cookie: `mws_cms_session=${token}` },
    });

    expect(res.status).toBe(403);
    expect(((await res.json()) as { errors: string }).errors).toBe(
      "Central identity is no longer registered.",
    );
  });

  it("refuses promotion attempts from ADMIN", async () => {
    const cmsUser = cmsSessionUser("ADMIN");
    spyOn(centralClient, "resolveCentralIdentity").mockResolvedValue(testUser);
    spyOn(CmsAuthService, "requireFreshSessionUser").mockResolvedValue(cmsUser);
    const token = await signSession(cmsUser);

    const res = await buildApp().request("/admin/users/cms-user-2/role", {
      method: "PATCH",
      headers: {
        Cookie: `mws_cms_session=${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roleName: "SUPER_ADMIN" }),
    });

    expect(res.status).toBe(403);
  });

  it("allows SUPER_ADMIN to promote a CMS user", async () => {
    const cmsUser = cmsSessionUser("SUPER_ADMIN");
    spyOn(centralClient, "resolveCentralIdentity").mockResolvedValue(testUser);
    spyOn(CmsAuthService, "requireFreshSessionUser").mockResolvedValue(cmsUser);
    spyOn(CmsAuthService, "updateUserRole").mockResolvedValue({
      id: "cms-user-2",
      email: "target@millennia21.id",
      fullName: "Target User",
      phone: null,
      isActive: true,
      role: {
        name: "ADMIN",
        label: "Admin",
      },
    });
    const token = await signSession(cmsUser);

    const res = await buildApp().request("/admin/users/cms-user-2/role", {
      method: "PATCH",
      headers: {
        Cookie: `mws_cms_session=${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roleName: "ADMIN" }),
    });

    expect(res.status).toBe(200);
    expect(CmsAuthService.updateUserRole).toHaveBeenCalledWith(
      "cms-user-2",
      "ADMIN",
    );
  });
});
