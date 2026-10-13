import type {
  Gallery,
  GalleryImage,
  GalleryVideo,
  Prisma,
  VideoSourceType,
} from "@prisma/client";
import { getPrisma } from "../lib/prisma";

const galleryInclude = {
  images: {
    orderBy: [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }],
  },
  videos: {
    orderBy: [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }],
  },
};

export type GalleryWithMedia = Prisma.GalleryGetPayload<{
  include: typeof galleryInclude;
}>;

export type GalleryCreateData = {
  title: string;
  description?: string | null;
};

export type GalleryUpdateData = Partial<GalleryCreateData>;

export type GalleryImageCreateData = {
  galleryId: string;
  path: string;
  title?: string | null;
  caption?: string | null;
  sortOrder?: number;
};

export type GalleryImageUpdateData = {
  title?: string | null;
  caption?: string | null;
  sortOrder?: number;
};

export type GalleryVideoCreateData = {
  galleryId: string;
  sourceType: VideoSourceType;
  source: string;
  title?: string | null;
  caption?: string | null;
  sortOrder?: number;
};

export type GalleryVideoUpdateData = {
  title?: string | null;
  caption?: string | null;
  sortOrder?: number;
};

function galleryImagePublicPath(id: string) {
  return `/api/gallery-images/${id}/file`;
}

function galleryVideoPublicPath(id: string) {
  return `/api/gallery-images/videos/${id}/file`;
}

function like(value: string) {
  return `%${value}%`;
}

function countTotal(values: Array<number | bigint>) {
  return values.reduce<number>((total, value) => total + Number(value), 0);
}

export class GalleryRepository {
  static async listGalleries(): Promise<GalleryWithMedia[]> {
    return getPrisma().gallery.findMany({
      include: galleryInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  static async findGalleryById(id: string): Promise<GalleryWithMedia | null> {
    return getPrisma().gallery.findUnique({
      where: { id },
      include: galleryInclude,
    });
  }

  static async createGallery(
    data: GalleryCreateData,
  ): Promise<GalleryWithMedia> {
    return getPrisma().gallery.create({
      data,
      include: galleryInclude,
    });
  }

  static async updateGallery(
    id: string,
    data: GalleryUpdateData,
  ): Promise<GalleryWithMedia> {
    return getPrisma().gallery.update({
      where: { id },
      data,
      include: galleryInclude,
    });
  }

  static async deleteGallery(id: string): Promise<Gallery> {
    const prisma = getPrisma();

    return prisma.$transaction(async (tx) => {
      await tx.galleryImage.deleteMany({ where: { galleryId: id } });
      await tx.galleryVideo.deleteMany({ where: { galleryId: id } });
      return tx.gallery.delete({ where: { id } });
    });
  }

  static async countReferences(id: string): Promise<number> {
    const prisma = getPrisma();
    const [
      programs,
      admissions,
      campusTours,
      curriculums,
      affiliations,
      academics,
      kindergartens,
      elementaries,
      juniorHighs,
      ourSchools,
      contacts,
      communityStoriesPages,
    ] = await Promise.all([
      prisma.program.count({ where: { galleryId: id } }),
      prisma.admission.count({ where: { galleryId: id } }),
      prisma.campusTour.count({ where: { galleryId: id } }),
      prisma.curriculum.count({ where: { galleryId: id } }),
      prisma.affiliation.count({ where: { galleryId: id } }),
      prisma.academic.count({ where: { galleryId: id } }),
      prisma.kindergarten.count({ where: { galleryId: id } }),
      prisma.elementary.count({ where: { galleryId: id } }),
      prisma.juniorHigh.count({ where: { galleryId: id } }),
      prisma.ourSchool.count({ where: { galleryId: id } }),
      prisma.contact.count({ where: { galleryId: id } }),
      prisma.communityStoriesPage.count({ where: { galleryId: id } }),
    ]);

    return [
      programs,
      admissions,
      campusTours,
      curriculums,
      affiliations,
      academics,
      kindergartens,
      elementaries,
      juniorHighs,
      ourSchools,
      contacts,
      communityStoriesPages,
    ].reduce((total, count) => total + count, 0);
  }

  static async createImage(
    data: GalleryImageCreateData,
  ): Promise<GalleryImage> {
    return getPrisma().galleryImage.create({ data });
  }

  static async findImageById(id: string): Promise<GalleryImage | null> {
    return getPrisma().galleryImage.findUnique({ where: { id } });
  }

  static async updateImage(
    id: string,
    data: GalleryImageUpdateData,
  ): Promise<GalleryImage> {
    return getPrisma().galleryImage.update({ where: { id }, data });
  }

  static async deleteImage(id: string): Promise<GalleryImage> {
    return getPrisma().galleryImage.delete({ where: { id } });
  }

  static async countImageReferences(image: GalleryImage): Promise<number> {
    const prisma = getPrisma();
    const publicPath = galleryImagePublicPath(image.id);
    const pathMatches = [{ equals: publicPath }, { equals: image.path }];
    const jsonPublicPath = like(publicPath);
    const jsonObjectPath = like(image.path);

    const [
      ourSchools,
      heroSlides,
      popups,
      newsPosts,
      programs,
      academics,
      kindergartens,
      elementaries,
      juniorHighs,
      communityStoriesPages,
      communityVoices,
      campusSpotlights,
      jsonRows,
    ] = await Promise.all([
      prisma.ourSchool.count({ where: { featuredImageId: image.id } }),
      prisma.heroSlide.count({
        where: {
          OR: [
            ...pathMatches.map((match) => ({ mediaPath: match })),
            ...pathMatches.map((match) => ({ posterPath: match })),
          ],
        },
      }),
      prisma.popupPromoted.count({
        where: { OR: pathMatches.map((match) => ({ posterImagePath: match })) },
      }),
      prisma.newsPost.count({
        where: { OR: pathMatches.map((match) => ({ coverImage: match })) },
      }),
      prisma.program.count({
        where: { OR: pathMatches.map((match) => ({ imagePath: match })) },
      }),
      prisma.academic.count({
        where: { OR: pathMatches.map((match) => ({ coverImage: match })) },
      }),
      prisma.kindergarten.count({
        where: {
          OR: [
            ...pathMatches.map((match) => ({ coverImage: match })),
            ...pathMatches.map((match) => ({ publishedCoverImage: match })),
          ],
        },
      }),
      prisma.elementary.count({
        where: {
          OR: [
            ...pathMatches.map((match) => ({ coverImage: match })),
            ...pathMatches.map((match) => ({ publishedCoverImage: match })),
          ],
        },
      }),
      prisma.juniorHigh.count({
        where: {
          OR: [
            ...pathMatches.map((match) => ({ coverImage: match })),
            ...pathMatches.map((match) => ({ publishedCoverImage: match })),
          ],
        },
      }),
      prisma.communityStoriesPage.count({
        where: { OR: pathMatches.map((match) => ({ heroImagePath: match })) },
      }),
      prisma.communityVoice.count({
        where: { OR: pathMatches.map((match) => ({ imagePath: match })) },
      }),
      prisma.campusSpotlight.count({
        where: { OR: pathMatches.map((match) => ({ imagePath: match })) },
      }),
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT
          (
            (SELECT COUNT(*) FROM "NewsPost" WHERE "content"::text LIKE ${jsonPublicPath} OR "content"::text LIKE ${jsonObjectPath}) +
            (SELECT COUNT(*) FROM "AdmissionPage" WHERE "content"::text LIKE ${jsonPublicPath} OR "content"::text LIKE ${jsonObjectPath}) +
            (SELECT COUNT(*) FROM "OurSchool" WHERE "content"::text LIKE ${jsonPublicPath} OR "content"::text LIKE ${jsonObjectPath}) +
            (SELECT COUNT(*) FROM "CmsPage" WHERE "body"::text LIKE ${jsonPublicPath} OR "body"::text LIKE ${jsonObjectPath}) +
            (SELECT COUNT(*) FROM "Academic" WHERE "content"::text LIKE ${jsonPublicPath} OR "content"::text LIKE ${jsonObjectPath}) +
            (SELECT COUNT(*) FROM "Kindergarten" WHERE "hero"::text LIKE ${jsonPublicPath} OR "hero"::text LIKE ${jsonObjectPath} OR "overview"::text LIKE ${jsonPublicPath} OR "overview"::text LIKE ${jsonObjectPath} OR "sections"::text LIKE ${jsonPublicPath} OR "sections"::text LIKE ${jsonObjectPath} OR "publishedHero"::text LIKE ${jsonPublicPath} OR "publishedHero"::text LIKE ${jsonObjectPath} OR "publishedOverview"::text LIKE ${jsonPublicPath} OR "publishedOverview"::text LIKE ${jsonObjectPath} OR "publishedSections"::text LIKE ${jsonPublicPath} OR "publishedSections"::text LIKE ${jsonObjectPath}) +
            (SELECT COUNT(*) FROM "Elementary" WHERE "hero"::text LIKE ${jsonPublicPath} OR "hero"::text LIKE ${jsonObjectPath} OR "overview"::text LIKE ${jsonPublicPath} OR "overview"::text LIKE ${jsonObjectPath} OR "sections"::text LIKE ${jsonPublicPath} OR "sections"::text LIKE ${jsonObjectPath} OR "publishedHero"::text LIKE ${jsonPublicPath} OR "publishedHero"::text LIKE ${jsonObjectPath} OR "publishedOverview"::text LIKE ${jsonPublicPath} OR "publishedOverview"::text LIKE ${jsonObjectPath} OR "publishedSections"::text LIKE ${jsonPublicPath} OR "publishedSections"::text LIKE ${jsonObjectPath}) +
            (SELECT COUNT(*) FROM "JuniorHigh" WHERE "hero"::text LIKE ${jsonPublicPath} OR "hero"::text LIKE ${jsonObjectPath} OR "overview"::text LIKE ${jsonPublicPath} OR "overview"::text LIKE ${jsonObjectPath} OR "sections"::text LIKE ${jsonPublicPath} OR "sections"::text LIKE ${jsonObjectPath} OR "publishedHero"::text LIKE ${jsonPublicPath} OR "publishedHero"::text LIKE ${jsonObjectPath} OR "publishedOverview"::text LIKE ${jsonPublicPath} OR "publishedOverview"::text LIKE ${jsonObjectPath} OR "publishedSections"::text LIKE ${jsonPublicPath} OR "publishedSections"::text LIKE ${jsonObjectPath})
          )::bigint AS count
      `,
    ]);

    return countTotal([
      ourSchools,
      heroSlides,
      popups,
      newsPosts,
      programs,
      academics,
      kindergartens,
      elementaries,
      juniorHighs,
      communityStoriesPages,
      communityVoices,
      campusSpotlights,
      jsonRows[0]?.count ?? 0,
    ]);
  }

  static async createVideo(
    data: GalleryVideoCreateData,
  ): Promise<GalleryVideo> {
    return getPrisma().galleryVideo.create({ data });
  }

  static async findVideoById(id: string): Promise<GalleryVideo | null> {
    return getPrisma().galleryVideo.findUnique({ where: { id } });
  }

  static async updateVideo(
    id: string,
    data: GalleryVideoUpdateData,
  ): Promise<GalleryVideo> {
    return getPrisma().galleryVideo.update({ where: { id }, data });
  }

  static async deleteVideo(id: string): Promise<GalleryVideo> {
    return getPrisma().galleryVideo.delete({ where: { id } });
  }

  static async countVideoReferences(video: GalleryVideo): Promise<number> {
    const prisma = getPrisma();
    const publicPath = galleryVideoPublicPath(video.id);
    const pathMatches = [{ equals: publicPath }, { equals: video.source }];
    const jsonPublicPath = like(publicPath);
    const jsonObjectPath = like(video.source);

    const [heroSlides, jsonRows] = await Promise.all([
      prisma.heroSlide.count({
        where: { OR: pathMatches.map((match) => ({ mediaPath: match })) },
      }),
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT
          (
            (SELECT COUNT(*) FROM "NewsPost" WHERE "content"::text LIKE ${jsonPublicPath} OR "content"::text LIKE ${jsonObjectPath}) +
            (SELECT COUNT(*) FROM "AdmissionPage" WHERE "content"::text LIKE ${jsonPublicPath} OR "content"::text LIKE ${jsonObjectPath}) +
            (SELECT COUNT(*) FROM "OurSchool" WHERE "content"::text LIKE ${jsonPublicPath} OR "content"::text LIKE ${jsonObjectPath}) +
            (SELECT COUNT(*) FROM "CmsPage" WHERE "body"::text LIKE ${jsonPublicPath} OR "body"::text LIKE ${jsonObjectPath})
          )::bigint AS count
      `,
    ]);

    return countTotal([heroSlides, jsonRows[0]?.count ?? 0]);
  }
}
