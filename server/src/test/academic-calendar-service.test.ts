import { afterEach, describe, expect, it } from "bun:test";
import { AcademicCalendarService } from "../services/academic-calendar-service";

const event = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Term 1 begins",
  description: "Welcome back.",
  type: "EVENT" as const,
  startDate: new Date("2026-07-14T00:00:00.000Z"),
  endDate: null,
  eventTime: "07:30",
  location: "Main campus",
  isActive: true,
  sortOrder: 0,
  createdAt: new Date("2026-06-01T00:00:00.000Z"),
  updatedAt: new Date("2026-06-01T00:00:00.000Z"),
};

afterEach(() => {
  delete globalThis.__mwsWebsitePrisma;
});

describe("AcademicCalendarService", () => {
  it("maps active public events to calendar data", async () => {
    globalThis.__mwsWebsitePrisma = {
      academicCalendarEvent: {
        findMany: async () => [event],
      },
    } as never;

    await expect(AcademicCalendarService.listPublic()).resolves.toEqual([
      {
        id: event.id,
        title: event.title,
        description: event.description,
        type: event.type,
        startDate: "2026-07-14",
        endDate: null,
        eventTime: event.eventTime,
        location: event.location,
      },
    ]);
  });

  it("rejects an end date before the start date", async () => {
    await expect(
      AcademicCalendarService.create({
        title: "Invalid event",
        type: "EVENT",
        startDate: "2026-07-20",
        endDate: "2026-07-19",
        isActive: true,
        sortOrder: 0,
      }),
    ).rejects.toMatchObject({ status: 400 });
  });
});
