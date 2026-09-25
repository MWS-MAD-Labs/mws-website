import type { OurSchool, Prisma } from "@prisma/client";
import { getPrisma } from "../lib/prisma";

const galleryInclude = {
  images: {
    orderBy: [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }],
  },
  videos: {
    orderBy: [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }],
  },
} as const satisfies Prisma.GalleryInclude;

const ourSchoolInclude = {
  gallery: {
    include: galleryInclude,
  },
  featuredImage: true,
} as const satisfies Prisma.OurSchoolInclude;

export type OurSchoolWithGallery = Prisma.OurSchoolGetPayload<{
  include: typeof ourSchoolInclude;
}>;

export type OurSchoolCreateData = {
  title: string;
  description?: string | null;
  content?: Prisma.InputJsonValue | null;
  galleryId?: string | null;
  featuredImageId?: string | null;
};

export type OurSchoolUpdateData = Partial<OurSchoolCreateData>;

export class OurSchoolRepository {
  static async list(): Promise<OurSchoolWithGallery[]> {
    return getPrisma().ourSchool.findMany({
      include: ourSchoolInclude,
      orderBy: { updatedAt: "desc" },
    });
  }

  static async listRecent(limit = 20): Promise<OurSchoolWithGallery[]> {
    return getPrisma().ourSchool.findMany({
      include: ourSchoolInclude,
      orderBy: { updatedAt: "desc" },
      take: limit,
    });
  }

  static async findById(id: string): Promise<OurSchoolWithGallery | null> {
    return getPrisma().ourSchool.findUnique({
      where: { id },
      include: ourSchoolInclude,
    });
  }

  static async findImageById(id: string) {
    return getPrisma().galleryImage.findUnique({ where: { id } });
  }

  static async create(data: OurSchoolCreateData): Promise<OurSchoolWithGallery> {
    return getPrisma().ourSchool.create({
      data: data as Prisma.OurSchoolUncheckedCreateInput,
      include: ourSchoolInclude,
    });
  }

  static async update(
    id: string,
    data: OurSchoolUpdateData,
  ): Promise<OurSchoolWithGallery> {
    return getPrisma().ourSchool.update({
      where: { id },
      data: data as Prisma.OurSchoolUncheckedUpdateInput,
      include: ourSchoolInclude,
    });
  }

  static async delete(id: string): Promise<OurSchool> {
    return getPrisma().ourSchool.delete({ where: { id } });
  }
}
