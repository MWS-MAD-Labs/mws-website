import { z } from "zod";
import { ResponseError } from "../error/response-error";
import { getPrisma } from "../lib/prisma";

const EVENT_TYPES = ["EVENT", "HOLIDAY"] as const;
const uuidSchema = z.string().uuid();
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.");

const eventFieldsSchema = z.strictObject({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).nullable().optional(),
  type: z.enum(EVENT_TYPES).default("EVENT"),
  startDate: dateSchema,
  endDate: dateSchema.nullable().optional(),
  eventTime: z.string().trim().max(100).nullable().optional(),
  location: z.string().trim().max(255).nullable().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

const eventSchema = eventFieldsSchema.superRefine((value, context) => {
  if (value.endDate && value.endDate < value.startDate) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endDate"],
      message: "End date cannot be before start date.",
    });
  }
});

const updateSchema = eventFieldsSchema.partial().superRefine((value, context) => {
  if (value.startDate && value.endDate && value.endDate < value.startDate) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endDate"],
      message: "End date cannot be before start date.",
    });
  }
});

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  type: z.enum(EVENT_TYPES).optional(),
  isActive: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
});

const publicSchema = z.object({
  from: dateSchema.optional(),
  to: dateSchema.optional(),
});

function dateValue(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function dateString(value: Date | string | null) {
  if (!value) return null;
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

function nullable(value: string | null | undefined) {
  return value?.trim() || null;
}

function requireId(id: string | undefined) {
  if (!id || !uuidSchema.safeParse(id).success) {
    throw new ResponseError(400, "Valid UUID calendar event id is required.");
  }
  return id;
}

function handleDatabaseError(error: unknown): never {
  const code = (error as { code?: string }).code;
  if (code === "P2025") throw new ResponseError(404, "Calendar event not found.");
  if (code === "P2002") throw new ResponseError(409, "A calendar event with the same value already exists.");
  throw error;
}

function eventResponse(event: {
  id: string;
  title: string;
  description: string | null;
  type: "EVENT" | "HOLIDAY";
  startDate: Date;
  endDate: Date | null;
  eventTime: string | null;
  location: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...event,
    startDate: dateString(event.startDate),
    endDate: dateString(event.endDate),
  };
}

export class AcademicCalendarService {
  static async list(rawQuery: Record<string, string | undefined> = {}) {
    const parsed = listSchema.safeParse(rawQuery);
    if (!parsed.success) throw new ResponseError(400, "Invalid calendar list query.");

    const { page, pageSize, search, type, isActive } = parsed.data;
    const where = {
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
              { location: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(type ? { type } : {}),
      ...(isActive === undefined ? {} : { isActive }),
    };

    const prisma = getPrisma();
    try {
      const [items, total] = await Promise.all([
        prisma.academicCalendarEvent.findMany({
          where,
          orderBy: [{ startDate: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.academicCalendarEvent.count({ where }),
      ]);

      return {
        items: items.map(eventResponse),
        pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      };
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async listPublic(rawQuery: Record<string, string | undefined> = {}) {
    const parsed = publicSchema.safeParse(rawQuery);
    if (!parsed.success) throw new ResponseError(400, "Invalid calendar date range.");

    const prisma = getPrisma();
    try {
      const items = await prisma.academicCalendarEvent.findMany({
        where: {
          isActive: true,
          ...(parsed.data.from ? { endDate: { gte: dateValue(parsed.data.from) } } : {}),
          ...(parsed.data.to ? { startDate: { lte: dateValue(parsed.data.to) } } : {}),
        },
        orderBy: [{ startDate: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
        take: 500,
      });

      return items.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        type: event.type,
        startDate: dateString(event.startDate),
        endDate: dateString(event.endDate),
        eventTime: event.eventTime,
        location: event.location,
      }));
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async create(payload: unknown) {
    const parsed = eventSchema.safeParse(payload);
    if (!parsed.success) throw new ResponseError(400, "Invalid calendar event payload.");

    try {
      const event = await getPrisma().academicCalendarEvent.create({
        data: {
          title: parsed.data.title,
          description: nullable(parsed.data.description),
          type: parsed.data.type,
          startDate: dateValue(parsed.data.startDate),
          endDate: parsed.data.endDate ? dateValue(parsed.data.endDate) : null,
          eventTime: nullable(parsed.data.eventTime),
          location: nullable(parsed.data.location),
          isActive: parsed.data.isActive,
          sortOrder: parsed.data.sortOrder,
        },
      });
      return eventResponse(event);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async update(id: string | undefined, payload: unknown) {
    const eventId = requireId(id);
    const parsed = updateSchema.safeParse(payload);
    if (!parsed.success || !Object.keys(parsed.data).length) {
      throw new ResponseError(400, "At least one valid calendar event field is required.");
    }

    try {
      const existing = await getPrisma().academicCalendarEvent.findUnique({ where: { id: eventId } });
      if (!existing) throw new ResponseError(404, "Calendar event not found.");
      const startDate = parsed.data.startDate ?? dateString(existing.startDate)!;
      const endDate = parsed.data.endDate === undefined ? dateString(existing.endDate) : parsed.data.endDate;
      if (endDate && endDate < startDate) throw new ResponseError(400, "End date cannot be before start date.");

      const event = await getPrisma().academicCalendarEvent.update({
        where: { id: eventId },
        data: {
          ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
          ...(parsed.data.description !== undefined ? { description: nullable(parsed.data.description) } : {}),
          ...(parsed.data.type !== undefined ? { type: parsed.data.type } : {}),
          ...(parsed.data.startDate !== undefined ? { startDate: dateValue(parsed.data.startDate) } : {}),
          ...(parsed.data.endDate !== undefined ? { endDate: parsed.data.endDate ? dateValue(parsed.data.endDate) : null } : {}),
          ...(parsed.data.eventTime !== undefined ? { eventTime: nullable(parsed.data.eventTime) } : {}),
          ...(parsed.data.location !== undefined ? { location: nullable(parsed.data.location) } : {}),
          ...(parsed.data.isActive !== undefined ? { isActive: parsed.data.isActive } : {}),
          ...(parsed.data.sortOrder !== undefined ? { sortOrder: parsed.data.sortOrder } : {}),
        },
      });
      return eventResponse(event);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async delete(id: string | undefined) {
    try {
      await getPrisma().academicCalendarEvent.delete({ where: { id: requireId(id) } });
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}
