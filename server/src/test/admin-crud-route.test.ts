import { afterEach, beforeAll, describe, expect, it, mock, spyOn } from "bun:test";
import { Hono } from "hono";
import { ResponseError } from "../error/response-error";
import { signSession } from "../lib/session";
import * as centralClient from "../lib/central-client";
import { adminCrudResourceNames } from "../models/admin-crud-model";
import { adminRoute } from "../routes/admin";
import { CmsAuthService } from "../services/cms-auth-service";
import { AdminCrudService } from "../services/admin-crud-service";
import { cmsSessionUser, testUser } from "./test-helpers";
import type { SessionVariables } from "../types/hono-context";

const id = "11111111-1111-4111-8111-111111111111";
const createdCampus = {
  id,
  name: "Main Campus",
  slug: "main-campus",
  createdAt: new Date("2026-09-10T03:00:00.000Z"),
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

async function authHeaders(roleName: "SUPER_ADMIN" | "ADMIN" | "VIEWER" = "ADMIN") {
  const user =
    roleName === "VIEWER"
      ? {
          ...cmsSessionUser("ADMIN"),
          role: {
            name: "ADMIN" as const,
            label: "VIEWER",
            permissions: ["dashboard:read" as const],
          },
        }
      : cmsSessionUser(roleName);
  spyOn(centralClient, "resolveCentralIdentity").mockResolvedValue(testUser);
  spyOn(CmsAuthService, "requireFreshSessionUser").mockResolvedValue(user);
  const token = await signSession(user);

  return { Cookie: `mws_cms_session=${token}` };
}

describe("admin CRUD routes", () => {
  it("lists available CRUD resources", async () => {
    const res = await buildApp().request("/admin/crud-resources", {
      headers: await authHeaders(),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      data: { resource: string; label: string }[];
    };
    expect(body.data.map((item) => item.resource)).toContain("campuses");
  });

  for (const resource of adminCrudResourceNames) {
    it(`lists ${resource}`, async () => {
      spyOn(AdminCrudService, "list").mockResolvedValue({
        items: [],
        pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
      });

      const res = await buildApp().request(`/admin/${resource}`, {
        headers: await authHeaders(),
      });

      expect(res.status).toBe(200);
      expect(AdminCrudService.list).toHaveBeenCalledWith(resource, {});
    });
  }

  it("creates a resource with POST", async () => {
    spyOn(AdminCrudService, "create").mockResolvedValue(createdCampus);

    const res = await buildApp().request("/admin/campuses", {
      method: "POST",
      headers: {
        ...(await authHeaders()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Main Campus", slug: "main-campus" }),
    });

    expect(res.status).toBe(201);
    expect(AdminCrudService.create).toHaveBeenCalledWith("campuses", {
      name: "Main Campus",
      slug: "main-campus",
    });
    expect(((await res.json()) as { data: { id: string } }).data.id).toBe(id);
  });

  it("gets a resource detail with GET", async () => {
    spyOn(AdminCrudService, "findById").mockResolvedValue(createdCampus);

    const res = await buildApp().request(`/admin/campuses/${id}`, {
      headers: await authHeaders(),
    });

    expect(res.status).toBe(200);
    expect(AdminCrudService.findById).toHaveBeenCalledWith("campuses", id);
  });

  it("updates a resource with PATCH", async () => {
    spyOn(AdminCrudService, "update").mockResolvedValue({
      ...createdCampus,
      phone: "+62 21-7463-3333",
    });

    const res = await buildApp().request(`/admin/campuses/${id}`, {
      method: "PATCH",
      headers: {
        ...(await authHeaders()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone: "+62 21-7463-3333" }),
    });

    expect(res.status).toBe(200);
    expect(AdminCrudService.update).toHaveBeenCalledWith("campuses", id, {
      phone: "+62 21-7463-3333",
    });
  });

  it("updates a resource with PUT", async () => {
    spyOn(AdminCrudService, "update").mockResolvedValue(createdCampus);

    const res = await buildApp().request(`/admin/campuses/${id}`, {
      method: "PUT",
      headers: {
        ...(await authHeaders()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Main Campus", slug: "main-campus" }),
    });

    expect(res.status).toBe(200);
    expect(AdminCrudService.update).toHaveBeenCalledWith("campuses", id, {
      name: "Main Campus",
      slug: "main-campus",
    });
  });

  it("deletes a resource with DELETE", async () => {
    spyOn(AdminCrudService, "delete").mockResolvedValue({ id, deleted: true });

    const res = await buildApp().request(`/admin/campuses/${id}`, {
      method: "DELETE",
      headers: await authHeaders(),
    });

    expect(res.status).toBe(200);
    expect(AdminCrudService.delete).toHaveBeenCalledWith("campuses", id);
    expect(await res.json()).toEqual({ data: { id, deleted: true } });
  });

  it("returns validation error for invalid detail ids", async () => {
    spyOn(AdminCrudService, "findById").mockResolvedValue(createdCampus);

    const res = await buildApp().request("/admin/campuses/not-a-uuid", {
      headers: await authHeaders(),
    });

    expect(res.status).toBe(400);
    expect(((await res.json()) as { errors: string }).errors).toBe(
      "Valid UUID id is required.",
    );
    expect(AdminCrudService.findById).not.toHaveBeenCalled();
  });

  it("returns service errors as JSON", async () => {
    spyOn(AdminCrudService, "create").mockRejectedValue(
      new ResponseError(409, "Campus with the same slug already exists."),
    );

    const res = await buildApp().request("/admin/campuses", {
      method: "POST",
      headers: {
        ...(await authHeaders()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Main Campus", slug: "main-campus" }),
    });

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({
      errors: "Campus with the same slug already exists.",
    });
  });

  it("blocks VIEWER users from CRUD content changes", async () => {
    spyOn(AdminCrudService, "list").mockResolvedValue({
      items: [],
      pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    });

    const res = await buildApp().request("/admin/campuses", {
      headers: await authHeaders("VIEWER"),
    });

    expect(res.status).toBe(403);
    expect(AdminCrudService.list).not.toHaveBeenCalled();
  });
});
