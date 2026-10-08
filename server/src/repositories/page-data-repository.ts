import type { Academic, Prisma } from "@prisma/client";
import { getPrisma } from "../lib/prisma";

const galleryInclude = {
  images: {
    orderBy: [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }],
  },
  videos: {
    orderBy: [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }],
  },
};

const programInclude = {
  gallery: { include: galleryInclude },
  admissions: {
    where: { isActive: true },
    include: { gallery: { include: galleryInclude } },
    orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
  },
};

const ourSchoolInclude = {
  gallery: { include: galleryInclude },
  featuredImage: true,
};

const communityPageInclude = {
  gallery: { include: galleryInclude },
};

const admissionPageInclude = {
  gallery: { include: galleryInclude },
};

const newsInclude = {
  category: true,
};

export type ProgramWithAdmissions = Prisma.ProgramGetPayload<{
  include: typeof programInclude;
}>;

export type OurSchoolPageRecord = Prisma.OurSchoolGetPayload<{
  include: typeof ourSchoolInclude;
}>;

export type CommunityStoriesPageRecord = Prisma.CommunityStoriesPageGetPayload<{
  include: typeof communityPageInclude;
}>;

export type AdmissionPageRecord = Prisma.AdmissionPageGetPayload<{
  include: typeof admissionPageInclude;
}>;

export type NewsPostWithGallery = Prisma.NewsPostGetPayload<{
  include: typeof newsInclude;
}>;

export class PageDataRepository {
  static async getLatestAcademicOverview(): Promise<Academic | null> {
    return getPrisma().academic.findFirst({
      orderBy: { updatedAt: "desc" },
    });
  }

  static async listActivePrograms(): Promise<ProgramWithAdmissions[]> {
    return getPrisma().program.findMany({
      where: { isActive: true },
      include: programInclude,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }

  static async getLatestOurSchool(): Promise<OurSchoolPageRecord | null> {
    const records = await getPrisma().ourSchool.findMany({
      include: ourSchoolInclude,
      orderBy: { updatedAt: "desc" },
      take: 20,
    });

    return (
      records.find((record) => {
        const content = record.content;
        return !(
          content &&
          typeof content === "object" &&
          !Array.isArray(content) &&
          "status" in content &&
          content.status === "DRAFT"
        );
      }) ?? null
    );
  }

  static async getCommunityStoriesPage(): Promise<CommunityStoriesPageRecord | null> {
    return getPrisma().communityStoriesPage.findFirst({
      where: { isPublished: true },
      include: communityPageInclude,
      orderBy: { updatedAt: "desc" },
    });
  }

  static async getAdmissionsPage(): Promise<AdmissionPageRecord | null> {
    return getPrisma().admissionPage.findFirst({
      where: { isPublished: true },
      include: admissionPageInclude,
      orderBy: { updatedAt: "desc" },
    });
  }

  static async listPublishedNews(limit = 4): Promise<NewsPostWithGallery[]> {
    return getPrisma().newsPost.findMany({
      where: {
        status: "PUBLISHED",
        isPublished: true,
        publishedAt: { not: null, lte: new Date() },
      },
      include: newsInclude,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: limit,
    });
  }

  static async listPublishedNewsByCategory(
    categoryId: string,
    limit = 8,
  ): Promise<NewsPostWithGallery[]> {
    return getPrisma().newsPost.findMany({
      where: {
        categoryId,
        status: "PUBLISHED",
        isPublished: true,
        publishedAt: { not: null, lte: new Date() },
      },
      include: newsInclude,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: limit,
    });
  }

  static async listCommunityVoices() {
    return getPrisma().communityVoice.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }

  static async listHomeCommunityVoices() {
    return getPrisma().communityVoice.findMany({
      where: { isActive: true, showOnHome: true },
      orderBy: [{ homeSortOrder: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
      take: 5,
    });
  }

  static async getHomePageSettings() {
    return getPrisma().homePageSettings.findFirst({
      include: {
        infoSectionCategory: true,
        infoSectionCategories: {
          include: { category: true },
          orderBy: [{ sortOrder: "asc" }, { category: { name: "asc" } }],
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  static async listActiveCampusSpotlights() {
    const now = new Date();
    return getPrisma().campusSpotlight.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ activeFrom: null }, { activeFrom: { lte: now } }] },
          { OR: [{ activeUntil: null }, { activeUntil: { gte: now } }] },
        ],
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }

  static async listAdmissionFaqs() {
    return getPrisma().faq.findMany({
      where: {
        isActive: true,
        isAdmissionFaq: true,
      },
      orderBy: [{ admissionSortOrder: "asc" }, { updatedAt: "desc" }],
    });
  }

  static async getCmsPage(slug: string) {
    return getPrisma().cmsPage.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
        deletedAt: null,
      },
      orderBy: { updatedAt: "desc" },
    });
  }
}
