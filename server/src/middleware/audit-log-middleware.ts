import type { Context, Next } from "hono";
import {
  auditRequestMeta,
  writeAuditLog,
  type AuditLogWriter,
} from "../lib/audit-log";
import type { SessionVariables } from "../types/hono-context";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const UUID_IN_PATH = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const IS_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// First match wins, so nested paths come before their parents.
const ENTITY_TYPES: Array<[RegExp, string]> = [
  [/^\/galleries\/[^/]+\/images/, "GalleryImage"],
  [/^\/galleries\/[^/]+\/videos/, "GalleryVideo"],
  [/^\/galleries/, "Gallery"],
  [/^\/gallery-images/, "GalleryImage"],
  [/^\/gallery-videos/, "GalleryVideo"],
  [/^\/hero-slides/, "HeroSlide"],
  [/^\/home-content\/spotlights/, "Quote"],
  [/^\/home-content\/settings/, "HomeInfoSection"],
  [/^\/home-content/, "HomeContent"],
  [/^\/admission-guidelines/, "AdmissionGuidelinesPage"],
  [/^\/admissions/, "AdmissionsPage"],
  [/^\/community-stories\/voices/, "CommunityVoice"],
  [/^\/community-stories\/news/, "CommunityStory"],
  [/^\/community-stories/, "CommunityStoriesPage"],
  [/^\/our-school/, "AboutPage"],
  [/^\/academic-levels\/[^/]+\/assets/, "AcademicLevelAsset"],
  [/^\/academic-levels/, "AcademicLevelPage"],
  [/^\/academic-crud\/faqs/, "Faq"],
  [/^\/academic-crud\/[^/]+\/[^/]+\/faqs/, "AcademicLevelFaq"],
  [/^\/academic-crud/, "Academic"],
  [/^\/news\/categories/, "NewsCategory"],
  [/^\/news\/tags/, "NewsTag"],
  [/^\/news\/posts\/[^/]+\/media/, "NewsMedia"],
  [/^\/news\/posts/, "NewsPost"],
  [/^\/partners/, "Partner"],
  [/^\/popup-promoted/, "PopupPromoted"],
  [/^\/contact-inquiries/, "ContactInquiry"],
  [/^\/calendar/, "CalendarEvent"],
  [/^\/contact-page/, "ContactPage"],
];

// CMS user management writes its own, more detailed entries.
const SELF_LOGGED_PATHS = [/^\/users(\/|$)/];

type Body = Record<string, unknown>;

function entityTypeFor(path: string) {
  for (const [pattern, type] of ENTITY_TYPES) {
    if (pattern.test(path)) return type;
  }
  const segment = path.split("/").filter(Boolean)[0] ?? "Unknown";
  return segment.replace(/(^|-)(\w)/g, (_, __, char: string) => char.toUpperCase());
}

function snakeCase(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toUpperCase();
}

function asBody(value: unknown): Body | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Body) : null;
}

function verbFor(method: string, path: string, body: Body | null, isUpload: boolean, hasPathId: boolean) {
  if (method === "DELETE") {
    if (/\/faqs\/[^/]+$/.test(path)) return "REMOVED";
    return hasPathId ? "DELETED" : "RESET";
  }
  if (method === "POST") {
    if (isUpload) return "UPLOADED";
    if (/\/[^/]+\/[^/]+\/faqs$/.test(path) && !path.startsWith("/academic-crud/faqs")) return "ADDED";
    return "CREATED";
  }
  if (/\/faqs$/.test(path) && !path.startsWith("/academic-crud/faqs")) return "REORDERED";

  const status = typeof body?.status === "string" ? body.status.toUpperCase() : null;
  if (status === "PUBLISHED" || body?.isPublished === true) return "PUBLISHED";
  if (status === "DRAFT") return "DRAFT_SAVED";
  if (status === "ARCHIVED") return "ARCHIVED";

  const keys = body ? Object.keys(body) : [];
  if (keys.length === 1 && keys[0] === "isActive") {
    return body?.isActive ? "ACTIVATED" : "DEACTIVATED";
  }
  if (keys.length === 1 && keys[0] === "status" && status) return "STATUS_CHANGED";
  return "UPDATED";
}

async function readRequestBody(c: Context): Promise<{ body: unknown; isUpload: boolean }> {
  const contentType = c.req.header("content-type") ?? "";
  try {
    // Hono caches parsed bodies, so this reuses what the handler already read.
    if (contentType.includes("multipart/form-data")) {
      return { body: await c.req.parseBody(), isUpload: true };
    }
    if (contentType.includes("application/json")) {
      return { body: await c.req.json(), isUpload: false };
    }
  } catch {
    // An unreadable body still gets an entry, just without values.
  }
  return { body: undefined, isUpload: false };
}

async function responseData(c: Context): Promise<Body | null> {
  if (!c.res.headers.get("content-type")?.includes("application/json")) return null;
  try {
    const payload = asBody(await c.res.clone().json());
    return asBody(payload?.data);
  } catch {
    return null;
  }
}

function labelOf(...sources: Array<Body | null>) {
  for (const source of sources) {
    for (const key of ["title", "name", "question", "text", "email"]) {
      const value = source?.[key];
      if (typeof value === "string" && value.trim()) return value.trim().slice(0, 200);
    }
  }
  return undefined;
}

/**
 * Records every successful change made through the CMS admin API: what was
 * changed, by whom, from where, and the values that were sent.
 */
export function createAuditLogMiddleware(write: AuditLogWriter = writeAuditLog) {
  return async (c: Context<{ Variables: SessionVariables }>, next: Next) => {
    await next();

    const method = c.req.method.toUpperCase();
    if (!MUTATING_METHODS.has(method) || c.res.status >= 400) return;

    const path = c.req.path.replace(/^\/admin(?=\/|$)/, "") || "/";
    if (SELF_LOGGED_PATHS.some((pattern) => pattern.test(path))) return;

    const { body, isUpload } = await readRequestBody(c);
    const requestBody = asBody(body);
    const data = await responseData(c);
    const pathIds = path.match(UUID_IN_PATH) ?? [];
    const createdId = typeof data?.id === "string" && IS_UUID.test(data.id) ? data.id : null;

    const entityType = entityTypeFor(path);
    const verb = verbFor(method, path, requestBody, isUpload, pathIds.length > 0);
    const label = labelOf(requestBody, data);

    await write({
      actorId: c.var.user?.id ?? null,
      action: `${snakeCase(entityType)}_${verb}`,
      entityType,
      entityId: method === "POST" ? createdId ?? pathIds.at(-1) ?? null : pathIds.at(-1) ?? createdId,
      newValues:
        body === undefined && !label
          ? undefined
          : { ...(label ? { label } : {}), ...(requestBody ?? (body === undefined ? {} : { body })) },
      ...auditRequestMeta(c),
    });
  };
}

export const auditLogMiddleware = createAuditLogMiddleware();
