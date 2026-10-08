import { apiRequest } from "@/lib/api";

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
  async academicEvents(signal?: AbortSignal): Promise<AcademicCalendarEvent[]> {
    const response = await apiRequest<{ data: AcademicCalendarEvent[] }>(
      '/api/calendar/academic-events',
      { signal },
    );
    return response?.data ?? [];
  },
};
