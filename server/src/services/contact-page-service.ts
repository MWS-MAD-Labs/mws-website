import { z } from "zod";
import { ResponseError } from "../error/response-error";
import { getPrisma } from "../lib/prisma";

const CONTACT_PAGE_SLUG = "contact";

const mapSrc =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.7314275134707!2d106.7262070747513!3d-6.300282493688862!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69fa70d8a57eb7%3A0x6b10705a6ef6c3b6!2sMillennia%20World%20School!5e0!3m2!1sen!2sid!4v1715569420000!5m2!1sen!2sid";

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
    "Sint velit deserunt non sit in irure primis nibh amet eiusmod. Luctus exercitation reprehenderit vel suscipit laboris aliquip.",
  address: {
    title: "Campus Address",
    name: "Millennia World School",
    lines: [
      "Jl. Merpati Raya No. 103, Sawah Lama, Ciputat,",
      "Tangerang Selatan, Banten 15413, Indonesia",
    ],
  },
  directContacts: {
    title: "Direct Contacts",
    heading: "Administration & Admission:",
    phone: "+62 21-7463-3333",
    whatsapp: "+62 812-1111-2222",
    email: "info@millennia21.id",
  },
  officeHours: {
    title: "Office Hours",
    items: [
      { title: "Monday - Friday", text: "07:30 AM - 04:00 PM" },
      {
        title: "Saturday",
        text: "08:00 AM - 12:00 PM (Admissions office only)",
      },
      { title: "Sunday & Public Holidays", text: "Closed" },
    ],
  },
  map: {
    title: "Our Campus Location",
    src: mapSrc,
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

function parseContent(payload: unknown): ContactPageContent {
  const result = contactPageContentSchema.safeParse(payload);
  if (!result.success) {
    throw new ResponseError(400, "Invalid contact page content.");
  }
  return result.data;
}

function resolveContent(payload: unknown): ContactPageContent {
  const result = contactPageContentSchema.safeParse(payload);
  return result.success ? result.data : defaultContactPageContent;
}

function pageResponse(page: {
  id?: string;
  title?: string;
  status?: string | null;
  updatedAt?: Date;
  body?: unknown;
}) {
  return {
    id: page.id ?? null,
    slug: CONTACT_PAGE_SLUG,
    title: page.title ?? defaultContactPageContent.hero.title,
    template: "contact",
    status: page.status ?? "default",
    updatedAt: page.updatedAt ?? null,
    content: resolveContent(page.body),
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

    return pageResponse(page ?? {});
  }

  static async getAdmin() {
    const prisma = getPrisma();
    const page = await prisma.cmsPage.findFirst({
      where: { slug: CONTACT_PAGE_SLUG, deletedAt: null },
    });

    return pageResponse(page ?? {});
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

    return pageResponse(page);
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
