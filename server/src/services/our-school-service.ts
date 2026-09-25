import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { ResponseError } from "../error/response-error";
import {
  OurSchoolRepository,
  type OurSchoolUpdateData,
  type OurSchoolWithGallery,
} from "../repositories/our-school-repository";

type OurSchoolGallery = NonNullable<OurSchoolWithGallery["gallery"]>;

const ourSchoolCreateSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z
    .string()
    .trim()
    .transform((value) => value || null)
    .nullable()
    .optional(),
  content: z.custom<Prisma.InputJsonValue | null>().nullable().optional(),
  galleryId: z.string().uuid().nullable().optional(),
  featuredImageId: z.string().uuid().nullable().optional(),
});

const ourSchoolUpdateSchema = ourSchoolCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field is required." },
);

function requireUuid(
  id: string | undefined,
  label = "id",
): asserts id is string {
  if (!id || !z.string().uuid().safeParse(id).success) {
    throw new ResponseError(400, `Valid UUID ${label} is required.`);
  }
}

function parseCreate(payload: unknown) {
  const result = ourSchoolCreateSchema.safeParse(payload);
  if (!result.success) throw new ResponseError(400, "Invalid Our School payload.");
  return result.data;
}

function parseUpdate(payload: unknown): OurSchoolUpdateData {
  const result = ourSchoolUpdateSchema.safeParse(payload);
  if (!result.success) throw new ResponseError(400, "Invalid Our School payload.");
  return result.data;
}

function imageResponse(image: OurSchoolGallery["images"][number]) {
  return {
    ...image,
    previewPath: `/admin/gallery-images/${image.id}/file`,
  };
}

function videoResponse(video: OurSchoolGallery["videos"][number]) {
  return {
    ...video,
    previewPath:
      video.sourceType === "UPLOAD"
        ? `/admin/gallery-videos/${video.id}/file`
        : null,
  };
}

function ourSchoolResponse(item: OurSchoolWithGallery) {
  return {
    ...item,
    gallery: item.gallery
      ? {
          ...item.gallery,
          images: item.gallery.images.map(imageResponse),
          videos: item.gallery.videos.map(videoResponse),
        }
      : null,
    featuredImage: item.featuredImage
      ? imageResponse(item.featuredImage)
      : null,
  };
}

function handleDatabaseError(error: unknown): never {
  const prismaError = error as { code?: string };

  if (prismaError.code === "P2003") {
    throw new ResponseError(400, "Selected gallery does not exist.");
  }

  if (prismaError.code === "P2025") {
    throw new ResponseError(404, "Our School content not found.");
  }

  throw error;
}

async function validateFeaturedImageSelection(
  featuredImageId: string | null | undefined,
  galleryId: string | null | undefined,
) {
  if (!featuredImageId) return;

  if (!galleryId) {
    throw new ResponseError(
      400,
      "Selected gallery is required when selecting a featured image.",
    );
  }

  const image = await OurSchoolRepository.findImageById(featuredImageId);
  if (!image) {
    throw new ResponseError(400, "Selected featured image does not exist.");
  }

  if (image.galleryId !== galleryId) {
    throw new ResponseError(
      400,
      "Selected featured image must belong to the selected gallery.",
    );
  }
}

export class OurSchoolService {
  static async list() {
    const items = await OurSchoolRepository.list();
    return items.map(ourSchoolResponse);
  }

  static async get(id: string | undefined) {
    requireUuid(id);
    const item = await OurSchoolRepository.findById(id);
    if (!item) throw new ResponseError(404, "Our School content not found.");
    return ourSchoolResponse(item);
  }

  static async create(payload: unknown) {
    const data = parseCreate(payload);
    await validateFeaturedImageSelection(data.featuredImageId, data.galleryId);

    try {
      return ourSchoolResponse(await OurSchoolRepository.create(data));
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async update(id: string | undefined, payload: unknown) {
    requireUuid(id);
    const data = parseUpdate(payload);

    const existing = await OurSchoolRepository.findById(id);
    if (!existing) throw new ResponseError(404, "Our School content not found.");

    const nextGalleryId =
      data.galleryId !== undefined ? data.galleryId : existing.galleryId;
    const nextFeaturedImageId =
      data.featuredImageId !== undefined
        ? data.featuredImageId
        : existing.featuredImageId;
    await validateFeaturedImageSelection(nextFeaturedImageId, nextGalleryId);

    try {
      return ourSchoolResponse(
        await OurSchoolRepository.update(id, data),
      );
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async delete(id: string | undefined) {
    requireUuid(id);

    try {
      await OurSchoolRepository.delete(id);
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}
