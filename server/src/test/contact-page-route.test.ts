import { afterEach, beforeAll, describe, expect, it, mock, spyOn } from "bun:test";
import { Hono } from "hono";
import { ResponseError } from "../error/response-error";
import { signSession } from "../lib/session";
import * as centralClient from "../lib/central-client";
import { adminRoute } from "../routes/admin";
import { apiRoute } from "../routes/api-router";
import {
  ContactPageService,
  defaultContactPageContent,
} from "../services/contact-page-service";
import { CmsAuthService } from "../services/cms-auth-service";
import { cmsSessionUser, testUser } from "./test-helpers";
import type { SessionVariables } from "../types/hono-context";

const contactPage = {
  id: "contact-page-1",
  slug: "contact",
  title: "Contact Us",
  template: "contact",
  status: "published",
  updatedAt: new Date("2026-09-10T03:00:00.000Z"),
  content: defaultContactPageContent,
  isDefault: false,
};

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

describe("contact page routes", () => {
  it("returns public contact page content", async () => {
    spyOn(ContactPageService, "getPublic").mockResolvedValue(contactPage);

    const res = await buildApp().request("/api/pages/contact");

    expect(res.status).toBe(200);
    expect(ContactPageService.getPublic).toHaveBeenCalled();
    expect(((await res.json()) as { data: { slug: string } }).data.slug).toBe(
      "contact",
    );
  });

  it("returns contact page content for authenticated CMS users", async () => {
    spyOn(ContactPageService, "getAdmin").mockResolvedValue(contactPage);

    const res = await buildApp().request("/admin/contact-page", {
      headers: await authHeaders(),
    });

    expect(res.status).toBe(200);
    expect(ContactPageService.getAdmin).toHaveBeenCalled();
  });

  it("updates contact page content for authenticated CMS users", async () => {
    spyOn(ContactPageService, "update").mockResolvedValue(contactPage);

    const res = await buildApp().request("/admin/contact-page", {
      method: "PUT",
      headers: {
        ...(await authHeaders()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(defaultContactPageContent),
    });

    expect(res.status).toBe(200);
    expect(ContactPageService.update).toHaveBeenCalledWith(
      defaultContactPageContent,
      "cms-user-1",
    );
  });

  it("resets contact page content for authenticated CMS users", async () => {
    spyOn(ContactPageService, "delete").mockResolvedValue(undefined);

    const res = await buildApp().request("/admin/contact-page", {
      method: "DELETE",
      headers: await authHeaders(),
    });

    expect(res.status).toBe(204);
    expect(ContactPageService.delete).toHaveBeenCalled();
  });
});
