import { z } from "zod";

const uuid = z.string().trim().uuid();
const optionalUuid = uuid.nullable().optional();

const optionalText = (max?: number) => {
  const base = z.string().trim();
  const parsed = typeof max === "number" ? base.max(max) : base;
  return parsed.nullable().optional();
};

export const newsCategorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: optionalText(2000),
  isActive: z.boolean().optional().default(true),
});

export const newsTagSchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export const newsPostSchema = z.object({
  categoryId: optionalUuid,
  title: z.string().trim().min(1).max(255),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: optionalText(2000),
  coverImage: optionalText(1000),
  coverImageAlt: optionalText(255),
  content: z.any().default({}),
  authorName: optionalText(150),
  // authorId sengaja TIDAK ada di sini: diisi server dari session admin yang
  // login (lihat NewsService.createPost). z.object() otomatis membuang key
  // authorId yang dikirim client, jadi attribution tidak bisa dipalsukan.
  status: z
    .enum(["DRAFT", "PUBLISHED", "ARCHIVED"])
    .optional()
    .default("DRAFT"),
  isFeatured: z.boolean().optional().default(false),
  isPublished: z.boolean().optional().default(false),
  publishedAt: z.coerce.date().nullable().optional(),
  seoTitle: optionalText(255),
  seoDescription: optionalText(2000),
  readTime: z.number().int().min(0).max(9999).optional().default(0),
  viewCount: z.number().int().min(0).optional().default(0),
  tagIds: z.array(uuid).optional(),
});

export const newsPostMediaSchema = z.object({
  newsPostId: uuid,
  mediaType: z.enum(["IMAGE", "VIDEO", "DOCUMENT"]).optional().default("IMAGE"),
  url: z.string().trim().min(1).max(1000),
  alt: optionalText(255),
  caption: optionalText(2000),
  sortOrder: z.number().int().min(0).optional().default(0),
});
