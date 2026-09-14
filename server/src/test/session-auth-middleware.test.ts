import { beforeAll, describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { ResponseError } from "../error/response-error";
import { signSession } from "../lib/session";
import { sessionAuthMiddleware } from "../middleware/session-auth-middleware";
import { cmsSessionUser } from "./test-helpers";
import type { SessionVariables } from "../types/hono-context";

beforeAll(() => {
  process.env.JWT_SECRET = "test-jwt-secret-for-bun-test";
});

function buildApp() {
  const app = new Hono<{ Variables: SessionVariables }>();
  app.get("/protected", sessionAuthMiddleware, (c) => c.json({ data: c.var.user }));
  app.onError((err, c) => {
    if (err instanceof ResponseError) {
      return c.json({ errors: err.message }, err.status as 400);
    }
    throw err;
  });
  return app;
}

describe("sessionAuthMiddleware", () => {
  it("refuses unauthenticated requests", async () => {
    const res = await buildApp().request("/protected");

    expect(res.status).toBe(401);
    expect(((await res.json()) as { errors: string }).errors).toBe("Not signed in.");
  });

  it("refuses invalid session tokens", async () => {
    const res = await buildApp().request("/protected", {
      headers: { Cookie: "mws_cms_session=not-a-jwt" },
    });

    expect(res.status).toBe(401);
    expect(((await res.json()) as { errors: string }).errors).toBe(
      "Session expired or invalid.",
    );
  });

  it("allows valid session tokens and exposes the user", async () => {
    const user = cmsSessionUser("ADMIN");
    const token = await signSession(user);
    const res = await buildApp().request("/protected", {
      headers: { Cookie: `mws_cms_session=${token}` },
    });

    expect(res.status).toBe(200);
    expect(((await res.json()) as { data: unknown }).data).toEqual(user);
  });

  it("refuses inactive CMS users from the session", async () => {
    const token = await signSession({
      ...cmsSessionUser("ADMIN"),
      isActive: false,
    });
    const res = await buildApp().request("/protected", {
      headers: { Cookie: `mws_cms_session=${token}` },
    });

    expect(res.status).toBe(403);
    expect(((await res.json()) as { errors: string }).errors).toBe(
      "This CMS account is inactive.",
    );
  });
});
