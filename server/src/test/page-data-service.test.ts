import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import { HeroSlideRepository } from "../repositories/hero-slide-repository";
import { PageDataRepository } from "../repositories/page-data-repository";
import { PageDataService } from "../services/page-data-service";

afterEach(() => {
  mock.restore();
});

describe("PageDataService", () => {
  it("returns active hero slides in frontend shape", async () => {
    spyOn(HeroSlideRepository, "listActive").mockResolvedValue([
      {
        id: "11111111-1111-4111-8111-111111111111",
        sourceType: "MANUAL",
        sourceId: null,
        title: "Hero title",
        description: null,
        caption: "Hero caption",
        mediaType: "IMAGE",
        mediaPath: "/api/gallery-images/22222222-2222-4222-8222-222222222222/file",
        mediaAlt: "Hero alt",
        posterPath: null,
        isLooping: true,
        ctaLabel: "Learn",
        ctaUrl: "/admission",
        sortOrder: 0,
        isActive: true,
        createdAt: new Date("2026-09-18T00:00:00.000Z"),
        updatedAt: new Date("2026-09-18T00:00:00.000Z"),
      },
    ]);

    const slides = await PageDataService.getHeroSlides();

    expect(slides).toEqual([
      {
        id: "11111111-1111-4111-8111-111111111111",
        image: "/api/gallery-images/22222222-2222-4222-8222-222222222222/file",
        mediaType: "IMAGE",
        isLooping: true,
        alt: "Hero alt",
        headline: "Hero title",
        caption: "Hero caption",
        ctaLabel: "Learn",
        ctaHref: "/admission",
      },
    ]);
  });

  it("returns video hero slides with playable public media paths", async () => {
    spyOn(HeroSlideRepository, "listActive").mockResolvedValue([
      {
        id: "77777777-7777-4777-8777-777777777777",
        sourceType: "MANUAL",
        sourceId: null,
        title: "Video hero",
        description: null,
        caption: null,
        mediaType: "VIDEO",
        mediaPath: "/api/gallery-images/videos/88888888-8888-4888-8888-888888888888/file",
        mediaAlt: "Hero video",
        posterPath: "/api/gallery-images/99999999-9999-4999-8999-999999999999/file",
        isLooping: true,
        ctaLabel: null,
        ctaUrl: null,
        sortOrder: 0,
        isActive: true,
        createdAt: new Date("2026-09-18T00:00:00.000Z"),
        updatedAt: new Date("2026-09-18T00:00:00.000Z"),
      },
    ]);

    const slides = await PageDataService.getHeroSlides();

    expect(slides[0]).toMatchObject({
      image: "/api/gallery-images/99999999-9999-4999-8999-999999999999/file",
      video: "/api/gallery-images/videos/88888888-8888-4888-8888-888888888888/file",
      poster: "/api/gallery-images/99999999-9999-4999-8999-999999999999/file",
      mediaType: "VIDEO",
      isLooping: true,
    });
  });

  it("does not fall back to static hero assets when no slides have media", async () => {
    spyOn(HeroSlideRepository, "listActive").mockResolvedValue([
      {
        id: "33333333-3333-4333-8333-333333333333",
        sourceType: "MANUAL",
        sourceId: null,
        title: "Draft",
        description: null,
        caption: null,
        mediaType: "IMAGE",
        mediaPath: null,
        mediaAlt: null,
        posterPath: null,
        isLooping: true,
        ctaLabel: null,
        ctaUrl: null,
        sortOrder: 0,
        isActive: true,
        createdAt: new Date("2026-09-18T00:00:00.000Z"),
        updatedAt: new Date("2026-09-18T00:00:00.000Z"),
      },
    ]);

    expect(await PageDataService.getHeroSlides()).toEqual([]);
  });

  it("returns admissions programs with admin contact", async () => {
    spyOn(PageDataRepository, "listActivePrograms").mockResolvedValue([
      {
        id: "22222222-2222-4222-8222-222222222222",
        title: "Kindergarten",
        ageRange: "Age 2-6",
        description: "Program description",
        imagePath: "/assets-mws/kindergarten.jpg",
        imageAlt: "Kindergarten",
        path: "/academic/kindergarten",
        galleryId: null,
        sortOrder: 0,
        isActive: true,
        createdAt: new Date("2026-09-18T00:00:00.000Z"),
        updatedAt: new Date("2026-09-18T00:00:00.000Z"),
        gallery: null,
        admissions: [
          {
            id: "33333333-3333-4333-8333-333333333333",
            programId: "22222222-2222-4222-8222-222222222222",
            title: "Kindergarten Admission",
            description: "Admission description",
            adminWhatsapp: "628123",
            contactLabel: "WhatsApp",
            exploreLabel: "Explore",
            galleryId: null,
            sortOrder: 0,
            isActive: true,
            createdAt: new Date("2026-09-18T00:00:00.000Z"),
            updatedAt: new Date("2026-09-18T00:00:00.000Z"),
            gallery: null,
          },
        ],
      },
    ] as Awaited<ReturnType<typeof PageDataRepository.listActivePrograms>>);

    const page = await PageDataService.getAdmissions();

    expect(page.programs[0]).toMatchObject({
      title: "Kindergarten",
      age: "Age 2-6",
      description: "Admission description",
      adminWhatsapp: "628123",
      contactLabel: "WhatsApp",
    });
  });

  it("returns community gallery images ordered from selected gallery", async () => {
    spyOn(PageDataRepository, "getCommunityStoriesPage").mockResolvedValue({
      id: "44444444-4444-4444-8444-444444444444",
      title: "Community Stories",
      heroImagePath: null,
      heroImageAlt: null,
      introTitle: "Community",
      introBody: ["Intro"],
      galleryId: "55555555-5555-4555-8555-555555555555",
      isPublished: true,
      createdAt: new Date("2026-09-18T00:00:00.000Z"),
      updatedAt: new Date("2026-09-18T00:00:00.000Z"),
      gallery: {
        id: "55555555-5555-4555-8555-555555555555",
        title: "Gallery",
        description: null,
        createdAt: new Date("2026-09-18T00:00:00.000Z"),
        updatedAt: new Date("2026-09-18T00:00:00.000Z"),
        videos: [],
        images: [
          {
            id: "66666666-6666-4666-8666-666666666666",
            galleryId: "55555555-5555-4555-8555-555555555555",
            path: "gallery/images/photo.jpg",
            title: "Photo",
            caption: null,
            sortOrder: 0,
            createdAt: new Date("2026-09-18T00:00:00.000Z"),
            updatedAt: new Date("2026-09-18T00:00:00.000Z"),
          },
        ],
      },
    });
    spyOn(PageDataRepository, "listPublishedNews").mockResolvedValue([]);

    const page = await PageDataService.getCommunityStories();

    expect(page.galleryImages[0]).toMatchObject({
      id: "66666666-6666-4666-8666-666666666666",
      src: "/api/gallery-images/66666666-6666-4666-8666-666666666666/file",
      alt: "Photo",
    });
  });
});
