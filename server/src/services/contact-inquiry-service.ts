import { z } from "zod";
import { ResponseError } from "../error/response-error";
import { getPrisma } from "../lib/prisma";
import { ContactInquiryRepository } from "../repositories/contact-inquiry-repository";

export const CONTACT_INQUIRY_STATUSES = [
  "NEW",
  "IN_PROGRESS",
  "RESOLVED",
  "SPAM",
] as const;

const contactInquirySchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().email().max(255).toLowerCase(),
  subject: z.string().trim().min(1).max(255),
  category: z.string().trim().max(100).nullable().optional(),
  message: z.string().trim().min(1).max(5000),
  source: z.string().trim().max(100).nullable().optional(),
});

const uuidSchema = z.string().uuid();

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(CONTACT_INQUIRY_STATUSES).optional(),
  search: z.string().trim().min(1).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(CONTACT_INQUIRY_STATUSES),
});

function requireInquiryId(id: string | undefined): string {
  if (!id || !uuidSchema.safeParse(id).success) {
    throw new ResponseError(400, "Valid UUID inquiry id is required.");
  }
  return id;
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string) {
  const now = Date.now();
  const current = rateLimitBuckets.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return;
  }

  current.count += 1;
  if (current.count > RATE_LIMIT_MAX) {
    throw new ResponseError(429, "Please wait before sending another message.");
  }
}

export class ContactInquiryService {
  static async submit(
    payload: unknown,
    meta: { ipAddress?: string | null; userAgent?: string | null } = {},
  ) {
    const parsed = contactInquirySchema.safeParse(payload);
    if (!parsed.success) {
      throw new ResponseError(400, "Invalid contact inquiry payload.");
    }

    const rateKey = `${meta.ipAddress ?? "unknown"}:${parsed.data.email}`;
    rateLimit(rateKey);

    const inquiry = await getPrisma().contactInquiry.create({
      data: {
        ...parsed.data,
        category: parsed.data.category || null,
        source: parsed.data.source || "contact-page",
        ipAddress: meta.ipAddress || null,
        userAgent: meta.userAgent || null,
      },
    });

    return {
      id: inquiry.id,
      status: inquiry.status,
      createdAt: inquiry.createdAt,
    };
  }

  static async list(rawQuery: Record<string, string | undefined>) {
    const parsed = listQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      throw new ResponseError(400, "Invalid inquiry query.");
    }

    const filters = parsed.data;
    const [{ items, total }, statusCounts] = await Promise.all([
      ContactInquiryRepository.list(filters),
      ContactInquiryRepository.countByStatus(filters.search),
    ]);

    return {
      items,
      statusCounts,
      pagination: {
        page: filters.page,
        pageSize: filters.pageSize,
        total,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    };
  }

  static async get(rawId: string | undefined) {
    const id = requireInquiryId(rawId);
    const inquiry = await ContactInquiryRepository.findById(id);
    if (!inquiry) throw new ResponseError(404, "Inquiry not found.");
    return inquiry;
  }

  static async updateStatus(rawId: string | undefined, payload: unknown) {
    const id = requireInquiryId(rawId);
    const parsed = updateStatusSchema.safeParse(payload);
    if (!parsed.success) {
      throw new ResponseError(400, "Invalid inquiry status.");
    }

    const existing = await ContactInquiryRepository.findById(id);
    if (!existing) throw new ResponseError(404, "Inquiry not found.");

    return ContactInquiryRepository.updateStatus(id, parsed.data.status);
  }
}
