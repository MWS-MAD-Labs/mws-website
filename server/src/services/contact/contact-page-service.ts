import { z } from "zod";
import { ResponseError } from "../../error/response-error";
import { getPrisma } from "../../lib/prisma";
import { MAP_EMBED_ERROR, normalizeMapEmbedSrc } from "../../lib/google-maps";
import {
  SiteSettingsService,
  defaultSiteSettings,
  type SiteSettings,
} from "../site-settings-service";

const CONTACT_PAGE_SLUG = "contact";

export const defaultContactPageContent = {
  hero: {
    title: "Contact Us",
    image: "/assets-mws/DSC05350.jpg",
    imageAlt: "MWS Main Office",
  },
  form: {
    title: "Send us a message",
    successMessage:
      "Message sent successfully! Our administrative office will get back to you within 24 hours.",
    categories: [
      { value: "general", label: "General Administration" },
      { value: "admissions", label: "Admissions & Tours" },
      { value: "finance", label: "Finance Office" },
      { value: "hr", label: "Human Resources / Career" },
    ],
  },
  intro:
    "Welcome to our website. We are glad to have you around. Please feel free to reach out to us for any inquiries regarding our programs, admissions, or campus visits.",
  address: {
    title: "Campus Address",
    name: defaultSiteSettings.location.name,
    lines: defaultSiteSettings.location.addressLines,
  },
  directContacts: {
    title: "Direct Contacts",
    heading: "Administration & Admission:",
    ...defaultSiteSettings.contact,
  },
  officeHours: {
    title: "Office Hours",
    items: defaultSiteSettings.officeHours.items,
  },
  map: {
    title: "Our Campus Location",
    src: defaultSiteSettings.location.mapEmbedSrc,
    titleAttr: "Millennia World School location map",
  },
};

const contactPageContentSchema = z.object({
  hero: z.object({
    title: z.string().trim().min(1).max(255),
    image: z.string().trim().min(1),
    imageAlt: z.string().trim().min(1).max(255),
  }),
  form: z.object({
    title: z.string().trim().min(1).max(255),
    successMessage: z.string().trim().min(1),
    categories: z
      .array(
        z.object({
          value: z.string().trim().min(1).max(100),
          label: z.string().trim().min(1).max(255),
        }),
      )
      .min(1),
  }),
  intro: z.string().trim().min(1),
  address: z.object({
    title: z.string().trim().min(1).max(255),
    name: z.string().trim().min(1).max(255),
    lines: z.array(z.string().trim().min(1)).min(1),
  }),
  directContacts: z.object({
    title: z.string().trim().min(1).max(255),
    heading: z.string().trim().min(1).max(255),
    phone: z.string().trim().min(1).max(100),
    whatsapp: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(255),
  }),
  officeHours: z.object({
    title: z.string().trim().min(1).max(255),
    items: z
      .array(
        z.object({
          title: z.string().trim().min(1).max(255),
          text: z.string().trim().min(1).max(255),
        }),
      )
      .min(1),
  }),
  map: z.object({
    title: z.string().trim().min(1).max(255),
    src: z.string().trim().min(1),
    titleAttr: z.string().trim().min(1).max(255),
  }),
});

export type ContactPageContent = z.infer<typeof contactPageContentSchema>;

export { normalizeMapEmbedSrc };

function parseContent(payload: unknown): ContactPageContent {
  const result = contactPageContentSchema.safeParse(payload);
  if (!result.success) {
    throw new ResponseError(400, "Invalid contact page content.");
  }

  const mapSrc = normalizeMapEmbedSrc(result.data.map.src);
  if (!mapSrc) {
    throw new ResponseError(400, MAP_EMBED_ERROR);
  }

  return { ...result.data, map: { ...result.data.map, src: mapSrc } };
}

function resolveContent(payload: unknown): ContactPageContent {
  const result = contactPageContentSchema.safeParse(payload);
  if (!result.success) return defaultContactPageContent;

  // Content saved before embeds were checked may hold a link that cannot be
  // shown in an iframe; fall back to the default map instead of a broken one.
  const mapSrc = normalizeMapEmbedSrc(result.data.map.src) ?? defaultContactPageContent.map.src;
  return { ...result.data, map: { ...result.data.map, src: mapSrc } };
}

/**
 * Phone, WhatsApp, email, address, office hours and map are managed in Site
 * Settings; the Contact page keeps only its own copy (titles, intro, form).
 */
function withSiteSettings(content: ContactPageContent, settings: SiteSettings): ContactPageContent {
  return {
    ...content,
    address: {
      ...content.address,
      name: settings.location.name,
      lines: settings.location.addressLines,
    },
    directContacts: {
      ...content.directContacts,
      ...settings.contact,
    },
    officeHours: {
      ...content.officeHours,
      items: settings.officeHours.items,
    },
    map: {
      ...content.map,
      src: settings.location.mapEmbedSrc,
    },
  };
}

function pageResponse(
  page: {
    id?: string;
    title?: string;
    status?: string | null;
    updatedAt?: Date;
    body?: unknown;
  },
  settings: SiteSettings,
) {
  return {
    id: page.id ?? null,
    slug: CONTACT_PAGE_SLUG,
    title: page.title ?? defaultContactPageContent.hero.title,
    template: "contact",
    status: page.status ?? "default",
    updatedAt: page.updatedAt ?? null,
    content: withSiteSettings(resolveContent(page.body), settings),
    isDefault: !page.id,
  };
}

export class ContactPageService {
  static async getPublic() {
    const prisma = getPrisma();
    const page = await prisma.cmsPage.findFirst({
      where: {
        slug: CONTACT_PAGE_SLUG,
        deletedAt: null,
        status: "published",
      },
    });

    return pageResponse(page ?? {}, await SiteSettingsService.getSettings());
  }

  static async getAdmin() {
    const prisma = getPrisma();
    const page = await prisma.cmsPage.findFirst({
      where: { slug: CONTACT_PAGE_SLUG, deletedAt: null },
    });

    return pageResponse(page ?? {}, await SiteSettingsService.getSettings());
  }

  static async update(payload: unknown, userId: string | null) {
    const content = parseContent(payload);
    const prisma = getPrisma();
    const now = new Date();
    const page = await prisma.cmsPage.upsert({
      where: { slug: CONTACT_PAGE_SLUG },
      create: {
        slug: CONTACT_PAGE_SLUG,
        title: content.hero.title,
        template: "contact",
        body: content,
        status: "published",
        publishedAt: now,
        createdBy: userId,
      },
      update: {
        title: content.hero.title,
        template: "contact",
        body: content,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        deletedAt: null,
      },
    });

    return pageResponse(page, await SiteSettingsService.getSettings());
  }

  static async delete() {
    const prisma = getPrisma();
    const page = await prisma.cmsPage.findFirst({
      where: { slug: CONTACT_PAGE_SLUG, deletedAt: null },
      select: { id: true },
    });

    if (!page) return;

    await prisma.cmsPage.update({
      where: { id: page.id },
      data: {
        deletedAt: new Date(),
        status: "archived",
      },
    });
  }
}
