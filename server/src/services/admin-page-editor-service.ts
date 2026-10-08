import { z } from "zod";
import { Prisma, type NewsPost } from "@prisma/client";
import { ResponseError } from "../error/response-error";
import { getPrisma } from "../lib/prisma";
import { GalleryService } from "./gallery-service";
import { PageDataService } from "./page-data-service";

const optionalText = (max?: number) => {
  const schema = z.string().trim();
  return max
    ? schema.max(max).nullable().optional()
    : schema.nullable().optional();
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
  content: z.custom<unknown>().nullable().optional(),
  galleryId: z.string().uuid().nullable().optional(),
  isPublished: z.boolean().optional(),
  programs: z.array(admissionProgramSchema).min(1),
});

const homeSettingsPayloadSchema = z.object({
  infoSectionTitle: z.string().trim().min(1).max(255).optional(),
  infoSectionCategoryId: z.string().uuid().nullable().optional(),
  infoSectionCategoryIds: z.array(z.string().uuid()).max(5).optional(),
});

const campusSpotlightSchema = z.object({
  text: z.string().trim().min(1),
  cite: z.string().trim().min(1).max(255),
  imagePath: optionalText(1000),
  imageAlt: optionalText(255),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  activeFrom: z.coerce.date().nullable().optional(),
  activeUntil: z.coerce.date().nullable().optional(),
});

const communityVoiceSchema = z.object({
  role: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(255),
  grade: z.string().trim().max(255).nullable().optional(),
  quote: z.string().trim().min(1),
  imagePath: z.string().trim().min(1).max(1000),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  showOnHome: z.boolean().optional(),
  homeSortOrder: z.number().int().optional(),
});

const cmsGuidelinesPayloadSchema = z.object({
  body: z.custom<unknown>(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

const communityStoriesPayloadSchema = z.object({
  title: z.string().trim().min(1).max(255),
  heroImagePath: optionalText(1000),
  heroImageAlt: optionalText(255),
  introTitle: optionalText(500),
  introBody: z.array(z.string().trim().min(1)).min(1),
  activityTitle: optionalText(255),
  activityDescription: optionalText(),
  galleryId: z.string().uuid().nullable().optional(),
  isPublished: z.boolean().optional(),
});

const newsPayloadSchema = z.object({
  title: z.string().trim().min(1).max(500),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
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

function jsonRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function communityNewsResponse(news: NewsPost) {
  return {
    id: news.id,
    title: news.title,
    slug: news.slug,
    excerpt: news.excerpt,
    imagePath: news.coverImage,
    imageAlt: news.coverImageAlt,
    galleryId: null,
    isPublished: news.isPublished,
    publishedAt: news.publishedAt,
    createdAt: news.createdAt,
    updatedAt: news.updatedAt,
  };
}

function communityVoiceResponse(voice: {
  id: string;
  role: string;
  name: string;
  grade: string | null;
  quote: string;
  imagePath: string;
  sortOrder: number;
  isActive: boolean;
  showOnHome: boolean;
  homeSortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: voice.id,
    role: voice.role,
    name: voice.name,
    grade: voice.grade,
    quote: voice.quote,
    imagePath: voice.imagePath,
    sortOrder: voice.sortOrder,
    isActive: voice.isActive,
    showOnHome: voice.showOnHome,
    homeSortOrder: voice.homeSortOrder,
    createdAt: voice.createdAt,
    updatedAt: voice.updatedAt,
  };
}

async function assertHomeVoiceLimit(input: {
  excludeId?: string;
  isActive?: boolean;
  showOnHome?: boolean;
}) {
  if (!input.showOnHome || input.isActive === false) return;

  const selectedCount = await getPrisma().communityVoice.count({
    where: {
      isActive: true,
      showOnHome: true,
      ...(input.excludeId ? { id: { not: input.excludeId } } : {}),
    },
  });

  if (selectedCount >= 5) {
    throw new ResponseError(409, "Home can show up to 5 community voices.");
  }
}

function campusSpotlightResponse(spotlight: {
  id: string;
  text: string;
  cite: string;
  imagePath: string | null;
  imageAlt: string | null;
  sortOrder: number;
  isActive: boolean;
  activeFrom: Date | null;
  activeUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: spotlight.id,
    text: spotlight.text,
    cite: spotlight.cite,
    imagePath: spotlight.imagePath,
    imageAlt: spotlight.imageAlt,
    sortOrder: spotlight.sortOrder,
    isActive: spotlight.isActive,
    activeFrom: spotlight.activeFrom,
    activeUntil: spotlight.activeUntil,
    createdAt: spotlight.createdAt,
    updatedAt: spotlight.updatedAt,
  };
}

function requireUuid(id: string | undefined): asserts id is string {
  if (!id || !z.string().uuid().safeParse(id).success) {
    throw new ResponseError(400, "Valid UUID id is required.");
  }
}

function isUuid(id: string | null | undefined): id is string {
  return Boolean(id && z.string().uuid().safeParse(id).success);
}

async function findOrCreateProgram(
  data: z.infer<typeof admissionProgramSchema>,
  index: number,
) {
  const prisma = getPrisma();
  if (isUuid(data.id)) {
    const existing = await prisma.program.findUnique({
      where: { id: data.id },
    });
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

function adminProgramResponse(
  program: Awaited<ReturnType<typeof getAdminPrograms>>[number],
) {
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
    throw new ResponseError(
      409,
      "A record with the same unique value already exists.",
    );
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
  static async getHomeContentAdmin() {
    const prisma = getPrisma();
    const [settings, categories, spotlights] = await Promise.all([
      prisma.homePageSettings.findFirst({
        include: {
          infoSectionCategories: {
            orderBy: [{ sortOrder: "asc" }],
          },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.newsCategory.findMany({
        include: { _count: { select: { posts: true } } },
        orderBy: [{ isActive: "desc" }, { name: "asc" }],
      }),
      prisma.campusSpotlight.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
    ]);

    return {
      settings: {
        id: settings?.id ?? null,
        infoSectionTitle:
          settings?.infoSectionTitle ?? "Everything you need to know about joining MWS.",
        infoSectionCategoryId: settings?.infoSectionCategoryId ?? null,
        infoSectionCategoryIds: settings?.infoSectionCategories.length
          ? settings.infoSectionCategories.map((item) => item.categoryId)
          : settings?.infoSectionCategoryId
            ? [settings.infoSectionCategoryId]
            : [],
        updatedAt: settings?.updatedAt ?? null,
      },
      categories,
      spotlights: spotlights.map(campusSpotlightResponse),
    };
  }

  static async saveHomeSettings(payload: unknown) {
    const parsed = homeSettingsPayloadSchema.safeParse(payload);
    if (!parsed.success) throw new ResponseError(400, "Invalid home settings payload.");

    const prisma = getPrisma();
    const existing = await prisma.homePageSettings.findFirst({
      orderBy: { updatedAt: "desc" },
    });
    const data = {
      infoSectionTitle:
        parsed.data.infoSectionTitle ?? "Everything you need to know about joining MWS.",
      infoSectionCategoryId:
        parsed.data.infoSectionCategoryIds?.[0] ??
        parsed.data.infoSectionCategoryId ??
        null,
    };

    try {
      let settingsId: string;
      if (existing) {
        const updated = await prisma.homePageSettings.update({
          where: { id: existing.id },
          data,
        });
        settingsId = updated.id;
      } else {
        const created = await prisma.homePageSettings.create({ data });
        settingsId = created.id;
      }

      if (parsed.data.infoSectionCategoryIds) {
        await prisma.homeInfoSectionCategory.deleteMany({
          where: { homePageSettingsId: settingsId },
        });
        if (parsed.data.infoSectionCategoryIds.length) {
          await prisma.homeInfoSectionCategory.createMany({
            data: parsed.data.infoSectionCategoryIds.map((categoryId, index) => ({
              categoryId,
              homePageSettingsId: settingsId,
              sortOrder: index,
            })),
            skipDuplicates: true,
          });
        }
      }
      return this.getHomeContentAdmin();
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async createCampusSpotlight(payload: unknown) {
    const parsed = campusSpotlightSchema.safeParse(payload);
    if (!parsed.success)
      throw new ResponseError(400, "Invalid campus spotlight payload.");

    try {
      const spotlight = await getPrisma().campusSpotlight.create({
        data: {
          text: parsed.data.text,
          cite: parsed.data.cite,
          imagePath: nullable(parsed.data.imagePath),
          imageAlt: nullable(parsed.data.imageAlt),
          sortOrder: parsed.data.sortOrder ?? 0,
          isActive: parsed.data.isActive ?? true,
          activeFrom: parsed.data.activeFrom ?? null,
          activeUntil: parsed.data.activeUntil ?? null,
        },
      });
      return campusSpotlightResponse(spotlight);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async updateCampusSpotlight(id: string | undefined, payload: unknown) {
    requireUuid(id);
    const parsed = campusSpotlightSchema.partial().safeParse(payload);
    if (!parsed.success)
      throw new ResponseError(400, "Invalid campus spotlight payload.");

    try {
      const spotlight = await getPrisma().campusSpotlight.update({
        where: { id },
        data: parsed.data,
      });
      return campusSpotlightResponse(spotlight);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async deleteCampusSpotlight(id: string | undefined) {
    requireUuid(id);
    try {
      await getPrisma().campusSpotlight.delete({ where: { id } });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async getAdmissions() {
    const [programs, galleries, record] = await Promise.all([
      getAdminPrograms(),
      GalleryService.listGalleries(),
      getPrisma().admissionPage.findFirst({
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    const fallback = await PageDataService.getAdmissions();
    const page = {
      id: record?.id ?? null,
      title: record?.title ?? "Admission",
      description: record?.description ?? null,
      content: record?.content ?? fallback.content,
      galleryId: record?.galleryId ?? null,
      isPublished: record?.isPublished ?? true,
      updatedAt: record?.updatedAt ?? null,
    };

    if (programs.length) {
      return {
        page,
        programs: programs.map(adminProgramResponse),
        galleries,
      };
    }

    return {
      page,
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
    if (!parsed.success)
      throw new ResponseError(400, "Invalid admissions payload.");

    const prisma = getPrisma();

    try {
      const existingPage = await prisma.admissionPage.findFirst({
        orderBy: { updatedAt: "desc" },
      });
      const pageContent = jsonRecord(parsed.data.content);
      const pageJsonContent = pageContent
        ? (pageContent as Prisma.InputJsonValue)
        : Prisma.JsonNull;
      const pageTitle =
        typeof pageContent?.heroTitle === "string" && pageContent.heroTitle.trim()
          ? pageContent.heroTitle.trim()
          : "Admission";
      const pageDescription =
        typeof pageContent?.heroSubtitle === "string"
          ? nullable(pageContent.heroSubtitle)
          : null;

      if (existingPage) {
        await prisma.admissionPage.update({
          where: { id: existingPage.id },
          data: {
            title: pageTitle,
            description: pageDescription,
            content: pageJsonContent,
            galleryId: parsed.data.galleryId ?? null,
            isPublished: parsed.data.isPublished ?? false,
          },
        });
      } else {
        await prisma.admissionPage.create({
          data: {
            title: pageTitle,
            description: pageDescription,
            content: pageJsonContent,
            galleryId: parsed.data.galleryId ?? null,
            isPublished: parsed.data.isPublished ?? false,
          },
        });
      }

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
          ? await prisma.admission.findUnique({
              where: { id: programData.admissionId },
            })
          : await prisma.admission.findFirst({
              where: { programId: program.id },
            });

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
    const [publicPage, galleries, news, voices] = await Promise.all([
      PageDataService.getCommunityStories(),
      GalleryService.listGalleries(),
      getPrisma().newsPost.findMany({
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      }),
      getPrisma().communityVoice.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
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
        introBody: Array.isArray(record?.introBody)
          ? record.introBody
          : publicPage.introBody,
        activityTitle: record?.activityTitle ?? publicPage.activityTitle,
        activityDescription:
          record?.activityDescription ?? publicPage.activityDescription,
        galleryId: record?.galleryId ?? null,
        isPublished: record?.isPublished ?? true,
      },
      galleries,
      news: news.map(communityNewsResponse),
      voices: voices.map(communityVoiceResponse),
    };
  }

  static async listCommunityVoicesAdmin() {
    try {
      const voices = await getPrisma().communityVoice.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });
      return voices.map(communityVoiceResponse);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async saveCommunityStoriesPage(payload: unknown) {
    const parsed = communityStoriesPayloadSchema.safeParse(payload);
    if (!parsed.success)
      throw new ResponseError(400, "Invalid community stories payload.");

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
      activityTitle: nullable(parsed.data.activityTitle),
      activityDescription: nullable(parsed.data.activityDescription),
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
      const news = await getPrisma().newsPost.create({
        data: {
          title: parsed.data.title,
          slug: parsed.data.slug,
          excerpt: nullable(parsed.data.excerpt),
          coverImage: nullable(parsed.data.imagePath),
          coverImageAlt: nullable(parsed.data.imageAlt),
          content: {
            format: "plain_text",
            text: nullable(parsed.data.excerpt) ?? "",
          },
          status: parsed.data.isPublished ? "PUBLISHED" : "DRAFT",
          isPublished: parsed.data.isPublished ?? false,
          publishedAt: parsed.data.isPublished
            ? (parsed.data.publishedAt ?? new Date())
            : (parsed.data.publishedAt ?? null),
        },
      });
      return communityNewsResponse(news);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async updateNews(id: string | undefined, payload: unknown) {
    requireUuid(id);
    const parsed = newsPayloadSchema.safeParse(payload);
    if (!parsed.success) throw new ResponseError(400, "Invalid news payload.");
    try {
      const news = await getPrisma().newsPost.update({
        where: { id },
        data: {
          title: parsed.data.title,
          slug: parsed.data.slug,
          excerpt: nullable(parsed.data.excerpt),
          coverImage: nullable(parsed.data.imagePath),
          coverImageAlt: nullable(parsed.data.imageAlt),
          status: parsed.data.isPublished ? "PUBLISHED" : "DRAFT",
          isPublished: parsed.data.isPublished ?? false,
          publishedAt: parsed.data.isPublished
            ? (parsed.data.publishedAt ?? new Date())
            : (parsed.data.publishedAt ?? null),
        },
      });
      return communityNewsResponse(news);
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

  static async createCommunityVoice(payload: unknown) {
    const parsed = communityVoiceSchema.safeParse(payload);
    if (!parsed.success)
      throw new ResponseError(400, "Invalid community voice payload.");

    try {
      await assertHomeVoiceLimit({
        isActive: parsed.data.isActive ?? true,
        showOnHome: parsed.data.showOnHome ?? false,
      });

      const voice = await getPrisma().communityVoice.create({
        data: {
          role: parsed.data.role,
          name: parsed.data.name,
          grade: nullable(parsed.data.grade),
          quote: parsed.data.quote,
          imagePath: parsed.data.imagePath,
          sortOrder: parsed.data.sortOrder ?? 0,
          isActive: parsed.data.isActive ?? true,
          showOnHome: parsed.data.showOnHome ?? false,
          homeSortOrder: parsed.data.homeSortOrder ?? parsed.data.sortOrder ?? 0,
        },
      });
      return communityVoiceResponse(voice);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async updateCommunityVoice(id: string | undefined, payload: unknown) {
    requireUuid(id);
    const parsed = communityVoiceSchema.partial().safeParse(payload);
    if (!parsed.success)
      throw new ResponseError(400, "Invalid community voice payload.");

    try {
      const existing = await getPrisma().communityVoice.findUnique({
        where: { id },
        select: { isActive: true, showOnHome: true },
      });
      if (!existing) throw new ResponseError(404, "Community voice not found.");

      await assertHomeVoiceLimit({
        excludeId: id,
        isActive: parsed.data.isActive ?? existing.isActive,
        showOnHome: parsed.data.showOnHome ?? existing.showOnHome,
      });

      const voice = await getPrisma().communityVoice.update({
        where: { id },
        data: {
          ...parsed.data,
          grade:
            parsed.data.grade === undefined
              ? undefined
              : nullable(parsed.data.grade),
        },
      });
      return communityVoiceResponse(voice);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async deleteCommunityVoice(id: string | undefined) {
    requireUuid(id);
    try {
      await getPrisma().communityVoice.delete({ where: { id } });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async getAdmissionGuidelinesAdmin() {
    const page = await getPrisma().cmsPage.findFirst({
      where: { slug: "admission-guidelines", deletedAt: null },
      orderBy: { updatedAt: "desc" },
    });

    return {
      id: page?.id ?? null,
      slug: "admission-guidelines",
      title: page?.title ?? "Admission Guidelines",
      body: page?.body ?? null,
      status: page?.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      publishedAt: page?.publishedAt ?? null,
      updatedAt: page?.updatedAt ?? null,
    };
  }

  static async saveAdmissionGuidelines(payload: unknown) {
    const parsed = cmsGuidelinesPayloadSchema.safeParse(payload);
    if (!parsed.success)
      throw new ResponseError(400, "Invalid admission guidelines payload.");

    const prisma = getPrisma();
    const existing = await prisma.cmsPage.findFirst({
      where: { slug: "admission-guidelines", deletedAt: null },
      orderBy: { updatedAt: "desc" },
    });
    const body = jsonRecord(parsed.data.body) ?? {};
    const title =
      typeof body.title === "string" && body.title.trim()
        ? body.title.trim()
        : "Admission Guidelines";
    const status = parsed.data.status ?? "DRAFT";

    try {
      if (existing) {
        await prisma.cmsPage.update({
          where: { id: existing.id },
          data: {
            title,
            body: body as Prisma.InputJsonValue,
            template: "admission-guidelines",
            status,
            publishedAt: status === "PUBLISHED" ? new Date() : existing.publishedAt,
          },
        });
      } else {
        await prisma.cmsPage.create({
          data: {
            slug: "admission-guidelines",
            title,
            body: body as Prisma.InputJsonValue,
            template: "admission-guidelines",
            status,
            publishedAt: status === "PUBLISHED" ? new Date() : null,
          },
        });
      }

      return this.getAdmissionGuidelinesAdmin();
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}
