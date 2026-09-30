import { z } from "zod";
import { ResponseError } from "../error/response-error";
import { getPrisma } from "../lib/prisma";

/**
 * First-party traffic analytics for the CMS dashboard.
 *
 * Privacy: no IP address, cookie or user agent is stored. The public site sends
 * a random `sessionId` kept in sessionStorage, so "visits" means browsing
 * sessions, not unique people.
 */

const TIME_ZONE = "Asia/Jakarta";
export const ANALYTICS_RANGES = [7, 30, 90] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

const BOT_PATTERN =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|pingdom|monitor|curl|wget|python-requests|axios|node-fetch/i;

const pageViewSchema = z.object({
  path: z.string().trim().min(1).max(2000),
  sessionId: z.string().regex(/^[A-Za-z0-9-]{8,64}$/),
  referrer: z.string().trim().max(2000).optional().nullable(),
});

export type PageViewInput = z.infer<typeof pageViewSchema>;

export function isBotUserAgent(userAgent: string | null | undefined) {
  return !userAgent || BOT_PATTERN.test(userAgent);
}

export function deviceTypeOf(userAgent: string | null | undefined) {
  const ua = userAgent ?? "";
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return "tablet";
  if (/Mobi|iPhone|iPod|Android|Windows Phone/i.test(ua)) return "mobile";
  return "desktop";
}

/** Public page path without query string, hash or trailing slash. Null for CMS/API paths. */
export function normalizePath(rawPath: string) {
  const path = rawPath.split(/[?#]/)[0]!.replace(/\/+$/, "") || "/";
  if (!path.startsWith("/") || path.length > 500) return null;
  if (/^\/(admin|auth|api)(\/|$)/.test(path)) return null;
  return path;
}

/** Referring site, or null for direct visits and navigation within this site. */
export function referrerHostOf(referrer: string | null | undefined, ownHost: string | null) {
  if (!referrer) return null;

  try {
    // l.instagram.com, lm.facebook.com, m.facebook.com are link redirectors of
    // the same site, so they are grouped under the plain domain.
    const host = new URL(referrer).hostname.replace(/^(www|m|l|lm)\./, "").toLowerCase();
    if (!host || (ownHost && host === ownHost.replace(/^www\./, "").toLowerCase())) {
      return null;
    }
    return host.slice(0, 255);
  } catch {
    return null;
  }
}

function frontendHost() {
  try {
    return new URL(process.env.FRONTEND_ORIGIN ?? "").hostname;
  } catch {
    return null;
  }
}

// A reload or double-mounted effect should not count twice.
const DUPLICATE_WINDOW_MS = 10_000;
const recentViews = new Map<string, number>();

function isDuplicate(sessionId: string, path: string, now: number) {
  const last = recentViews.get(`${sessionId}:${path}`);
  return last !== undefined && now - last < DUPLICATE_WINDOW_MS;
}

function rememberView(sessionId: string, path: string, now: number) {
  recentViews.set(`${sessionId}:${path}`, now);

  if (recentViews.size > 5_000) {
    for (const [entry, time] of recentViews) {
      if (now - time > DUPLICATE_WINDOW_MS) recentViews.delete(entry);
    }
  }
}

export function resetAnalyticsDedupeForTest() {
  recentViews.clear();
}

export function parseRange(raw: string | undefined): AnalyticsRange {
  const days = Number(raw ?? 30);
  return (ANALYTICS_RANGES as readonly number[]).includes(days)
    ? (days as AnalyticsRange)
    : 30;
}

/** Calendar days (YYYY-MM-DD in Asia/Jakarta) ending today, oldest first. */
export function rangeDays(days: number, now = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return Array.from({ length: days }, (_, index) =>
    formatter.format(new Date(now.getTime() - (days - 1 - index) * 86_400_000)),
  );
}

/** Start of the first day in the range, as a UTC instant. */
function rangeStart(days: number, now = new Date()) {
  const firstDay = rangeDays(days, now)[0]!;
  return new Date(`${firstDay}T00:00:00+07:00`);
}

type DailyRow = { day: string; views: bigint; visits: bigint };

export function fillDailySeries(days: string[], rows: DailyRow[]) {
  const byDay = new Map(rows.map((row) => [row.day, row]));
  return days.map((day) => ({
    date: day,
    views: Number(byDay.get(day)?.views ?? 0),
    visits: Number(byDay.get(day)?.visits ?? 0),
  }));
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

export class AnalyticsService {
  /** Returns true when the view was stored. */
  static async recordPageView(payload: unknown, userAgent: string | null | undefined) {
    const parsed = pageViewSchema.safeParse(payload);
    if (!parsed.success) throw new ResponseError(400, "Invalid page view.");
    if (isBotUserAgent(userAgent)) return false;

    const path = normalizePath(parsed.data.path);
    if (!path) return false;

    const now = Date.now();
    if (isDuplicate(parsed.data.sessionId, path, now)) return false;

    await getPrisma().pageView.create({
      data: {
        path,
        sessionId: parsed.data.sessionId,
        referrerHost: referrerHostOf(parsed.data.referrer, frontendHost()),
        deviceType: deviceTypeOf(userAgent),
      },
    });
    rememberView(parsed.data.sessionId, path, now);

    return true;
  }

  static async overview(days: AnalyticsRange, now = new Date()) {
    const prisma = getPrisma();
    const since = rangeStart(days, now);
    const previousSince = new Date(since.getTime() - days * 86_400_000);
    const activeSince = new Date(now.getTime() - 30 * 60_000);

    const [daily, totals, previous, topPages, referrers, devices, active] = await Promise.all([
      prisma.$queryRaw<DailyRow[]>`
        SELECT to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${TIME_ZONE}, 'YYYY-MM-DD') AS day,
               COUNT(*) AS views,
               COUNT(DISTINCT "sessionId") AS visits
        FROM "PageView"
        WHERE "createdAt" >= ${since}
        GROUP BY day`,
      prisma.$queryRaw<{ views: bigint; visits: bigint }[]>`
        SELECT COUNT(*) AS views, COUNT(DISTINCT "sessionId") AS visits
        FROM "PageView" WHERE "createdAt" >= ${since}`,
      prisma.$queryRaw<{ views: bigint; visits: bigint }[]>`
        SELECT COUNT(*) AS views, COUNT(DISTINCT "sessionId") AS visits
        FROM "PageView" WHERE "createdAt" >= ${previousSince} AND "createdAt" < ${since}`,
      prisma.$queryRaw<{ path: string; views: bigint; visits: bigint }[]>`
        SELECT path, COUNT(*) AS views, COUNT(DISTINCT "sessionId") AS visits
        FROM "PageView" WHERE "createdAt" >= ${since}
        GROUP BY path ORDER BY views DESC LIMIT 8`,
      prisma.$queryRaw<{ host: string | null; visits: bigint }[]>`
        SELECT "referrerHost" AS host, COUNT(DISTINCT "sessionId") AS visits
        FROM "PageView" WHERE "createdAt" >= ${since}
        GROUP BY "referrerHost" ORDER BY visits DESC LIMIT 6`,
      prisma.$queryRaw<{ device: string; visits: bigint }[]>`
        SELECT "deviceType" AS device, COUNT(DISTINCT "sessionId") AS visits
        FROM "PageView" WHERE "createdAt" >= ${since}
        GROUP BY "deviceType" ORDER BY visits DESC`,
      prisma.$queryRaw<{ visits: bigint }[]>`
        SELECT COUNT(DISTINCT "sessionId") AS visits
        FROM "PageView" WHERE "createdAt" >= ${activeSince}`,
    ]);

    const views = Number(totals[0]?.views ?? 0);
    const visits = Number(totals[0]?.visits ?? 0);
    const previousViews = Number(previous[0]?.views ?? 0);
    const previousVisits = Number(previous[0]?.visits ?? 0);

    return {
      range: days,
      totals: {
        views,
        visits,
        pagesPerVisit: visits ? Math.round((views / visits) * 10) / 10 : 0,
        activeNow: Number(active[0]?.visits ?? 0),
      },
      change: {
        views: percentChange(views, previousViews),
        visits: percentChange(visits, previousVisits),
      },
      daily: fillDailySeries(rangeDays(days, now), daily),
      topPages: topPages.map((row) => ({
        path: row.path,
        views: Number(row.views),
        visits: Number(row.visits),
      })),
      referrers: referrers.map((row) => ({
        source: row.host ?? "Direct / internal",
        visits: Number(row.visits),
      })),
      devices: devices.map((row) => ({
        device: row.device,
        visits: Number(row.visits),
      })),
    };
  }
}
