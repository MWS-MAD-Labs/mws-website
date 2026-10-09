import { google } from 'googleapis';
import {
  createServiceAccountClient,
  serviceAccountCredentials,
} from './google-service-account';

const CALENDAR_READONLY_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';

export type GoogleCalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start: string;
  end: string;
  allDay: boolean;
  url: string | null;
};

export type GoogleCalendarEventsResult = {
  configured: boolean;
  events: GoogleCalendarEvent[];
};

function eventFromGoogle(
  event: { id?: string | null; summary?: string | null; description?: string | null; location?: string | null; htmlLink?: string | null; start?: { date?: string | null; dateTime?: string | null } | null; end?: { date?: string | null; dateTime?: string | null } | null },
): GoogleCalendarEvent | null {
  const start = event.start?.dateTime ?? event.start?.date;
  const end = event.end?.dateTime ?? event.end?.date;

  if (!event.id || !start || !end) return null;

  return {
    id: event.id,
    title: event.summary?.trim() || 'Untitled event',
    description: event.description?.trim() || null,
    location: event.location?.trim() || null,
    start,
    end,
    allDay: Boolean(event.start?.date),
    url: event.htmlLink ?? null,
  };
}

export async function listUpcomingGoogleCalendarEvents(
  limit = 2,
): Promise<GoogleCalendarEventsResult> {
  const credentials = serviceAccountCredentials();
  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim();

  if (!credentials || !calendarId) {
    return { configured: false, events: [] };
  }

  const maxResults = Math.min(Math.max(Math.trunc(limit) || 2, 1), 10);
  const subject = process.env.GOOGLE_CALENDAR_SUBJECT?.trim() || undefined;
  const auth = createServiceAccountClient(credentials, {
    scopes: [CALENDAR_READONLY_SCOPE],
    subject,
  });
  const calendar = google.calendar({ version: 'v3', auth });
  const response = await calendar.events.list({
    calendarId,
    timeMin: new Date().toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return {
    configured: true,
    events: (response.data.items ?? [])
      .filter((event) => event.status !== 'cancelled')
      .map(eventFromGoogle)
      .filter((event): event is GoogleCalendarEvent => Boolean(event)),
  };
}
