import { z } from "zod";
import { ResponseError } from "../../error/response-error";
import { getPrisma } from "../../lib/prisma";
import type { ContactInquiry } from "@prisma/client";
import { sendMail, type MailResult } from "../../lib/mailer";
import { ContactInquiryRepository } from "../../repositories/contact-inquiry-repository";
import {
  contactInquiryNotificationEmail,
  inquiryNotifyRecipients,
} from "./contact-inquiry-email";
import { ContactPageService } from "./contact-page-service";

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
  captchaToken: z.string().trim().max(4096).optional(),
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

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_CLEANUP_INTERVAL_MS = 60 * 1000;
const DEFAULT_RATE_LIMIT_MAX_PER_IP = 5;
const DEFAULT_RATE_LIMIT_MAX_PER_EMAIL = 3;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();
let nextRateLimitCleanupAt = 0;

function positiveIntegerEnv(name: string, fallback: number) {
  const rawValue = process.env[name]?.trim();
  if (!rawValue) return fallback;

  const value = Number(rawValue);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function contactRateLimitPerIp() {
  return positiveIntegerEnv("CONTACT_RATE_LIMIT_PER_IP", DEFAULT_RATE_LIMIT_MAX_PER_IP);
}

function contactRateLimitPerEmail() {
  return positiveIntegerEnv("CONTACT_RATE_LIMIT_PER_EMAIL", DEFAULT_RATE_LIMIT_MAX_PER_EMAIL);
}

function cleanupExpiredRateLimits(now: number) {
  if (now < nextRateLimitCleanupAt) return;

  nextRateLimitCleanupAt = now + RATE_LIMIT_CLEANUP_INTERVAL_MS;
  for (const [key, bucket] of rateLimitBuckets.entries()) {
    if (bucket.resetAt <= now) {
      rateLimitBuckets.delete(key);
    }
  }
}

function rateLimit(key: string, max: number) {
  const now = Date.now();
  cleanupExpiredRateLimits(now);

  const current = rateLimitBuckets.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return;
  }

  current.count += 1;
  if (current.count > max) {
    throw new ResponseError(429, "Please wait before sending another message.");
  }
}

export function resetContactInquiryRateLimitForTest() {
  rateLimitBuckets.clear();
  nextRateLimitCleanupAt = 0;
}

function recaptchaSecretKey() {
  return process.env["RECAPTCHA_SECRET_KEY"]?.trim() || "";
}

function contactCaptchaEnabled() {
  return process.env["CONTACT_CAPTCHA_ENABLED"]?.trim().toLowerCase() === "true";
}

function recaptchaMinScore() {
  const value = Number(process.env["RECAPTCHA_MIN_SCORE"] ?? 0.5);
  return Number.isFinite(value) ? value : 0.5;
}

async function verifyCaptcha(token: string | undefined, ipAddress?: string | null) {
  if (!contactCaptchaEnabled()) return;

  const secret = recaptchaSecretKey();
  if (!secret) return;

  if (!token) {
    throw new ResponseError(400, "Captcha verification is required.");
  }

  const body = new URLSearchParams({
    response: token,
    secret,
  });
  if (ipAddress) body.set("remoteip", ipAddress);

  let result: {
    action?: string;
    score?: number;
    success?: boolean;
    "error-codes"?: string[];
  };
  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body,
    });
    result = (await response.json()) as typeof result;
  } catch {
    throw new ResponseError(502, "Captcha verification is unavailable. Please try again.");
  }

  if (!result.success || result.action !== "contact_inquiry") {
    throw new ResponseError(400, "Captcha verification failed. Please try again.");
  }

  if (typeof result.score === "number" && result.score < recaptchaMinScore()) {
    throw new ResponseError(400, "Captcha score is too low. Please try again.");
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

    await verifyCaptcha(parsed.data.captchaToken, meta.ipAddress);

    const ipKey = meta.ipAddress ?? "unknown";
    rateLimit(`contact:ip:${ipKey}`, contactRateLimitPerIp());
    rateLimit(`contact:email:${parsed.data.email}`, contactRateLimitPerEmail());

    const { captchaToken: _captchaToken, ...inquiryData } = parsed.data;

    const inquiry = await getPrisma().contactInquiry.create({
      data: {
        ...inquiryData,
        category: inquiryData.category || null,
        source: inquiryData.source || "contact-page",
        ipAddress: meta.ipAddress || null,
        userAgent: meta.userAgent || null,
      },
    });

    // Not awaited: the visitor gets their confirmation right away, and a
    // failed notification never fails the form (sendMail does not throw).
    void ContactInquiryService.notifyNewInquiry(inquiry);

    return {
      id: inquiry.id,
      status: inquiry.status,
      createdAt: inquiry.createdAt,
    };
  }

  /** Emails INQUIRY_NOTIFY_EMAILS about a new inquiry. */
  static async notifyNewInquiry(inquiry: ContactInquiry): Promise<MailResult> {
    const recipients = inquiryNotifyRecipients();
    if (!recipients.length) {
      return { sent: false, reason: "INQUIRY_NOTIFY_EMAILS is not set." };
    }

    let categoryLabel: string | null = null;
    if (inquiry.category) {
      try {
        const page = await ContactPageService.getPublic();
        categoryLabel =
          page.content.form.categories.find((item) => item.value === inquiry.category)?.label ??
          null;
      } catch {
        // The raw category value is still shown in the email.
      }
    }

    const result = await sendMail(
      contactInquiryNotificationEmail({ to: recipients, inquiry, categoryLabel }),
    );
    if (!result.sent) {
      console.warn(`[MAIL] Inquiry ${inquiry.id} notification not sent: ${result.reason}`);
    }
    return result;
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
