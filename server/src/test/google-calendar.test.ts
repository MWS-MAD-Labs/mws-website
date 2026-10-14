import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import { ResponseError } from "../error/response-error";
import {
  listGoogleCalendarEvents,
  resetGoogleCalendarCacheForTest,
} from "../lib/google-calendar";

const ENV_KEYS = ["GOOGLE_CALENDAR_ID", "GOOGLE_CALENDAR_API_KEY"];
const originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

beforeEach(() => {
  for (const key of ENV_KEYS) delete process.env[key];
  resetGoogleCalendarCacheForTest();
});

afterEach(() => {
  mock.restore();
  resetGoogleCalendarCacheForTest();
  for (const key of ENV_KEYS) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

function configureCalendar() {
  process.env.GOOGLE_CALENDAR_ID = "school@example.com";
  process.env.GOOGLE_CALENDAR_API_KEY = "api-key";
}

describe("listGoogleCalendarEvents", () => {
  it("returns an empty unconfigured result when the calendar env is missing", async () => {
    const fetch = spyOn(globalThis, "fetch");

    await expect(listGoogleCalendarEvents({ pageSize: 25 })).resolves.toEqual({
      configured: false,
      events: [],
      pagination: { pageSize: 25, nextPageToken: null },
      timeZone: "Asia/Jakarta",
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("validates date ranges before calling Google", async () => {
    configureCalendar();
    const fetch = spyOn(globalThis, "fetch");

    await expect(
      listGoogleCalendarEvents({ from: "2026-12-31", to: "2026-01-01" }),
    ).rejects.toMatchObject({
      status: 400,
      message: "Invalid calendar query.",
    } satisfies Partial<ResponseError>);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("fetches a page from Google Calendar and normalizes Jakarta event fields", async () => {
    configureCalendar();
    const fetch = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          nextPageToken: "next-page",
          items: [
            {
              id: "holiday-1",
              summary: "School Holiday",
              description: "Mid-term break",
              location: "Campus",
              htmlLink: "https://calendar.google.com/event?eid=holiday-1",
              start: { date: "2026-02-03" },
              end: { date: "2026-02-05" },
            },
            {
              id: "event-1",
              summary: "Parent Meeting",
              start: { dateTime: "2026-03-01T02:00:00.000Z" },
              end: { dateTime: "2026-03-01T03:30:00.000Z" },
            },
            {
              id: "cancelled-1",
              summary: "Cancelled Event",
              status: "cancelled",
              start: { date: "2026-04-01" },
              end: { date: "2026-04-02" },
            },
          ],
        }),
      ),
    );

    const result = await listGoogleCalendarEvents({
      from: "2026-01-01",
      to: "2026-12-31",
      pageSize: 2,
      pageToken: "current-page",
    });

    const requestedUrl = new URL(String(fetch.mock.calls[0]?.[0]));
    expect(requestedUrl.pathname).toContain(encodeURIComponent("school@example.com"));
    expect(requestedUrl.searchParams.get("key")).toBe("api-key");
    expect(requestedUrl.searchParams.get("timeMin")).toBe("2026-01-01T00:00:00+07:00");
    expect(requestedUrl.searchParams.get("timeMax")).toBe("2027-01-01T00:00:00+07:00");
    expect(requestedUrl.searchParams.get("maxResults")).toBe("2");
    expect(requestedUrl.searchParams.get("pageToken")).toBe("current-page");
    expect(requestedUrl.searchParams.get("timeZone")).toBe("Asia/Jakarta");

    expect(result).toMatchObject({
      configured: true,
      pagination: { pageSize: 2, nextPageToken: "next-page" },
      timeZone: "Asia/Jakarta",
      events: [
        {
          id: "holiday-1",
          title: "School Holiday",
          description: "Mid-term break",
          location: "Campus",
          startDate: "2026-02-03",
          endDate: "2026-02-04",
          eventTime: null,
          type: "HOLIDAY",
          allDay: true,
          url: "https://calendar.google.com/event?eid=holiday-1",
        },
        {
          id: "event-1",
          title: "Parent Meeting",
          startDate: "2026-03-01",
          endDate: null,
          eventTime: "09:00 - 10:30",
          type: "EVENT",
          allDay: false,
        },
      ],
    });
  });

  it("reports upstream Google Calendar failures as a gateway error", async () => {
    configureCalendar();
    spyOn(globalThis, "fetch").mockResolvedValue(new Response("Forbidden", { status: 403 }));

    await expect(listGoogleCalendarEvents()).rejects.toMatchObject({
      status: 502,
      message: "Calendar events could not be loaded.",
    } satisfies Partial<ResponseError>);
  });
});
