import { apiRequest } from "@/lib/api";

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
    return response?.data ?? { configured: false, events: [] };
  },

  async academicEvents(signal?: AbortSignal): Promise<AcademicCalendarEvent[]> {
    const response = await apiRequest<{ data: AcademicCalendarEvent[] }>(
      '/api/calendar/academic-events',
      { signal },
    );
    return response?.data ?? [];
  },
};
