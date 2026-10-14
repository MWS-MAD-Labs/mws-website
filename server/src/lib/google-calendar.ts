import { z } from "zod";
import { ResponseError } from "../error/response-error";

const CALENDAR_CACHE_TTL_MS = 5 * 60 * 1000;
const GOOGLE_CALENDAR_EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars";
const JAKARTA_TIME_ZONE = "Asia/Jakarta";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const calendarEventsQuerySchema = z
  .object({
    from: dateSchema.optional(),
    to: dateSchema.optional(),
    pageSize: z.coerce.number().int().min(1).max(250).optional(),
    pageToken: z.string().trim().min(1).max(512).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
  })
  .superRefine((value, context) => {
    if (value.from && value.to && value.from > value.to) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["to"],
        message: "to must be on or after from.",
      });
    }
  });

export type GoogleCalendarEventType = "EVENT" | "HOLIDAY";

export type GoogleCalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start: string;
  end: string;
  startDate: string;
  endDate: string | null;
  eventTime: string | null;
  type: GoogleCalendarEventType;
  allDay: boolean;
  url: string | null;
};

export type GoogleCalendarEventsQuery = z.input<typeof calendarEventsQuerySchema>;

export type GoogleCalendarEventsResult = {
  configured: boolean;
  events: GoogleCalendarEvent[];
  pagination: {
    pageSize: number;
    nextPageToken: string | null;
  };
  timeZone: typeof JAKARTA_TIME_ZONE;
};

type GoogleCalendarApiEvent = {
  id?: string | null;
  summary?: string | null;
  description?: string | null;
  location?: string | null;
  htmlLink?: string | null;
  eventType?: string | null;
  status?: string | null;
  start?: { date?: string | null; dateTime?: string | null } | null;
  end?: { date?: string | null; dateTime?: string | null } | null;
};

type GoogleCalendarApiResponse = {
  items?: GoogleCalendarApiEvent[];
  nextPageToken?: string | null;
};

const calendarEventsCache = new Map<
  string,
  { expiresAt: number; result: GoogleCalendarEventsResult }
>();

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  timeZone: JAKARTA_TIME_ZONE,
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  timeZone: JAKARTA_TIME_ZONE,
});

function emptyResult(pageSize: number): GoogleCalendarEventsResult {
  return {
    configured: false,
    events: [],
    pagination: { pageSize, nextPageToken: null },
    timeZone: JAKARTA_TIME_ZONE,
  };
}

function readConfig() {
  return {
    apiKey: process.env["GOOGLE_CALENDAR_API_KEY"]?.trim() || "",
    calendarId: process.env["GOOGLE_CALENDAR_ID"]?.trim() || "",
  };
}

function parseQuery(rawQuery: GoogleCalendarEventsQuery = {}) {
  const parsed = calendarEventsQuerySchema.safeParse(rawQuery);
  if (!parsed.success) {
    throw new ResponseError(400, "Invalid calendar query.");
  }

  const pageSize = parsed.data.pageSize ?? parsed.data.limit ?? 50;
  const from = parsed.data.from;
  const to = parsed.data.to;

  return {
    from,
    to,
    pageSize,
    pageToken: parsed.data.pageToken,
  };
}

function todayInJakarta() {
  return formatJakartaDate(new Date().toISOString());
}

function addDays(date: string, days: number) {
  const parts = date.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function timeMinForDate(date: string) {
  return `${date}T00:00:00+07:00`;
}

function timeMaxAfterDate(date: string) {
  return `${addDays(date, 1)}T00:00:00+07:00`;
}

function formatJakartaDate(value: string) {
  const parts = Object.fromEntries(
    dateFormatter.formatToParts(new Date(value)).map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function formatJakartaTime(value: string) {
  return timeFormatter.format(new Date(value));
}

function cleanText(value: string | null | undefined) {
  return value?.trim() || null;
}

function inferEventType(event: GoogleCalendarApiEvent): GoogleCalendarEventType {
  const text = `${event.summary ?? ""} ${event.description ?? ""}`.toLowerCase();
  if (
    event.eventType === "outOfOffice" ||
    text.includes("holiday") ||
    text.includes("libur")
  ) {
    return "HOLIDAY";
  }
  return "EVENT";
}

function eventTime(start: string, end: string, startDate: string, endDate: string) {
  const startTime = formatJakartaTime(start);
  const endTime = formatJakartaTime(end);
  if (startDate !== endDate || startTime === endTime) return startTime;
  return `${startTime} - ${endTime}`;
}

function eventFromGoogle(event: GoogleCalendarApiEvent): GoogleCalendarEvent | null {
  const start = event.start?.dateTime ?? event.start?.date;
  const end = event.end?.dateTime ?? event.end?.date;

  if (!event.id || !start || !end) return null;

  const allDay = Boolean(event.start?.date);
  const startDate = allDay ? start : formatJakartaDate(start);
  const rawEndDate = allDay ? addDays(end, -1) : formatJakartaDate(end);
  const normalizedEndDate = rawEndDate < startDate ? startDate : rawEndDate;
  const multiDay = normalizedEndDate !== startDate;

  return {
    id: event.id,
    title: cleanText(event.summary) || "Untitled event",
    description: cleanText(event.description),
    location: cleanText(event.location),
    start,
    end,
    startDate,
    endDate: multiDay ? normalizedEndDate : null,
    eventTime: allDay ? null : eventTime(start, end, startDate, normalizedEndDate),
    type: inferEventType(event),
    allDay,
    url: cleanText(event.htmlLink),
  };
}

function buildGoogleCalendarUrl(
  config: { apiKey: string; calendarId: string },
  query: ReturnType<typeof parseQuery>,
) {
  const url = new URL(
    `${GOOGLE_CALENDAR_EVENTS_URL}/${encodeURIComponent(config.calendarId)}/events`,
  );
  url.searchParams.set("key", config.apiKey);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("timeZone", JAKARTA_TIME_ZONE);
  url.searchParams.set("maxResults", String(query.pageSize));
  url.searchParams.set("timeMin", timeMinForDate(query.from ?? todayInJakarta()));
  if (query.to) url.searchParams.set("timeMax", timeMaxAfterDate(query.to));
  if (query.pageToken) url.searchParams.set("pageToken", query.pageToken);
  return url;
}

export function resetGoogleCalendarCacheForTest() {
  calendarEventsCache.clear();
}

export async function listGoogleCalendarEvents(
  rawQuery: GoogleCalendarEventsQuery = {},
): Promise<GoogleCalendarEventsResult> {
  const query = parseQuery(rawQuery);
  const config = readConfig();

  if (!config.apiKey || !config.calendarId) {
    return emptyResult(query.pageSize);
  }

  const cacheKey = JSON.stringify({ calendarId: config.calendarId, query });
  const cached = calendarEventsCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  let response: Response;
  try {
    response = await fetch(buildGoogleCalendarUrl(config, query));
  } catch {
    throw new ResponseError(502, "Calendar events could not be loaded.");
  }

  if (!response.ok) {
    throw new ResponseError(502, "Calendar events could not be loaded.");
  }

  const payload = (await response.json()) as GoogleCalendarApiResponse;
  const result: GoogleCalendarEventsResult = {
    configured: true,
    events: (payload.items ?? [])
      .filter((event) => event.status !== "cancelled")
      .map(eventFromGoogle)
      .filter((event): event is GoogleCalendarEvent => Boolean(event)),
    pagination: {
      pageSize: query.pageSize,
      nextPageToken: payload.nextPageToken ?? null,
    },
    timeZone: JAKARTA_TIME_ZONE,
  };

  calendarEventsCache.set(cacheKey, {
    expiresAt: Date.now() + CALENDAR_CACHE_TTL_MS,
    result,
  });

  return result;
}

export async function listUpcomingGoogleCalendarEvents(
  limit = 2,
): Promise<GoogleCalendarEventsResult> {
  return listGoogleCalendarEvents({ limit });
}
