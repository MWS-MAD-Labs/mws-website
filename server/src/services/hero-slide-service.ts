import { HeroSlideMediaType, HeroSlideSourceType, type HeroSlide } from "@prisma/client";
import { z } from "zod";
import { ResponseError } from "../error/response-error";
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
      return heroSlideResponse(await HeroSlideRepository.create(parseCreate(payload)));
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async update(id: string | undefined, payload: unknown) {
    requireUuid(id);
    try {
      return heroSlideResponse(await HeroSlideRepository.update(id, parseUpdate(payload)));
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
