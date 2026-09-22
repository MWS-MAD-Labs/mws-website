import type { Prisma } from "@prisma/client";
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

export type NewsPostWithGallery = Prisma.NewsPostGetPayload<{
  include: typeof newsInclude;
}>;

export class PageDataRepository {
  static async listActivePrograms(): Promise<ProgramWithAdmissions[]> {
    return getPrisma().program.findMany({
      where: { isActive: true },
      include: programInclude,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }

  static async getLatestOurSchool(): Promise<OurSchoolPageRecord | null> {
    return getPrisma().ourSchool.findFirst({
      include: ourSchoolInclude,
      orderBy: { updatedAt: "desc" },
    });
  }

  static async getCommunityStoriesPage(): Promise<CommunityStoriesPageRecord | null> {
    return getPrisma().communityStoriesPage.findFirst({
      where: { isPublished: true },
      include: communityPageInclude,
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

  static async listCommunityVoices() {
    return getPrisma().communityVoice.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }
}
