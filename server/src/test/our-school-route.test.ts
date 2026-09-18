import { afterEach, beforeAll, describe, expect, it, mock, spyOn } from "bun:test";
import { Hono } from "hono";
import { ResponseError } from "../error/response-error";
import { signSession } from "../lib/session";
import * as centralClient from "../lib/central-client";
import { adminRoute } from "../routes/admin";
import { CmsAuthService } from "../services/cms-auth-service";
import { OurSchoolService } from "../services/our-school-service";
import { cmsSessionUser, testUser } from "./test-helpers";
import type { SessionVariables } from "../types/hono-context";

const id = "44444444-4444-4444-8444-444444444444";
const galleryId = "11111111-1111-4111-8111-111111111111";
const featuredImageId = "22222222-2222-4222-8222-222222222222";
const ourSchool = {
  id,
  title: "Our School",
  description: "About school",
  content: null,
  galleryId,
  featuredImageId,
  gallery: null,
  featuredImage: null,
  createdAt: new Date("2026-09-16T00:00:00.000Z"),
  updatedAt: new Date("2026-09-16T00:00:00.000Z"),
};

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

async function authHeaders() {
  const user = cmsSessionUser("ADMIN");
  spyOn(centralClient, "resolveCentralIdentity").mockResolvedValue(testUser);
  spyOn(CmsAuthService, "requireFreshSessionUser").mockResolvedValue(user);
  const token = await signSession(user);

  return { Cookie: `mws_cms_session=${token}` };
}

describe("OurSchool admin routes", () => {
  it("creates OurSchool with galleryId and featuredImageId", async () => {
    spyOn(OurSchoolService, "create").mockResolvedValue(ourSchool);

    const payload = {
      title: "Our School",
      description: "About school",
      galleryId,
      featuredImageId,
    };
    const res = await buildApp().request("/admin/our-school", {
      method: "POST",
      headers: {
        ...(await authHeaders()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(201);
    expect(OurSchoolService.create).toHaveBeenCalledWith(payload);
    expect(((await res.json()) as { data: { featuredImageId: string } }).data.featuredImageId).toBe(
      featuredImageId,
    );
  });

  it("updates OurSchool with featuredImageId null", async () => {
    spyOn(OurSchoolService, "update").mockResolvedValue({
      ...ourSchool,
      featuredImageId: null,
    });

    const payload = { featuredImageId: null };
    const res = await buildApp().request(`/admin/our-school/${id}`, {
      method: "PATCH",
      headers: {
        ...(await authHeaders()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);
    expect(OurSchoolService.update).toHaveBeenCalledWith(id, payload);
    expect(((await res.json()) as { data: { featuredImageId: string | null } }).data.featuredImageId).toBeNull();
  });
});
