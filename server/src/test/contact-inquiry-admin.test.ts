import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import { Hono } from "hono";
import { ResponseError } from "../error/response-error";
import { ContactInquiryRepository } from "../repositories/contact-inquiry-repository";
import { adminContactInquiryRoute } from "../routes/admin/contact-inquiry-route";
import { ContactInquiryService } from "../services/contact-inquiry-service";
import type { CmsSessionUser } from "../types/cms-auth-types";
import type { SessionVariables } from "../types/hono-context";
import { cmsSessionUser } from "./test-helpers";

const inquiryId = "11111111-1111-4111-8111-111111111111";

function inquiry(overrides: Record<string, unknown> = {}) {
  return {
    id: inquiryId,
    name: "Parent",
    email: "parent@example.com",
    subject: "Admission question",
    category: "admission",
    message: "When does enrollment open?",
    status: "NEW",
    source: "contact-page",
    ipAddress: "127.0.0.1",
    userAgent: "bun-test",
    createdAt: new Date("2026-10-06T00:00:00.000Z"),
    updatedAt: new Date("2026-10-06T00:00:00.000Z"),
    ...overrides,
  };
}

function buildApp(user: CmsSessionUser = cmsSessionUser("ADMIN")) {
  const app = new Hono<{ Variables: SessionVariables }>();

  app.use("*", async (c, next) => {
    c.set("user", user);
    await next();
  });
  app.route("/contact-inquiries", adminContactInquiryRoute);
  app.onError((err, c) => {
    if (err instanceof ResponseError) {
      return c.json({ errors: err.message }, err.status as 400);
    }

    return c.json({ errors: "Internal server error" }, 500);
  });

  return app;
}

async function expectResponseError(
  promise: Promise<unknown>,
  status: number,
  message: string,
) {
  try {
    await promise;
    throw new Error("Expected ResponseError.");
  } catch (error) {
    expect(error).toBeInstanceOf(ResponseError);
    expect((error as ResponseError).status).toBe(status);
    expect((error as ResponseError).message).toBe(message);
  }
}

afterEach(() => {
  mock.restore();
});

describe("ContactInquiryService admin", () => {
  it("lists inquiries with pagination and status counts", async () => {
    const list = spyOn(ContactInquiryRepository, "list").mockResolvedValue({
      items: [inquiry()],
      total: 21,
    });
    const counts = spyOn(ContactInquiryRepository, "countByStatus").mockResolvedValue({
      NEW: 20,
      RESOLVED: 1,
    });

    const result = await ContactInquiryService.list({
      page: "2",
      pageSize: "10",
      status: "NEW",
      search: " parent ",
    });

    expect(list).toHaveBeenCalledWith({
      page: 2,
      pageSize: 10,
      status: "NEW",
      search: "parent",
    });
    expect(counts).toHaveBeenCalledWith("parent");
    expect(result.statusCounts).toEqual({ NEW: 20, RESOLVED: 1 });
    expect(result.pagination).toEqual({ page: 2, pageSize: 10, total: 21, totalPages: 3 });
  });

  it("rejects unknown status filters", async () => {
    const list = spyOn(ContactInquiryRepository, "list");

    await expectResponseError(
      ContactInquiryService.list({ status: "DELETED" }),
      400,
      "Invalid inquiry query.",
    );
    expect(list).not.toHaveBeenCalled();
  });

  it("returns 404 for a missing inquiry", async () => {
    spyOn(ContactInquiryRepository, "findById").mockResolvedValue(null);

    await expectResponseError(ContactInquiryService.get(inquiryId), 404, "Inquiry not found.");
  });

  it("updates the status of an existing inquiry", async () => {
    spyOn(ContactInquiryRepository, "findById").mockResolvedValue(inquiry());
    const update = spyOn(ContactInquiryRepository, "updateStatus").mockResolvedValue(
      inquiry({ status: "RESOLVED" }),
    );

    const result = await ContactInquiryService.updateStatus(inquiryId, { status: "RESOLVED" });

    expect(update).toHaveBeenCalledWith(inquiryId, "RESOLVED");
    expect(result.status).toBe("RESOLVED");
  });

  it("rejects invalid statuses before touching the database", async () => {
    const findById = spyOn(ContactInquiryRepository, "findById");

    await expectResponseError(
      ContactInquiryService.updateStatus(inquiryId, { status: "DONE" }),
      400,
      "Invalid inquiry status.",
    );
    expect(findById).not.toHaveBeenCalled();
  });
});

describe("adminContactInquiryRoute", () => {
  it("returns the list in the data envelope", async () => {
    spyOn(ContactInquiryService, "list").mockResolvedValue({
      items: [inquiry()],
      statusCounts: { NEW: 1 },
      pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    });

    const res = await buildApp().request("/contact-inquiries?page=1");
    const body = (await res.json()) as {
      data: { items: Array<{ createdAt: string }>; statusCounts: Record<string, number> };
    };

    expect(res.status).toBe(200);
    expect(body.data.items[0]?.createdAt).toBe("2026-10-06T00:00:00.000Z");
    expect(body.data.statusCounts).toEqual({ NEW: 1 });
  });

  it("returns JSON 400 for invalid ids", async () => {
    const res = await buildApp().request("/contact-inquiries/not-a-uuid");

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ errors: "Valid UUID inquiry id is required." });
  });

  it("returns JSON 400 for malformed status bodies", async () => {
    const update = spyOn(ContactInquiryService, "updateStatus");

    const res = await buildApp().request(`/contact-inquiries/${inquiryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ errors: "Invalid JSON body." });
    expect(update).not.toHaveBeenCalled();
  });

  it("requires the content:manage permission", async () => {
    const viewer = cmsSessionUser("ADMIN");
    viewer.role.permissions = ["dashboard:read"];

    const res = await buildApp(viewer).request("/contact-inquiries");

    expect(res.status).toBe(403);
  });
});
