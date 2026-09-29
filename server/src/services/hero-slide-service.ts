import { HeroSlideMediaType, HeroSlideSourceType, type HeroSlide } from "@prisma/client";
import { z } from "zod";
import { ResponseError } from "../error/response-error";
import { GalleryRepository } from "../repositories/gallery-repository";
import {
  HeroSlideRepository,
  type HeroSlideCreateData,
  type HeroSlideUpdateData,
} from "../repositories/hero-slide-repository";

const heroSlideSchema = z.object({
  sourceType: z.enum(HeroSlideSourceType).optional(),
  sourceId: z.string().uuid().nullable().optional(),
  title: z.string().trim().max(255).nullable().optional(),
  description: z.string().trim().nullable().optional(),
  caption: z.string().trim().nullable().optional(),
  mediaType: z.enum(HeroSlideMediaType).nullable().optional(),
  mediaPath: z.string().trim().max(1000).nullable().optional(),
  mediaAlt: z.string().trim().max(255).nullable().optional(),
  posterPath: z.string().trim().max(1000).nullable().optional(),
  isLooping: z.boolean().optional(),
  ctaLabel: z.string().trim().max(100).nullable().optional(),
  ctaUrl: z.string().trim().max(1000).nullable().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

const heroSlideUpdateSchema = heroSlideSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field is required." },
);

function requireUuid(id: string | undefined): asserts id is string {
  if (!id || !z.string().uuid().safeParse(id).success) {
    throw new ResponseError(400, "Valid UUID id is required.");
  }
}

function parseCreate(payload: unknown): HeroSlideCreateData {
  const result = heroSlideSchema.safeParse(payload);
  if (!result.success) throw new ResponseError(400, "Invalid hero slide payload.");
  return result.data;
}

function parseUpdate(payload: unknown): HeroSlideUpdateData {
  const result = heroSlideUpdateSchema.safeParse(payload);
  if (!result.success) throw new ResponseError(400, "Invalid hero slide payload.");
  return result.data;
}

const galleryImageFilePattern =
  /^\/api\/gallery-images\/([0-9a-f-]{36})\/file$/i;
const galleryVideoFilePattern =
  /^\/api\/gallery-images\/videos\/([0-9a-f-]{36})\/file$/i;

type HeroMediaFields = Pick<HeroSlide, "mediaType" | "mediaPath" | "posterPath">;

// Hero media harus menunjuk ke file Gallery yang tersimpan di MinIO dan
// disajikan lewat API, bukan asset statis atau URL eksternal.
async function assertGalleryImagePath(path: string, label: string) {
  const id = galleryImageFilePattern.exec(path)?.[1];
  if (!id) {
    throw new ResponseError(400, `${label} must be an image from the Gallery library.`);
  }

  const image = await GalleryRepository.findImageById(id);
  if (!image || image.path.startsWith("/") || image.path.startsWith("http")) {
    throw new ResponseError(400, `${label} was not found in the Gallery library.`);
  }
}

async function assertGalleryVideoPath(path: string) {
  const id = galleryVideoFilePattern.exec(path)?.[1];
  if (!id) {
    throw new ResponseError(400, "Hero video must be an uploaded video from the Gallery library.");
  }

  const video = await GalleryRepository.findVideoById(id);
  if (!video || video.sourceType !== "UPLOAD") {
    throw new ResponseError(400, "Hero video was not found in the Gallery library.");
  }
}

async function normalizeHeroMedia<T extends Partial<HeroMediaFields>>(
  data: T,
  current?: HeroMediaFields,
): Promise<T> {
  const touchesMedia =
    data.mediaType !== undefined ||
    data.mediaPath !== undefined ||
    data.posterPath !== undefined;
  if (!touchesMedia) return data;

  const mediaType =
    (data.mediaType !== undefined ? data.mediaType : current?.mediaType) ?? "IMAGE";
  const mediaPath =
    data.mediaPath !== undefined ? data.mediaPath : current?.mediaPath ?? null;
  const posterPath =
    mediaType === "VIDEO"
      ? (data.posterPath !== undefined ? data.posterPath : current?.posterPath) ?? null
      : null;

  if (mediaPath) {
    if (mediaType === "VIDEO") {
      await assertGalleryVideoPath(mediaPath);
    } else {
      await assertGalleryImagePath(mediaPath, "Hero image");
    }
  }
  if (posterPath) {
    await assertGalleryImagePath(posterPath, "Hero video poster");
  }

  return { ...data, mediaType, mediaPath: mediaPath || null, posterPath };
}

function heroSlideResponse(slide: HeroSlide) {
  return {
    id: slide.id,
    sourceType: slide.sourceType,
    sourceId: slide.sourceId,
    title: slide.title,
    description: slide.description,
    caption: slide.caption,
    mediaType: slide.mediaType,
    mediaPath: slide.mediaPath,
    mediaAlt: slide.mediaAlt,
    posterPath: slide.posterPath,
    isLooping: slide.isLooping,
    ctaLabel: slide.ctaLabel,
    ctaUrl: slide.ctaUrl,
    sortOrder: slide.sortOrder,
    isActive: slide.isActive,
    createdAt: slide.createdAt,
    updatedAt: slide.updatedAt,
  };
}

function handleDatabaseError(error: unknown): never {
  const prismaError = error as { code?: string };
  if (prismaError.code === "P2025") {
    throw new ResponseError(404, "Hero slide not found.");
  }
  throw error;
}

export class HeroSlideService {
  static async listPublic() {
    const slides = await HeroSlideRepository.listActive();
    return slides.map(heroSlideResponse);
  }

  static async listAdmin() {
    const slides = await HeroSlideRepository.listAll();
    return slides.map(heroSlideResponse);
  }

  static async create(payload: unknown) {
    try {
      const data = await normalizeHeroMedia(parseCreate(payload));
      return heroSlideResponse(await HeroSlideRepository.create(data));
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async update(id: string | undefined, payload: unknown) {
    requireUuid(id);
    const data = parseUpdate(payload);
    const current = await HeroSlideRepository.findById(id);
    if (!current) throw new ResponseError(404, "Hero slide not found.");
    try {
      return heroSlideResponse(
        await HeroSlideRepository.update(
          id,
          await normalizeHeroMedia(data as Partial<HeroMediaFields>, current),
        ),
      );
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async delete(id: string | undefined) {
    requireUuid(id);
    try {
      await HeroSlideRepository.delete(id);
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}
