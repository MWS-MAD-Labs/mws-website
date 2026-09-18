import { z } from "zod";
import { ResponseError } from "../error/response-error";
import { getPrisma } from "../lib/prisma";
import { GalleryService } from "./gallery-service";
import { PageDataService } from "./page-data-service";

const optionalText = (max?: number) => {
  const schema = z.string().trim();
  return max ? schema.max(max).nullable().optional() : schema.nullable().optional();
};

const admissionProgramSchema = z.object({
  id: z.string().nullable().optional(),
  admissionId: z.string().nullable().optional(),
  title: z.string().trim().min(1).max(255),
  age: z.string().trim().max(100).nullable().optional(),
  description: z.string().trim().nullable().optional(),
  image: z.string().trim().max(1000).nullable().optional(),
  imageAlt: z.string().trim().max(255).nullable().optional(),
  path: z.string().trim().max(500).nullable().optional(),
  galleryId: z.string().uuid().nullable().optional(),
  adminWhatsapp: z.string().trim().max(100).nullable().optional(),
  contactLabel: z.string().trim().max(100).nullable().optional(),
  exploreLabel: z.string().trim().max(100).nullable().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

const admissionsPayloadSchema = z.object({
  programs: z.array(admissionProgramSchema).min(1),
});

const communityStoriesPayloadSchema = z.object({
  title: z.string().trim().min(1).max(255),
  heroImagePath: optionalText(1000),
  heroImageAlt: optionalText(255),
  introTitle: optionalText(500),
  introBody: z.array(z.string().trim().min(1)).min(1),
  galleryId: z.string().uuid().nullable().optional(),
  isPublished: z.boolean().optional(),
});

const newsPayloadSchema = z.object({
  title: z.string().trim().min(1).max(500),
  slug: z.string().trim().min(1).max(500).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: optionalText(),
  imagePath: optionalText(1000),
  imageAlt: optionalText(255),
  galleryId: z.string().uuid().nullable().optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.coerce.date().nullable().optional(),
});

function nullable(value: string | null | undefined) {
  return value?.trim() ? value.trim() : null;
}

function requireUuid(id: string | undefined): asserts id is string {
  if (!id || !z.string().uuid().safeParse(id).success) {
    throw new ResponseError(400, "Valid UUID id is required.");
  }
}

function isUuid(id: string | null | undefined): id is string {
  return Boolean(id && z.string().uuid().safeParse(id).success);
}

async function findOrCreateProgram(data: z.infer<typeof admissionProgramSchema>, index: number) {
  const prisma = getPrisma();
  if (isUuid(data.id)) {
    const existing = await prisma.program.findUnique({ where: { id: data.id } });
    if (existing) return existing;
  }

  const existingByPath = data.path
    ? await prisma.program.findFirst({ where: { path: data.path } })
    : null;
  if (existingByPath) return existingByPath;

  return prisma.program.create({
    data: {
      title: data.title,
      ageRange: nullable(data.age),
      description: nullable(data.description),
      imagePath: nullable(data.image),
      imageAlt: nullable(data.imageAlt),
      path: nullable(data.path),
      galleryId: data.galleryId ?? null,
      sortOrder: data.sortOrder ?? index,
      isActive: data.isActive ?? true,
    },
  });
}

function adminProgramResponse(program: Awaited<ReturnType<typeof getAdminPrograms>>[number]) {
  const admission = program.admissions[0] ?? null;

  return {
    id: program.id,
    admissionId: admission?.id ?? null,
    title: program.title,
    age: program.ageRange || "",
    description: admission?.description || program.description || "",
    image: program.imagePath || "",
    imageAlt: program.imageAlt || null,
    path: program.path || "",
    galleryId: admission?.galleryId ?? program.galleryId ?? null,
    adminWhatsapp: admission?.adminWhatsapp || "",
    contactLabel: admission?.contactLabel || "Contact",
    exploreLabel: admission?.exploreLabel || "Explore",
    sortOrder: admission?.sortOrder ?? program.sortOrder,
    isActive: admission?.isActive ?? program.isActive,
  };
}

async function getAdminPrograms() {
  return getPrisma().program.findMany({
    include: {
      admissions: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

function handleDatabaseError(error: unknown): never {
  const prismaError = error as { code?: string };
  if (prismaError.code === "P2002") {
    throw new ResponseError(409, "A record with the same unique value already exists.");
  }
  if (prismaError.code === "P2003") {
    throw new ResponseError(400, "Selected related data does not exist.");
  }
  if (prismaError.code === "P2025") {
    throw new ResponseError(404, "Content not found.");
  }
  throw error;
}

export class AdminPageEditorService {
  static async getAdmissions() {
    const [programs, galleries] = await Promise.all([
      getAdminPrograms(),
      GalleryService.listGalleries(),
    ]);

    if (programs.length) {
      return {
        programs: programs.map(adminProgramResponse),
        galleries,
      };
    }

    const fallback = await PageDataService.getAdmissions();
    return {
      programs: fallback.programs.map((program, index) => ({
        ...program,
        admissionId: null,
        galleryId: null,
        imageAlt: null,
        sortOrder: index,
        isActive: true,
      })),
      galleries,
    };
  }

  static async saveAdmissions(payload: unknown) {
    const parsed = admissionsPayloadSchema.safeParse(payload);
    if (!parsed.success) throw new ResponseError(400, "Invalid admissions payload.");

    const prisma = getPrisma();

    try {
      for (const [index, programData] of parsed.data.programs.entries()) {
        const program = await findOrCreateProgram(programData, index);

        await prisma.program.update({
          where: { id: program.id },
          data: {
            title: programData.title,
            ageRange: nullable(programData.age),
            description: nullable(programData.description),
            imagePath: nullable(programData.image),
            imageAlt: nullable(programData.imageAlt),
            path: nullable(programData.path),
            galleryId: programData.galleryId ?? null,
            sortOrder: programData.sortOrder ?? index,
            isActive: programData.isActive ?? true,
          },
        });

        const existingAdmission = isUuid(programData.admissionId)
          ? await prisma.admission.findUnique({ where: { id: programData.admissionId } })
          : await prisma.admission.findFirst({ where: { programId: program.id } });

        const admissionData = {
          programId: program.id,
          title: `${programData.title} Admission`,
          description: nullable(programData.description),
          adminWhatsapp: nullable(programData.adminWhatsapp),
          contactLabel: nullable(programData.contactLabel) ?? "Contact",
          exploreLabel: nullable(programData.exploreLabel) ?? "Explore",
          galleryId: programData.galleryId ?? null,
          sortOrder: programData.sortOrder ?? index,
          isActive: programData.isActive ?? true,
        };

        if (existingAdmission) {
          await prisma.admission.update({
            where: { id: existingAdmission.id },
            data: admissionData,
          });
        } else {
          await prisma.admission.create({ data: admissionData });
        }
      }

      return this.getAdmissions();
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async getCommunityStoriesAdmin() {
    const [publicPage, galleries, news] = await Promise.all([
      PageDataService.getCommunityStories(),
      GalleryService.listGalleries(),
      getPrisma().newsPost.findMany({
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      }),
    ]);

    const record = await getPrisma().communityStoriesPage.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    return {
      page: {
        id: record?.id ?? null,
        title: record?.title ?? publicPage.hero.title,
        heroImagePath: record?.heroImagePath ?? publicPage.hero.image,
        heroImageAlt: record?.heroImageAlt ?? publicPage.hero.imageAlt,
        introTitle: record?.introTitle ?? publicPage.introTitle,
        introBody: Array.isArray(record?.introBody) ? record.introBody : publicPage.introBody,
        galleryId: record?.galleryId ?? null,
        isPublished: record?.isPublished ?? true,
      },
      galleries,
      news,
    };
  }

  static async saveCommunityStoriesPage(payload: unknown) {
    const parsed = communityStoriesPayloadSchema.safeParse(payload);
    if (!parsed.success) throw new ResponseError(400, "Invalid community stories payload.");

    const prisma = getPrisma();
    const existing = await prisma.communityStoriesPage.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    const data = {
      title: parsed.data.title,
      heroImagePath: nullable(parsed.data.heroImagePath),
      heroImageAlt: nullable(parsed.data.heroImageAlt),
      introTitle: nullable(parsed.data.introTitle),
      introBody: parsed.data.introBody,
      galleryId: parsed.data.galleryId ?? null,
      isPublished: parsed.data.isPublished ?? true,
    };

    try {
      if (existing) {
        return prisma.communityStoriesPage.update({
          where: { id: existing.id },
          data,
        });
      }
      return prisma.communityStoriesPage.create({ data });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async createNews(payload: unknown) {
    const parsed = newsPayloadSchema.safeParse(payload);
    if (!parsed.success) throw new ResponseError(400, "Invalid news payload.");
    try {
      return await getPrisma().newsPost.create({
        data: {
          title: parsed.data.title,
          slug: parsed.data.slug,
          excerpt: nullable(parsed.data.excerpt),
          imagePath: nullable(parsed.data.imagePath),
          imageAlt: nullable(parsed.data.imageAlt),
          galleryId: parsed.data.galleryId ?? null,
          isPublished: parsed.data.isPublished ?? false,
          publishedAt: parsed.data.publishedAt ?? null,
        },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async updateNews(id: string | undefined, payload: unknown) {
    requireUuid(id);
    const parsed = newsPayloadSchema.safeParse(payload);
    if (!parsed.success) throw new ResponseError(400, "Invalid news payload.");
    try {
      return await getPrisma().newsPost.update({
        where: { id },
        data: {
          title: parsed.data.title,
          slug: parsed.data.slug,
          excerpt: nullable(parsed.data.excerpt),
          imagePath: nullable(parsed.data.imagePath),
          imageAlt: nullable(parsed.data.imageAlt),
          galleryId: parsed.data.galleryId ?? null,
          isPublished: parsed.data.isPublished ?? false,
          publishedAt: parsed.data.publishedAt ?? null,
        },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async deleteNews(id: string | undefined) {
    requireUuid(id);
    try {
      await getPrisma().newsPost.delete({ where: { id } });
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}
