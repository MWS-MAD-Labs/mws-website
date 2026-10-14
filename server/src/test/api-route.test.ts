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
import * as googleCalendar from "../lib/google-calendar";
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

  it("returns public Google Calendar events", async () => {
    spyOn(googleCalendar, "listGoogleCalendarEvents").mockResolvedValue({
      configured: true,
      events: [
        {
          id: "event-1",
          title: "Parent Meeting",
          description: null,
          location: "Campus",
          start: "2026-03-01T02:00:00.000Z",
          end: "2026-03-01T03:00:00.000Z",
          startDate: "2026-03-01",
          endDate: null,
          eventTime: "09:00 - 10:00",
          type: "EVENT",
          allDay: false,
          url: null,
        },
      ],
      pagination: { pageSize: 25, nextPageToken: null },
      timeZone: "Asia/Jakarta",
    });

    const res = await buildApp().request(
      "/api/calendar/events?from=2026-01-01&to=2026-12-31&pageSize=25",
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      data: {
        configured: true,
        events: [
          {
            id: "event-1",
            title: "Parent Meeting",
            description: null,
            location: "Campus",
            start: "2026-03-01T02:00:00.000Z",
            end: "2026-03-01T03:00:00.000Z",
            startDate: "2026-03-01",
            endDate: null,
            eventTime: "09:00 - 10:00",
            type: "EVENT",
            allDay: false,
            url: null,
          },
        ],
        pagination: { pageSize: 25, nextPageToken: null },
        timeZone: "Asia/Jakarta",
      },
    });
    expect(googleCalendar.listGoogleCalendarEvents).toHaveBeenCalledWith({
      from: "2026-01-01",
      to: "2026-12-31",
      pageSize: "25",
    });
  });

  it("returns 400 for an invalid public Google Calendar range", async () => {
    const res = await buildApp().request("/api/calendar/events?from=2026-12-31&to=2026-01-01");

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ errors: "Invalid calendar query." });
  });
});
