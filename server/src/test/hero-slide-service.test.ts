import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import type { GalleryImage, GalleryVideo, HeroSlide } from "@prisma/client";
import { GalleryRepository } from "../repositories/gallery-repository";
import { HeroSlideRepository } from "../repositories/hero-slide-repository";
import { HeroSlideService } from "../services/hero-slide-service";

const imageId = "11111111-1111-4111-8111-111111111111";
const videoId = "22222222-2222-4222-8222-222222222222";
const slideId = "33333333-3333-4333-8333-333333333333";
const imagePath = `/api/gallery-images/${imageId}/file`;
const videoPath = `/api/gallery-images/videos/${videoId}/file`;

const galleryImage = {
  id: imageId,
  path: "gallery/images/hero.jpg",
} as GalleryImage;
const galleryVideo = {
  id: videoId,
  sourceType: "UPLOAD",
  source: "gallery/videos/hero.mp4",
} as GalleryVideo;

function slide(overrides: Partial<HeroSlide> = {}): HeroSlide {
  return {
    id: slideId,
    sourceType: "MANUAL",
    sourceId: null,
    title: "Hero",
    description: null,
    caption: null,
    mediaType: "IMAGE",
    mediaPath: imagePath,
    mediaAlt: null,
    posterPath: null,
    isLooping: true,
    ctaLabel: null,
    ctaUrl: null,
    sortOrder: 0,
    isActive: true,
    createdAt: new Date("2026-09-18T00:00:00.000Z"),
    updatedAt: new Date("2026-09-18T00:00:00.000Z"),
    ...overrides,
  };
}

async function expectStatus(promise: Promise<unknown>, status: number) {
  try {
    await promise;
    throw new Error("Expected ResponseError.");
  } catch (error) {
    expect((error as { status?: number }).status).toBe(status);
  }
}

afterEach(() => {
  mock.restore();
});

describe("HeroSlideService media", () => {
  it("creates an image slide from a Gallery image", async () => {
    spyOn(GalleryRepository, "findImageById").mockResolvedValue(galleryImage);
    const create = spyOn(HeroSlideRepository, "create").mockImplementation(
      async (data) => slide(data as Partial<HeroSlide>),
    );

    await HeroSlideService.create({
      mediaType: "IMAGE",
      mediaPath: imagePath,
      posterPath: imagePath,
    });

    expect(create.mock.calls[0]?.[0]).toMatchObject({
      mediaType: "IMAGE",
      mediaPath: imagePath,
      posterPath: null,
    });
  });

  it("creates a video slide with a Gallery poster", async () => {
    spyOn(GalleryRepository, "findImageById").mockResolvedValue(galleryImage);
    spyOn(GalleryRepository, "findVideoById").mockResolvedValue(galleryVideo);
    const create = spyOn(HeroSlideRepository, "create").mockImplementation(
      async (data) => slide(data as Partial<HeroSlide>),
    );

    const result = await HeroSlideService.create({
      mediaType: "VIDEO",
      mediaPath: videoPath,
      posterPath: imagePath,
    });

    expect(create.mock.calls[0]?.[0]).toMatchObject({
      mediaType: "VIDEO",
      mediaPath: videoPath,
      posterPath: imagePath,
    });
    expect(result?.posterPath).toBe(imagePath);
  });

  it("rejects static assets and external URLs as hero media", async () => {
    const create = spyOn(HeroSlideRepository, "create");

    await expectStatus(
      HeroSlideService.create({ mediaType: "IMAGE", mediaPath: "/assets-mws/_DSC4760.jpg" }),
      400,
    );
    await expectStatus(
      HeroSlideService.create({ mediaType: "VIDEO", mediaPath: "https://youtu.be/abc" }),
      400,
    );
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects Gallery references that do not exist or are not uploads", async () => {
    spyOn(GalleryRepository, "findImageById").mockResolvedValue(null);
    spyOn(GalleryRepository, "findVideoById").mockResolvedValue({
      ...galleryVideo,
      sourceType: "YOUTUBE",
    } as GalleryVideo);

    await expectStatus(
      HeroSlideService.create({ mediaType: "IMAGE", mediaPath: imagePath }),
      400,
    );
    await expectStatus(
      HeroSlideService.create({ mediaType: "VIDEO", mediaPath: videoPath }),
      400,
    );
  });

  it("validates a poster update against the stored video slide", async () => {
    spyOn(HeroSlideRepository, "findById").mockResolvedValue(
      slide({ mediaType: "VIDEO", mediaPath: videoPath }),
    );
    spyOn(GalleryRepository, "findImageById").mockResolvedValue(galleryImage);
    spyOn(GalleryRepository, "findVideoById").mockResolvedValue(galleryVideo);
    const update = spyOn(HeroSlideRepository, "update").mockImplementation(
      async (_id, data) => slide({ mediaType: "VIDEO", mediaPath: videoPath, ...(data as Partial<HeroSlide>) }),
    );

    await HeroSlideService.update(slideId, { posterPath: imagePath });

    expect(update.mock.calls[0]?.[1]).toMatchObject({
      mediaType: "VIDEO",
      mediaPath: videoPath,
      posterPath: imagePath,
    });
  });

  it("leaves media untouched on text-only updates", async () => {
    spyOn(HeroSlideRepository, "findById").mockResolvedValue(slide());
    const findImage = spyOn(GalleryRepository, "findImageById");
    const update = spyOn(HeroSlideRepository, "update").mockImplementation(
      async () => slide({ title: "New" }),
    );

    await HeroSlideService.update(slideId, { title: "New" });

    expect(findImage).not.toHaveBeenCalled();
    expect(update.mock.calls[0]?.[1]).toEqual({ title: "New" });
  });
});
