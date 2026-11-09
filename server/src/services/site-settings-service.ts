import { z } from "zod";
import { ResponseError } from "../error/response-error";
import { MAP_EMBED_ERROR, normalizeMapEmbedSrc } from "../lib/google-maps";
import { getPrisma } from "../lib/prisma";

/**
 * School-wide settings (contact numbers, address and map, office hours, social
 * links). They are the single source for the Contact page, footer, Book a Tour
 * and Admission WhatsApp buttons. Stored as one CmsPage row so no extra table
 * is needed, like the contact page and admission guidelines.
 */
const SITE_SETTINGS_SLUG = "site-settings";
const CONTACT_PAGE_SLUG = "contact";

export const SITE_SETTINGS_GROUPS = ["contact", "location", "officeHours", "social"] as const;
export type SiteSettingsGroup = (typeof SITE_SETTINGS_GROUPS)[number];

const defaultMapEmbedSrc =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.7314275134707!2d106.7262070747513!3d-6.300282493688862!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69fa70d8a57eb7%3A0x6b10705a6ef6c3b6!2sMillennia%20World%20School!5e0!3m2!1sen!2sid!4v1715569420000!5m2!1sen!2sid";

export const defaultSiteSettings = {
  contact: {
    phone: "+62 821-1150-7100",
    whatsapp: "+62 821-1150-7100",
    email: "info@millennia21.id",
  },
  location: {
    name: "Millennia World School",
    addressLines: [
      "Jl. Merpati Raya No. 103, Sawah Lama, Ciputat,",
      "Tangerang Selatan, Banten 15413, Indonesia",
    ],
    mapEmbedSrc: defaultMapEmbedSrc,
  },
  officeHours: {
    items: [
      { title: "Monday - Friday", text: "07:30 AM - 04:00 PM" },
      { title: "Saturday", text: "08:00 AM - 12:00 PM (Admissions office only)" },
      { title: "Sunday & Public Holidays", text: "Closed" },
    ],
  },
  social: {
    instagram: "",
    facebook: "",
    youtube: "",
    tiktok: "",
    linkedin: "",
  },
};

const optionalHttpsUrl = z
  .string()
  .trim()
  .max(500)
  .refine((value) => {
    if (!value) return true;
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, "Must be a full https:// link.");

const groupSchemas = {
  contact: z.object({
    phone: z.string().trim().min(1).max(100),
    whatsapp: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .refine((value) => value.replace(/\D/g, "").length >= 8, "WhatsApp number is too short."),
    email: z.string().trim().email().max(255),
  }),
  location: z.object({
    name: z.string().trim().min(1).max(255),
    addressLines: z.array(z.string().trim().min(1).max(255)).min(1).max(6),
    mapEmbedSrc: z.string().trim().min(1),
  }),
  officeHours: z.object({
    items: z
      .array(
        z.object({
          title: z.string().trim().min(1).max(255),
          text: z.string().trim().min(1).max(255),
        }),
      )
      .min(1)
      .max(12),
  }),
  social: z.object({
    instagram: optionalHttpsUrl,
    facebook: optionalHttpsUrl,
    youtube: optionalHttpsUrl,
    tiktok: optionalHttpsUrl,
    linkedin: optionalHttpsUrl,
  }),
} satisfies Record<SiteSettingsGroup, z.ZodTypeAny>;

export type SiteSettings = {
  [Group in SiteSettingsGroup]: z.infer<(typeof groupSchemas)[Group]>;
};

/** Older Contact page content, read only until settings are saved for the first time. */
const legacyContactSchema = z.object({
  address: z
    .object({ name: z.string(), lines: z.array(z.string()) })
    .partial()
    .optional(),
  directContacts: z
    .object({ phone: z.string(), whatsapp: z.string(), email: z.string() })
    .partial()
    .optional(),
  officeHours: z
    .object({ items: z.array(z.object({ title: z.string(), text: z.string() })) })
    .partial()
    .optional(),
  map: z.object({ src: z.string() }).partial().optional(),
});

function settingsFromLegacyContact(body: unknown): Partial<Record<SiteSettingsGroup, unknown>> {
  const result = legacyContactSchema.safeParse(body);
  if (!result.success) return {};
  const legacy = result.data;

  return {
    contact: {
      ...defaultSiteSettings.contact,
      ...legacy.directContacts,
    },
    location: {
      name: legacy.address?.name ?? defaultSiteSettings.location.name,
      addressLines: legacy.address?.lines ?? defaultSiteSettings.location.addressLines,
      mapEmbedSrc: legacy.map?.src ?? defaultSiteSettings.location.mapEmbedSrc,
    },
    officeHours: {
      items: legacy.officeHours?.items ?? defaultSiteSettings.officeHours.items,
    },
  };
}

function resolveGroup<Group extends SiteSettingsGroup>(
  group: Group,
  ...candidates: unknown[]
): SiteSettings[Group] {
  for (const candidate of candidates) {
    const result = groupSchemas[group].safeParse(candidate);
    if (!result.success) continue;

    if (group === "location") {
      const location = result.data as SiteSettings["location"];
      const mapEmbedSrc = normalizeMapEmbedSrc(location.mapEmbedSrc);
      if (!mapEmbedSrc) continue;
      return { ...location, mapEmbedSrc } as SiteSettings[Group];
    }

    return result.data as SiteSettings[Group];
  }

  return defaultSiteSettings[group] as SiteSettings[Group];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function resolveSettings(stored: unknown, legacyContactBody: unknown): SiteSettings {
  const saved = asRecord(stored);
  const legacy = settingsFromLegacyContact(legacyContactBody);

  return {
    contact: resolveGroup("contact", saved.contact, legacy.contact),
    location: resolveGroup("location", saved.location, legacy.location),
    officeHours: resolveGroup("officeHours", saved.officeHours, legacy.officeHours),
    social: resolveGroup("social", saved.social),
  };
}

export function isSiteSettingsGroup(value: string): value is SiteSettingsGroup {
  return (SITE_SETTINGS_GROUPS as readonly string[]).includes(value);
}

function parseGroup<Group extends SiteSettingsGroup>(
  group: Group,
  payload: unknown,
): SiteSettings[Group] {
  const result = groupSchemas[group].safeParse(payload);
  if (!result.success) {
    const issue = result.error.issues[0];
    const field = issue?.path.join(".");
    throw new ResponseError(
      400,
      issue ? `Invalid ${field || group}: ${issue.message}` : "Invalid settings.",
    );
  }

  if (group === "location") {
    const location = result.data as SiteSettings["location"];
    const mapEmbedSrc = normalizeMapEmbedSrc(location.mapEmbedSrc);
    if (!mapEmbedSrc) throw new ResponseError(400, MAP_EMBED_ERROR);
    return { ...location, mapEmbedSrc } as SiteSettings[Group];
  }

  return result.data as SiteSettings[Group];
}

function settingsResponse(
  row: { id: string; updatedAt: Date; body: unknown } | null,
  legacyContactBody: unknown,
) {
  return {
    id: row?.id ?? null,
    updatedAt: row?.updatedAt ?? null,
    settings: resolveSettings(row?.body, legacyContactBody),
  };
}

export class SiteSettingsService {
  static async get() {
    const prisma = getPrisma();
    const [row, contactPage] = await Promise.all([
      prisma.cmsPage.findFirst({
        where: { slug: SITE_SETTINGS_SLUG, deletedAt: null },
        select: { id: true, updatedAt: true, body: true },
      }),
      prisma.cmsPage.findFirst({
        where: { slug: CONTACT_PAGE_SLUG, deletedAt: null },
        select: { body: true },
      }),
    ]);

    return settingsResponse(row, contactPage?.body);
  }

  static async getSettings(): Promise<SiteSettings> {
    return (await SiteSettingsService.get()).settings;
  }

  static async updateGroup(group: string, payload: unknown, userId: string | null) {
    if (!isSiteSettingsGroup(group)) {
      throw new ResponseError(404, "Unknown settings section.");
    }

    const value = parseGroup(group, payload);
    const prisma = getPrisma();

    return prisma.$transaction(async (tx) => {
      const [row, contactPage] = await Promise.all([
        tx.cmsPage.findFirst({
          where: { slug: SITE_SETTINGS_SLUG },
          select: { body: true, deletedAt: true },
        }),
        tx.cmsPage.findFirst({
          where: { slug: CONTACT_PAGE_SLUG, deletedAt: null },
          select: { body: true },
        }),
      ]);

      // Save every section, not just this one, so sections still read from the
      // old Contact page content are kept once settings exist.
      const current = resolveSettings(row && !row.deletedAt ? row.body : null, contactPage?.body);
      const body = { ...current, [group]: value };
      const now = new Date();

      const saved = await tx.cmsPage.upsert({
        where: { slug: SITE_SETTINGS_SLUG },
        create: {
          slug: SITE_SETTINGS_SLUG,
          title: "Site Settings",
          template: SITE_SETTINGS_SLUG,
          body,
          status: "published",
          publishedAt: now,
          createdBy: userId,
        },
        update: {
          body,
          status: "published",
          updatedAt: now,
          deletedAt: null,
        },
        select: { id: true, updatedAt: true, body: true },
      });

      return settingsResponse(saved, contactPage?.body);
    });
  }
}
