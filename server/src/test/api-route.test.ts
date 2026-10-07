import {
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from "bun:test";
import { Hono } from "hono";
import { ResponseError } from "../error/response-error";
import { signSession } from "../lib/session";
import * as centralClient from "../lib/central-client";
import { apiRoute } from "../routes/api-router";
import { CmsAuthService } from "../services/cms-auth-service";
import { PartnerService } from "../services/partner-service";
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
  it("returns public partner logos only", async () => {
    spyOn(PartnerService, "publicLogos").mockResolvedValue([
      { logo: "/uploads/partner-logo.png" },
    ]);

    const res = await buildApp().request("/api/partners");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      data: [{ logo: "/uploads/partner-logo.png" }],
    });
  });
});
