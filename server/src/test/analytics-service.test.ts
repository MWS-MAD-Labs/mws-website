import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import * as prismaModule from "../lib/prisma";
import {
  AnalyticsService,
  deviceTypeOf,
  fillDailySeries,
  isBotUserAgent,
  normalizePath,
  parseRange,
  rangeDays,
  referrerHostOf,
  resetAnalyticsDedupeForTest,
} from "../services/analytics-service";

const CHROME = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/140 Safari/537.36";
const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1";

afterEach(() => {
  mock.restore();
  resetAnalyticsDedupeForTest();
});

describe("analytics helpers", () => {
  it("normalizes public paths and ignores CMS and API paths", () => {
    expect(normalizePath("/admission?utm=x#top")).toBe("/admission");
    expect(normalizePath("/news/")).toBe("/news");
    expect(normalizePath("/")).toBe("/");
    expect(normalizePath("/admin/news")).toBeNull();
    expect(normalizePath("/api/pages/home")).toBeNull();
    expect(normalizePath("https://evil.test/")).toBeNull();
  });

  it("classifies devices and bots", () => {
    expect(deviceTypeOf(CHROME)).toBe("desktop");
    expect(deviceTypeOf(IPHONE)).toBe("mobile");
    expect(deviceTypeOf("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)")).toBe("tablet");
    expect(isBotUserAgent("Googlebot/2.1")).toBe(true);
    expect(isBotUserAgent(undefined)).toBe(true);
    expect(isBotUserAgent(CHROME)).toBe(false);
  });

  it("keeps only external referrer hosts", () => {
    expect(referrerHostOf("https://www.google.com/search?q=x", "beta.millenniaws.sch.id")).toBe("google.com");
    expect(referrerHostOf("https://l.instagram.com/?u=x", null)).toBe("instagram.com");
    expect(referrerHostOf("https://lm.facebook.com/l.php", null)).toBe("facebook.com");
    expect(referrerHostOf("https://beta.millenniaws.sch.id/news", "beta.millenniaws.sch.id")).toBeNull();
    expect(referrerHostOf("not a url", null)).toBeNull();
    expect(referrerHostOf(null, null)).toBeNull();
  });

  it("builds Jakarta calendar days and fills missing days with zero", () => {
    // 2026-09-30 20:00 UTC is already 2026-10-01 in Jakarta (UTC+7).
    const days = rangeDays(3, new Date("2026-09-30T20:00:00Z"));
    expect(days).toEqual(["2026-09-29", "2026-09-30", "2026-10-01"]);

    expect(fillDailySeries(days, [{ day: "2026-09-30", views: 5n, visits: 2n }])).toEqual([
      { date: "2026-09-29", views: 0, visits: 0 },
      { date: "2026-09-30", views: 5, visits: 2 },
      { date: "2026-10-01", views: 0, visits: 0 },
    ]);
  });

  it("only accepts the supported ranges", () => {
    expect(parseRange("7")).toBe(7);
    expect(parseRange("90")).toBe(90);
    expect(parseRange("365")).toBe(30);
    expect(parseRange(undefined)).toBe(30);
  });
});

describe("AnalyticsService.recordPageView", () => {
  function mockPrisma() {
    const create = mock(async () => ({}));
    spyOn(prismaModule, "getPrisma").mockReturnValue({
      pageView: { create },
    } as unknown as ReturnType<typeof prismaModule.getPrisma>);
    return create;
  }

  it("stores a view once per session and path within the reload window", async () => {
    const create = mockPrisma();
    const view = { path: "/admission", sessionId: "session-0001", referrer: null };

    expect(await AnalyticsService.recordPageView(view, CHROME)).toBe(true);
    expect(await AnalyticsService.recordPageView(view, CHROME)).toBe(false);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      data: {
        path: "/admission",
        sessionId: "session-0001",
        referrerHost: null,
        deviceType: "desktop",
      },
    });
  });

  it("skips bots and CMS paths without writing", async () => {
    const create = mockPrisma();

    expect(await AnalyticsService.recordPageView({ path: "/", sessionId: "session-0002" }, "Googlebot")).toBe(false);
    expect(await AnalyticsService.recordPageView({ path: "/admin", sessionId: "session-0002" }, CHROME)).toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects malformed payloads", async () => {
    mockPrisma();
    await expect(
      AnalyticsService.recordPageView({ path: "/", sessionId: "x" }, CHROME),
    ).rejects.toThrow("Invalid page view.");
  });
});
