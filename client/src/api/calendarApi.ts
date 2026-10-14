import { apiRequest } from "@/lib/api";

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
  type: 'EVENT' | 'HOLIDAY';
  allDay: boolean;
  url: string | null;
};

export type GoogleCalendarEventsResult = {
  configured: boolean;
  events: GoogleCalendarEvent[];
  pagination: {
    pageSize: number;
    nextPageToken: string | null;
  };
  timeZone: 'Asia/Jakarta';
};

export type GoogleCalendarEventFilters = {
  from?: string;
  to?: string;
  pageSize?: number;
  pageToken?: string;
};

export type AcademicCalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  type: 'EVENT' | 'HOLIDAY';
  startDate: string;
  endDate: string | null;
  eventTime: string | null;
  location: string | null;
};

export const calendarApi = {
  async upcomingEvents(
    limit = 2,
    signal?: AbortSignal,
  ): Promise<GoogleCalendarEventsResult> {
    const response = await apiRequest<{ data: GoogleCalendarEventsResult }>(
      `/api/calendar/events?limit=${limit}`,
      { signal },
    );
    return response?.data ?? emptyGoogleCalendarEvents(limit);
  },

  async events(
    filters: GoogleCalendarEventFilters = {},
    signal?: AbortSignal,
  ): Promise<GoogleCalendarEventsResult> {
    const params = new URLSearchParams();
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
    if (filters.pageToken) params.set('pageToken', filters.pageToken);

    const suffix = params.toString() ? `?${params.toString()}` : '';
    const response = await apiRequest<{ data: GoogleCalendarEventsResult }>(
      `/api/calendar/events${suffix}`,
      { signal },
    );
    return response?.data ?? emptyGoogleCalendarEvents(filters.pageSize);
  },

  async academicEvents(signal?: AbortSignal): Promise<AcademicCalendarEvent[]> {
    const response = await apiRequest<{ data: AcademicCalendarEvent[] }>(
      '/api/calendar/academic-events',
      { signal },
    );
    return response?.data ?? [];
  },
};

function emptyGoogleCalendarEvents(pageSize = 50): GoogleCalendarEventsResult {
  return {
    configured: false,
    events: [],
    pagination: { pageSize, nextPageToken: null },
    timeZone: 'Asia/Jakarta',
  };
}
