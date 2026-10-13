import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import type { AuditLogInput } from "../lib/audit-log";
import { sanitizeAuditValue } from "../lib/audit-log";
import { createAuditLogMiddleware } from "../middleware/audit-log-middleware";
import { cmsSessionUser } from "./test-helpers";
import type { SessionVariables } from "../types/hono-context";

const POST_ID = "8d0a6a1e-2f4b-4c3a-9a51-3c2f7a0b9e11";
const NEW_ID = "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed";

function buildApp() {
  const entries: AuditLogInput[] = [];
  const user = cmsSessionUser("ADMIN");
  const app = new Hono<{ Variables: SessionVariables }>();

  app.use("/admin/*", async (c, next) => {
    c.set("user", user);
    await next();
  });
  app.use("/admin/*", createAuditLogMiddleware(async (entry) => {
    entries.push(entry);
  }));

  app.post("/admin/news/posts", async (c) => {
    const body = await c.req.json<{ title: string }>();
    return c.json({ data: { id: NEW_ID, title: body.title } }, 201);
  });
  app.patch("/admin/news/posts/:id", async (c) => {
    await c.req.json();
    return c.json({ data: { id: c.req.param("id") } });
  });
  app.delete("/admin/news/posts/:id", (c) => c.body(null, 204));
  app.get("/admin/news/posts", (c) => c.json({ data: [] }));
  app.put("/admin/broken", (c) => c.json({ errors: "Invalid payload." }, 400));
  app.delete("/admin/contact-page", (c) => c.json({ data: { id: null } }));
  app.patch("/admin/users/:id/role", (c) => c.json({ data: {} }));
  app.post("/admin/galleries/:id/images", async (c) => {
    await c.req.parseBody();
    return c.json({ data: { id: NEW_ID } }, 201);
  });

  return { app, entries, user };
}

function json(method: string, body: unknown) {
  return {
    method,
    headers: { "content-type": "application/json", "user-agent": "bun-test", "cf-connecting-ip": "203.0.113.7" },
    body: JSON.stringify(body),
  };
}

describe("auditLogMiddleware", () => {
  it("logs a created record with its new id, the actor, and the request origin", async () => {
    const { app, entries, user } = buildApp();
    await app.request("/admin/news/posts", json("POST", { title: "Science Fair", status: "DRAFT" }));

    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      actorId: user.id,
      action: "NEWS_POST_CREATED",
      entityType: "NewsPost",
      entityId: NEW_ID,
      ipAddress: "203.0.113.7",
      userAgent: "bun-test",
      newValues: { label: "Science Fair", title: "Science Fair", status: "DRAFT" },
    });
  });

  it("names publishing, status toggles, and deletes", async () => {
    const { app, entries } = buildApp();
    await app.request(`/admin/news/posts/${POST_ID}`, json("PATCH", { status: "PUBLISHED" }));
    await app.request(`/admin/news/posts/${POST_ID}`, json("PATCH", { isActive: false }));
    await app.request(`/admin/news/posts/${POST_ID}`, { method: "DELETE" });

    expect(entries.map((entry) => entry.action)).toEqual([
      "NEWS_POST_PUBLISHED",
      "NEWS_POST_DEACTIVATED",
      "NEWS_POST_DELETED",
    ]);
    expect(entries.every((entry) => entry.entityId === POST_ID)).toBe(true);
  });

  it("logs a page reset without a record id", async () => {
    const { app, entries } = buildApp();
    await app.request("/admin/contact-page", { method: "DELETE" });

    expect(entries[0]).toMatchObject({ action: "CONTACT_PAGE_RESET", entityId: null });
  });

  it("records uploads by file name and size, not file content", async () => {
    const { app, entries } = buildApp();
    const form = new FormData();
    form.set("file", new File(["fake-image"], "campus.jpg", { type: "image/jpeg" }));
    form.set("title", "Campus");
    await app.request(`/admin/galleries/${POST_ID}/images`, { method: "POST", body: form });

    expect(entries[0]).toMatchObject({ action: "GALLERY_IMAGE_UPLOADED", entityId: NEW_ID });
    expect(sanitizeAuditValue(entries[0]?.newValues)).toMatchObject({
      label: "Campus",
      file: { fileName: "campus.jpg", size: 10, type: "image/jpeg" },
    });
  });

  it("skips reads, failed requests, and CMS user routes that log themselves", async () => {
    const { app, entries } = buildApp();
    await app.request("/admin/news/posts");
    await app.request("/admin/broken", json("PUT", { title: "x" }));
    await app.request(`/admin/users/${POST_ID}/role`, json("PATCH", { roleName: "ADMIN" }));

    expect(entries).toHaveLength(0);
  });
});

describe("sanitizeAuditValue", () => {
  it("redacts secrets and shortens long text", () => {
    const value = sanitizeAuditValue({ apiToken: "abc", body: "x".repeat(600) }) as Record<string, string>;

    expect(value.apiToken).toBe("[redacted]");
    expect(value.body?.length).toBe(501);
  });
});
