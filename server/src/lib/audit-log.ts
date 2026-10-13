import type { Context } from "hono";
import type { Prisma } from "@prisma/client";
import { getPrisma } from "./prisma";

export type AuditLogInput = {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValues?: unknown;
  newValues?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type AuditLogWriter = (input: AuditLogInput) => Promise<void>;

const SENSITIVE_KEY = /(password|secret|token|hash|authorization|cookie)/i;
const MAX_STRING_LENGTH = 500;
const MAX_ARRAY_ITEMS = 50;
const MAX_DEPTH = 6;
const MAX_JSON_LENGTH = 32_000;

export async function writeAuditLog(input: AuditLogInput): Promise<void> {
  try {
    await getPrisma().auditLog.create({
      data: {
        cmsUserId: input.actorId ?? null,
        action: input.action.slice(0, 50),
        entityType: input.entityType.slice(0, 100),
        entityId: input.entityId ?? null,
        oldValues: toAuditJson(input.oldValues),
        newValues: toAuditJson(input.newValues),
        ipAddress: input.ipAddress?.slice(0, 45) ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  } catch (error) {
    // Audit logging must not turn a successful CMS action into a failure.
    console.error("[AUDIT] Audit log write failed", {
      action: input.action,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export function auditRequestMeta(c: Context) {
  return {
    ipAddress:
      c.req.header("cf-connecting-ip") ||
      c.req.header("x-real-ip") ||
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
      null,
    userAgent: c.req.header("user-agent") || null,
  };
}

/**
 * Makes a value safe and small enough to store: secrets are redacted, long
 * text is shortened, and oversized payloads keep only their field names.
 */
export function sanitizeAuditValue(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    return value.length > MAX_STRING_LENGTH ? `${value.slice(0, MAX_STRING_LENGTH)}…` : value;
  }
  if (typeof value !== "object") return value;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof File) {
    return { fileName: value.name, size: value.size, type: value.type };
  }
  if (depth >= MAX_DEPTH) return "[…]";

  if (Array.isArray(value)) {
    const items = value.slice(0, MAX_ARRAY_ITEMS).map((item) => sanitizeAuditValue(item, depth + 1));
    return value.length > MAX_ARRAY_ITEMS ? [...items, `… ${value.length - MAX_ARRAY_ITEMS} more`] : items;
  }

  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    result[key] = SENSITIVE_KEY.test(key) ? "[redacted]" : sanitizeAuditValue(item, depth + 1);
  }
  return result;
}

function toAuditJson(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === null || value === undefined) return undefined;

  const sanitized = sanitizeAuditValue(value);
  const json = JSON.stringify(sanitized);
  if (json === undefined) return undefined;
  if (json.length <= MAX_JSON_LENGTH) return JSON.parse(json) as Prisma.InputJsonValue;

  return {
    truncated: true,
    fields: sanitized && typeof sanitized === "object" ? Object.keys(sanitized) : [],
  };
}
