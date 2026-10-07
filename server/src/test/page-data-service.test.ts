import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import { HeroSlideRepository } from "../repositories/hero-slide-repository";
import { PageDataRepository } from "../repositories/page-data-repository";
import { PageDataService } from "../services/page-data-service";

afterEach(() => {
  mock.restore();
});

describe("PageDataService", () => {
  it("returns academic overview content from CMS", async () => {
    spyOn(PageDataRepository, "getLatestAcademicOverview").mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      title: "Academic CMS",
      description: "Academic overview from CMS",
      coverImage: "/api/gallery-images/22222222-2222-4222-8222-222222222222/file",
      content: {
        intro: {
          title: "CMS intro",
          body: "<p>CMS intro body</p>",
          image: "/api/gallery-images/44444444-4444-4444-8444-444444444444/file",
          imageAlt: "CMS intro image",
        },
        experience: {
          title: "CMS experience",
          body: "<p>CMS experience body</p>",
          image: "/api/gallery-images/55555555-5555-4555-8555-555555555555/file",
          imageAlt: "CMS experience image",
        },
        approach: [
          {
            title: "CMS approach",
            body: "CMS approach body",
          },
        ],
      },
      galleryId: "33333333-3333-4333-8333-333333333333",
      createdAt: new Date("2026-09-18T00:00:00.000Z"),
      updatedAt: new Date("2026-09-18T00:00:00.000Z"),
    });

    const overview = await PageDataService.getAcademicOverview();

    expect(overview).toEqual({
      title: "Academic CMS",
      description: "Academic overview from CMS",
      coverImage: "/api/gallery-images/22222222-2222-4222-8222-222222222222/file",
      content: {
        intro: {
          title: "CMS intro",
          body: "<p>CMS intro body</p>",
          image: "/api/gallery-images/44444444-4444-4444-8444-444444444444/file",
          imageAlt: "CMS intro image",
        },
        experience: {
          title: "CMS experience",
          body: "<p>CMS experience body</p>",
          image: "/api/gallery-images/55555555-5555-4555-8555-555555555555/file",
          imageAlt: "CMS experience image",
        },
        approach: [
          {
            title: "CMS approach",
            body: "CMS approach body",
          },
        ],
      },
      galleryId: "33333333-3333-4333-8333-333333333333",
    });
  });

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

  it("returns Home info cards from the selected news category and CMS spotlights", async () => {
    spyOn(HeroSlideRepository, "listActive").mockResolvedValue([]);
    spyOn(PageDataRepository, "listActivePrograms").mockResolvedValue([]);
    spyOn(PageDataRepository, "listCommunityVoices").mockResolvedValue([]);
    spyOn(PageDataRepository, "getHomePageSettings").mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      infoSectionTitle: "Latest school stories",
      infoSectionCategoryId: "22222222-2222-4222-8222-222222222222",
      createdAt: new Date("2026-09-18T00:00:00.000Z"),
      updatedAt: new Date("2026-09-18T00:00:00.000Z"),
      infoSectionCategory: {
        id: "22222222-2222-4222-8222-222222222222",
        name: "Campus News",
        slug: "campus-news",
        description: null,
        isActive: true,
        createdAt: new Date("2026-09-18T00:00:00.000Z"),
        updatedAt: new Date("2026-09-18T00:00:00.000Z"),
      },
      infoSectionCategories: [
        {
          homePageSettingsId: "11111111-1111-4111-8111-111111111111",
          categoryId: "22222222-2222-4222-8222-222222222222",
          sortOrder: 0,
          category: {
            id: "22222222-2222-4222-8222-222222222222",
            name: "Campus News",
            slug: "campus-news",
            description: null,
            isActive: true,
            createdAt: new Date("2026-09-18T00:00:00.000Z"),
            updatedAt: new Date("2026-09-18T00:00:00.000Z"),
          },
        },
      ],
    });
    spyOn(PageDataRepository, "listPublishedNewsByCategory").mockResolvedValue([
      {
        id: "33333333-3333-4333-8333-333333333333",
        categoryId: "22222222-2222-4222-8222-222222222222",
        title: "CMS News",
        slug: "cms-news",
        excerpt: "CMS excerpt",
        coverImage: "/api/gallery-images/44444444-4444-4444-8444-444444444444/file",
        coverImageAlt: "CMS cover",
        content: {},
        authorName: null,
        authorId: null,
        status: "PUBLISHED",
        isFeatured: false,
        isPublished: true,
        publishedAt: new Date("2026-09-18T00:00:00.000Z"),
        seoTitle: null,
        seoDescription: null,
        readTime: 0,
        viewCount: 0,
        createdAt: new Date("2026-09-18T00:00:00.000Z"),
        updatedAt: new Date("2026-09-18T00:00:00.000Z"),
        category: {
          id: "22222222-2222-4222-8222-222222222222",
          name: "Campus News",
          slug: "campus-news",
          description: null,
          isActive: true,
          createdAt: new Date("2026-09-18T00:00:00.000Z"),
          updatedAt: new Date("2026-09-18T00:00:00.000Z"),
        },
      },
    ]);
    spyOn(PageDataRepository, "listActiveCampusSpotlights").mockResolvedValue([
      {
        id: "55555555-5555-4555-8555-555555555555",
        text: "CMS spotlight",
        cite: "Home CMS",
        sortOrder: 0,
        isActive: true,
        activeFrom: null,
        activeUntil: null,
        createdAt: new Date("2026-09-18T00:00:00.000Z"),
        updatedAt: new Date("2026-09-18T00:00:00.000Z"),
      },
    ]);

    const page = await PageDataService.getHome();

    expect(page.infoTitle).toBe("Latest school stories");
    expect(page.infoFilters).toEqual([{ label: "Campus News", value: "campus-news" }]);
    expect(page.infoCards[0]).toMatchObject({
      category: "campus-news",
      title: "CMS News",
      path: "/news/cms-news",
    });
    expect(page.spotlightSlides[0]).toMatchObject({
      quote: "CMS spotlight",
      cite: "Home CMS",
    });
    expect(page.communityVoices).toEqual([]);
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
    spyOn(PageDataRepository, "getAdmissionsPage").mockResolvedValue(null);

    const page = await PageDataService.getAdmissions();

    expect(page.programs[0]).toMatchObject({
      title: "Kindergarten",
      age: "Age 2-6",
      description: "Admission description",
      adminWhatsapp: "628123",
      contactLabel: "WhatsApp",
    });
  });

  it("returns admissions page content from CMS", async () => {
    spyOn(PageDataRepository, "listActivePrograms").mockResolvedValue([]);
    spyOn(PageDataRepository, "getAdmissionsPage").mockResolvedValue({
      id: "44444444-4444-4444-8444-444444444444",
      title: "Admission CMS",
      description: "CMS admissions description",
      content: {
        heroTitle: "CMS Admission",
        heroSubtitle: "CMS hero subtitle",
        heroImage: "/api/gallery-images/55555555-5555-4555-8555-555555555555/file",
        heroImageAlt: "CMS hero",
        processTitle: "CMS process",
      },
      galleryId: null,
      isPublished: true,
      createdAt: new Date("2026-09-18T00:00:00.000Z"),
      updatedAt: new Date("2026-09-18T00:00:00.000Z"),
      gallery: null,
    } as Awaited<ReturnType<typeof PageDataRepository.getAdmissionsPage>>);

    const page = await PageDataService.getAdmissions();

    expect(page.content).toMatchObject({
      heroTitle: "CMS Admission",
      heroSubtitle: "CMS hero subtitle",
      heroImage: "/api/gallery-images/55555555-5555-4555-8555-555555555555/file",
      heroImageAlt: "CMS hero",
      processTitle: "CMS process",
    });
    expect(page.programs.length).toBeGreaterThan(0);
  });

  it("returns admission FAQ and guidelines from CMS sources", async () => {
    spyOn(PageDataRepository, "listAdmissionFaqs").mockResolvedValue([
      {
        id: "11111111-1111-4111-8111-111111111111",
        question: "How do we apply?",
        answer: "<p>Contact admissions.</p>",
        isActive: true,
        isAdmissionFaq: true,
        admissionSortOrder: 0,
        createdAt: new Date("2026-09-18T00:00:00.000Z"),
        updatedAt: new Date("2026-09-18T00:00:00.000Z"),
      },
    ]);
    spyOn(PageDataRepository, "getCmsPage").mockResolvedValue({
      id: "22222222-2222-4222-8222-222222222222",
      slug: "admission-guidelines",
      title: "Guidelines",
      body: {
        title: "CMS Guidelines",
        hero: { title: "CMS Hero", description: "CMS description" },
        body: "<p>CMS body</p>",
        checklist: ["One"],
        documents: ["Document"],
        cta: { label: "Apply", href: "/admission" },
      },
      template: "admission-guidelines",
      status: "PUBLISHED",
      publishedAt: new Date("2026-09-18T00:00:00.000Z"),
      createdBy: null,
      deletedAt: null,
      createdAt: new Date("2026-09-18T00:00:00.000Z"),
      updatedAt: new Date("2026-09-18T00:00:00.000Z"),
    });

    const faq = await PageDataService.getAdmissionFaq();
    const guidelines = await PageDataService.getAdmissionGuidelines();

    expect(faq.items).toEqual([
      {
        id: "11111111-1111-4111-8111-111111111111",
        question: "How do we apply?",
        answer: "<p>Contact admissions.</p>",
      },
    ]);
    expect(guidelines).toMatchObject({
      title: "CMS Guidelines",
      hero: { title: "CMS Hero", description: "CMS description" },
      checklist: ["One"],
      documents: ["Document"],
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
      activityTitle: "Activity Highlights",
      activityDescription: "Photos from school activities.",
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
            caption: "Students sharing activity moments.",
            sortOrder: 0,
            createdAt: new Date("2026-09-18T00:00:00.000Z"),
            updatedAt: new Date("2026-09-18T00:00:00.000Z"),
          },
        ],
      },
    });
    spyOn(PageDataRepository, "listPublishedNews").mockResolvedValue([]);

    const page = await PageDataService.getCommunityStories();

    expect(page.activityTitle).toBe("Activity Highlights");
    expect(page.activityDescription).toBe("Photos from school activities.");
    expect(page.galleryImages[0]).toMatchObject({
      id: "66666666-6666-4666-8666-666666666666",
      src: "/api/gallery-images/66666666-6666-4666-8666-666666666666/file",
      alt: "Photo",
      caption: "Students sharing activity moments.",
    });
  });

  it("does not fall back to static community stories media", async () => {
    spyOn(PageDataRepository, "getCommunityStoriesPage").mockResolvedValue(null);
    spyOn(PageDataRepository, "listPublishedNews").mockResolvedValue([]);

    const page = await PageDataService.getCommunityStories();

    expect(page.galleryImages).toEqual([]);
    expect(page.news).toEqual([]);
  });
});
