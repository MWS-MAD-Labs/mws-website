import { afterEach, beforeAll, describe, expect, it, mock, spyOn } from "bun:test";
import { Hono } from "hono";
import { ResponseError } from "../error/response-error";
import * as centralClient from "../lib/central-client";
import { signSession } from "../lib/session";
import { adminRoute } from "../routes/admin";
import { apiRoute } from "../routes/api-router";
import { authRoute } from "../routes/auth";
import { CmsAuthService } from "../services/cms-auth-service";
import { ContactInquiryService } from "../services/contact-inquiry-service";
import { ContactPageService } from "../services/contact-page-service";
import type { SessionVariables } from "../types/hono-context";
import { cmsSessionUser, testUser } from "./test-helpers";

beforeAll(() => {
  process.env.JWT_SECRET = "test-jwt-secret-for-bun-test";
});

afterEach(() => {
  mock.restore();
});

function buildApp() {
  const app = new Hono<{ Variables: SessionVariables }>();
  app.route("/api", apiRoute);
  app.route("/admin", adminRoute);
  app.route("/auth", authRoute);
  app.onError((err, c) => {
    if (err instanceof ResponseError) {
      return c.json({ errors: err.message }, err.status as 400);
    }
    return c.json({ errors: "Internal server error" }, 500);
  });
  return app;
}

async function authHeaders() {
  const user = cmsSessionUser("SUPER_ADMIN");
  spyOn(centralClient, "resolveCentralIdentity").mockResolvedValue(testUser);
  spyOn(CmsAuthService, "requireFreshSessionUser").mockResolvedValue(user);
  const token = await signSession(user);

  return { Cookie: `mws_cms_session=${token}` };
}

const malformed = { "Content-Type": "application/json" };

describe("malformed JSON bodies return 400 instead of 500", () => {
  it("public contact inquiry", async () => {
    const submit = spyOn(ContactInquiryService, "submit");

    const res = await buildApp().request("/api/contact/inquiries", {
      method: "POST",
      headers: malformed,
      body: "{",
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ errors: "Invalid JSON body." });
    expect(submit).not.toHaveBeenCalled();
  });

  it("admin contact page update", async () => {
    const update = spyOn(ContactPageService, "update");

    const res = await buildApp().request("/admin/contact-page", {
      method: "PUT",
      headers: { ...malformed, ...(await authHeaders()) },
      body: "{",
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ errors: "Invalid JSON body." });
    expect(update).not.toHaveBeenCalled();
  });

  it("admin CMS user invitation", async () => {
    const invite = spyOn(CmsAuthService, "inviteAdmin");

    const res = await buildApp().request("/admin/users/invitations", {
      method: "POST",
      headers: { ...malformed, ...(await authHeaders()) },
      body: "{",
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ errors: "Invalid JSON body." });
    expect(invite).not.toHaveBeenCalled();
  });

  it("Google login without a readable body", async () => {
    const res = await buildApp().request("/auth/google", {
      method: "POST",
      headers: malformed,
      body: "{",
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ errors: "Google auth code is required." });
  });
});
