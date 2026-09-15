import type { Gallery, GalleryImage, Prisma } from "@prisma/client";
import { getPrisma } from "../lib/prisma";

const galleryInclude = {
  images: { orderBy: [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }] },
  videos: { orderBy: [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }] },
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

  static async createGallery(data: GalleryCreateData): Promise<GalleryWithMedia> {
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
}
