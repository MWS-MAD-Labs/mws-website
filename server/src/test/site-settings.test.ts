import { afterEach, beforeAll, describe, expect, it, mock, spyOn } from "bun:test";
import { Hono } from "hono";
import { ResponseError } from "../error/response-error";
import * as centralClient from "../lib/central-client";
import * as prismaLib from "../lib/prisma";
import { signSession } from "../lib/session";
import { adminRoute } from "../routes/admin";
import { apiRoute } from "../routes/api-router";
import { CmsAuthService } from "../services/auth/cms-auth-service";
import {
  ContactPageService,
  defaultContactPageContent,
} from "../services/contact/contact-page-service";
import {
  SiteSettingsService,
  defaultSiteSettings,
} from "../services/site-settings-service";
import type { SessionVariables } from "../types/hono-context";
import { cmsSessionUser, testUser } from "./test-helpers";

const embedSrc =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1!2d106.7!3d-6.3!2m3!1f0!2f0!3f0";

type Row = { id: string; slug: string; body: unknown; updatedAt: Date; deletedAt: Date | null };

/** Minimal in-memory cmsPage delegate keyed by slug. */
function fakePrisma(rows: Row[]) {
  const findFirst = mock(async ({ where }: { where: { slug: string; deletedAt?: null } }) => {
    const row = rows.find((item) => item.slug === where.slug);
    if (!row) return null;
    if (where.deletedAt === null && row.deletedAt) return null;
    return row;
  });
  const upsert = mock(
    async ({ where, create, update }: { where: { slug: string }; create: Row; update: Row }) => {
      const existing = rows.find((item) => item.slug === where.slug);
      const updatedAt = new Date("2026-11-09T00:00:00.000Z");
      if (existing) {
        Object.assign(existing, update, { updatedAt });
        return existing;
      }
      const row = { ...create, id: "settings-1", updatedAt, deletedAt: null };
      rows.push(row);
      return row;
    },
  );
  const cmsPage = { findFirst, upsert };
  const client = {
    cmsPage,
    $transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn({ cmsPage }),
  };
  spyOn(prismaLib, "getPrisma").mockReturnValue(client as never);
  return { rows, upsert };
}

async function expectResponseError(promise: Promise<unknown>, status: number, part: string) {
  try {
    await promise;
    throw new Error("Expected ResponseError.");
  } catch (error) {
    expect(error).toBeInstanceOf(ResponseError);
    expect((error as ResponseError).status).toBe(status);
    expect((error as ResponseError).message).toContain(part);
  }
}

beforeAll(() => {
  process.env.JWT_SECRET = "test-jwt-secret-for-bun-test";
});

afterEach(() => {
  mock.restore();
});

describe("SiteSettingsService", () => {
  it("returns defaults when nothing is saved", async () => {
    fakePrisma([]);

    const result = await SiteSettingsService.get();

    expect(result.id).toBeNull();
    expect(result.settings).toEqual(defaultSiteSettings);
  });

  it("reads contact details from existing Contact page content until settings are saved", async () => {
    fakePrisma([
      {
        id: "contact-1",
        slug: "contact",
        deletedAt: null,
        updatedAt: new Date(),
        body: {
          ...defaultContactPageContent,
          directContacts: {
            ...defaultContactPageContent.directContacts,
            phone: "+62 21-1111-2222",
            whatsapp: "+62 812-3333-4444",
          },
          address: { title: "Campus", name: "MWS", lines: ["Jl. Baru 1"] },
          map: { ...defaultContactPageContent.map, src: embedSrc },
        },
      },
    ]);

    const { settings } = await SiteSettingsService.get();

    expect(settings.contact.phone).toBe("+62 21-1111-2222");
    expect(settings.contact.whatsapp).toBe("+62 812-3333-4444");
    expect(settings.location).toEqual({
      name: "MWS",
      addressLines: ["Jl. Baru 1"],
      mapEmbedSrc: new URL(embedSrc).toString(),
    });
    expect(settings.social).toEqual(defaultSiteSettings.social);
  });

  it("saves one section and keeps the others", async () => {
    const { rows, upsert } = fakePrisma([]);

    const result = await SiteSettingsService.updateGroup(
      "social",
      { ...defaultSiteSettings.social, instagram: "https://instagram.com/mws" },
      "user-1",
    );

    expect(upsert).toHaveBeenCalledTimes(1);
    expect(result.settings.social.instagram).toBe("https://instagram.com/mws");
    expect(result.settings.contact).toEqual(defaultSiteSettings.contact);
    expect((rows[0]?.body as typeof defaultSiteSettings).officeHours).toEqual(
      defaultSiteSettings.officeHours,
    );
  });

  it("accepts the iframe code copied from Google Maps", async () => {
    fakePrisma([]);

    const result = await SiteSettingsService.updateGroup(
      "location",
      {
        ...defaultSiteSettings.location,
        mapEmbedSrc: `<iframe src="${embedSrc}" width="600"></iframe>`,
      },
      null,
    );

    expect(result.settings.location.mapEmbedSrc).toBe(new URL(embedSrc).toString());
  });

  it("rejects maps that cannot be embedded", async () => {
    fakePrisma([]);

    await expectResponseError(
      SiteSettingsService.updateGroup(
        "location",
        { ...defaultSiteSettings.location, mapEmbedSrc: "https://maps.app.goo.gl/abc" },
        null,
      ),
      400,
      "Google Maps embed",
    );
  });

  it("rejects social links that are not https", async () => {
    fakePrisma([]);

    await expectResponseError(
      SiteSettingsService.updateGroup(
        "social",
        { ...defaultSiteSettings.social, facebook: "facebook.com/mws" },
        null,
      ),
      400,
      "facebook",
    );
  });

  it("rejects unknown sections", async () => {
    fakePrisma([]);

    await expectResponseError(SiteSettingsService.updateGroup("seo", {}, null), 404, "Unknown");
  });
});

describe("ContactPageService with site settings", () => {
  it("shows phone, address, hours and map from site settings", async () => {
    fakePrisma([
      {
        id: "contact-1",
        slug: "contact",
        deletedAt: null,
        updatedAt: new Date(),
        body: { ...defaultContactPageContent, intro: "Custom intro" },
      },
      {
        id: "settings-1",
        slug: "site-settings",
        deletedAt: null,
        updatedAt: new Date(),
        body: {
          ...defaultSiteSettings,
          contact: { phone: "+62 1", whatsapp: "+62 812-9999-0000", email: "hello@mws.test" },
          officeHours: { items: [{ title: "Daily", text: "08:00 - 16:00" }] },
        },
      },
    ]);
    const page = await ContactPageService.getAdmin();

    expect(page.content.intro).toBe("Custom intro");
    expect(page.content.directContacts.whatsapp).toBe("+62 812-9999-0000");
    expect(page.content.directContacts.email).toBe("hello@mws.test");
    expect(page.content.directContacts.title).toBe(defaultContactPageContent.directContacts.title);
    expect(page.content.officeHours.items).toEqual([{ title: "Daily", text: "08:00 - 16:00" }]);
  });
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

describe("site settings routes", () => {
  it("serves settings publicly", async () => {
    spyOn(SiteSettingsService, "getSettings").mockResolvedValue(defaultSiteSettings);

    const res = await buildApp().request("/api/site-settings");

    expect(res.status).toBe(200);
    expect(((await res.json()) as { data: unknown }).data).toEqual(defaultSiteSettings);
  });

  it("requires a CMS session to update settings", async () => {
    const res = await buildApp().request("/admin/site-settings/contact", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(defaultSiteSettings.contact),
    });

    expect(res.status).toBe(401);
  });

  it("updates one section for content editors", async () => {
    const update = spyOn(SiteSettingsService, "updateGroup").mockResolvedValue({
      id: "settings-1",
      updatedAt: new Date(),
      settings: defaultSiteSettings,
    });

    const res = await buildApp().request("/admin/site-settings/contact", {
      method: "PUT",
      headers: { ...(await authHeaders()), "Content-Type": "application/json" },
      body: JSON.stringify(defaultSiteSettings.contact),
    });

    expect(res.status).toBe(200);
    expect(update).toHaveBeenCalledWith("contact", defaultSiteSettings.contact, "cms-user-1");
  });
});
