import { z } from "zod";
import { ResponseError } from "../error/response-error";
import { getPrisma } from "../lib/prisma";

const contactInquirySchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().email().max(255).toLowerCase(),
  subject: z.string().trim().min(1).max(255),
  category: z.string().trim().max(100).nullable().optional(),
  message: z.string().trim().min(1).max(5000),
  source: z.string().trim().max(100).nullable().optional(),
});

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
}
