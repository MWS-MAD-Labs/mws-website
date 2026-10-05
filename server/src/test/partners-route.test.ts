import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import { Hono } from "hono";
import { ResponseError } from "../error/response-error";
import { partnersRoute } from "../routes/admin/partners-route";
import { PartnerService } from "../services/partner-service";
import type { CmsSessionUser } from "../types/cms-auth-types";
import type { SessionVariables } from "../types/hono-context";
import { cmsSessionUser } from "./test-helpers";

const partnerId = "11111111-1111-4111-8111-111111111111";

function partner(overrides: Record<string, unknown> = {}) {
  return {
    id: partnerId,
    name: "Partner",
    description: "Learning partner",
    logo: "/logos/partner.png",
    link: null,
    status: "active",
    createdAt: new Date("2026-10-05T00:00:00.000Z"),
    updatedAt: new Date("2026-10-05T00:00:00.000Z"),
    ...overrides,
  };
}

function buildApp(user: CmsSessionUser = cmsSessionUser("ADMIN")) {
  const app = new Hono<{ Variables: SessionVariables }>();

  app.use("*", async (c, next) => {
    c.set("user", user);
    await next();
  });
  app.route("/partners", partnersRoute);
  app.onError((err, c) => {
    if (err instanceof ResponseError) {
      return c.json({ errors: err.message }, err.status as 400);
    }

    return c.json({ errors: "Internal server error" }, 500);
  });

  return app;
}

async function expectErrorJson(
  res: Response,
  status: number,
  message: string,
) {
  expect(res.status).toBe(status);
  expect(res.headers.get("content-type")).toContain("application/json");
  expect(await res.json()).toEqual({ errors: message });
}

afterEach(() => {
  mock.restore();
});

describe("partnersRoute", () => {
  it("returns JSON 400 for malformed create bodies", async () => {
    const create = spyOn(PartnerService, "create");

    const res = await buildApp().request("/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });

    await expectErrorJson(res, 400, "Invalid JSON body.");
    expect(create).not.toHaveBeenCalled();
  });

  it("returns JSON 400 for invalid update ids", async () => {
    const update = spyOn(PartnerService, "update");

    const res = await buildApp().request("/partners/not-a-uuid", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated Partner" }),
    });

    await expectErrorJson(res, 400, "Valid UUID partner id is required.");
    expect(update).toHaveBeenCalledWith("not-a-uuid", { name: "Updated Partner" });
  });

  it("returns JSON 409 for duplicate creates", async () => {
    spyOn(PartnerService, "create").mockImplementation(async () => {
      throw new ResponseError(409, "Partner with the same name already exists.");
    });

    const res = await buildApp().request("/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Partner",
        description: "Learning partner",
        logo: "/logos/partner.png",
        status: "active",
      }),
    });

    await expectErrorJson(
      res,
      409,
      "Partner with the same name already exists.",
    );
  });

  it("returns JSON 404 for missing deletes", async () => {
    spyOn(PartnerService, "delete").mockImplementation(async () => {
      throw new ResponseError(404, "Partner not found.");
    });

    const res = await buildApp().request("/partners/" + partnerId, {
      method: "DELETE",
    });

    await expectErrorJson(res, 404, "Partner not found.");
  });

  it("returns JSON 500 for unexpected update errors", async () => {
    spyOn(PartnerService, "update").mockImplementation(async () => {
      throw new Error("database connection leaked detail");
    });

    const res = await buildApp().request("/partners/" + partnerId, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated Partner" }),
    });

    await expectErrorJson(res, 500, "Internal server error");
  });

  it("requires content management permission with JSON 403", async () => {
    const user = {
      ...cmsSessionUser("ADMIN"),
      role: {
        name: "ADMIN",
        label: "ADMIN",
        permissions: ["dashboard:read"],
      },
    } as CmsSessionUser;
    const list = spyOn(PartnerService, "list");

    const res = await buildApp(user).request("/partners");

    await expectErrorJson(
      res,
      403,
      "You are not allowed to perform this action.",
    );
    expect(list).not.toHaveBeenCalled();
  });

  it("routes PUT updates to the Partners controller", async () => {
    const update = spyOn(PartnerService, "update").mockResolvedValue(
      partner({ name: "Updated Partner" }) as never,
    );

    const res = await buildApp().request("/partners/" + partnerId, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated Partner" }),
    });

    expect(res.status).toBe(200);
    expect(update).toHaveBeenCalledWith(partnerId, { name: "Updated Partner" });
    expect(((await res.json()) as { data: { name: string } }).data.name).toBe(
      "Updated Partner",
    );
  });
});
