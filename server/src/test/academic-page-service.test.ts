import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import * as prismaLib from "../lib/prisma";
import { AcademicPageService } from "../services/academic-page-service";
import { GalleryService } from "../services/gallery-service";

const publishedAt = new Date("2026-01-15T00:00:00.000Z");
const updatedAt = new Date("2026-01-16T00:00:00.000Z");

function academicRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "level-page-1",
    academicLevelId: "academic-level-1",
    title: "High School",
    description: "Secondary learning pathway",
    coverImage: "/assets-mws/JH.jpg",
    galleryId: null,
    hero: {
      title: "High School",
      description: "Confident independent learning.",
      image: "/assets-mws/JH.jpg",
      imageAlt: "High School",
    },
    overview: {
      introTitle: "Growing Into Independence",
      intro: ["Students take ownership of learning."],
      introImage: "/assets-mws/JH.jpg",
      introImageAlt: "High School students",
      curriculumTitle: "Our Curriculum",
      curriculumDescription: ["Balanced academic experience."],
      curriculumFile: null,
      curriculumLabel: null,
      closingText: null,
    },
    sections: [
      {
        title: "Leadership",
        text: "Students practice leadership.",
        image: "/assets-mws/JH.jpg",
        imageAlt: "Leadership",
        imagePosition: "right",
      },
    ],
    faqs: [],
    status: "PUBLISHED",
    publishedAt,
    updatedAt,
    academicLevel: {
      title: "High School",
      description: "Secondary learning pathway",
    },
    ...overrides,
  };
}

function payload() {
  return {
    status: "DRAFT",
    program: {
      title: "High School",
      age: "Age 12-15",
      description: "Secondary learning pathway",
      image: "/assets-mws/JH.jpg",
      imageAlt: "High School",
      path: "/academic/high-school",
      sortOrder: 2,
      isActive: true,
    },
    page: {
      isPublished: false,
      galleryId: null,
      hero: {
        title: "High School",
        description: "Draft secondary page.",
        image: "/assets-mws/JH.jpg",
        imageAlt: "High School",
      },
      overview: {
        introTitle: "Growing Into Independence",
        intro: ["Draft intro."],
        introImage: "/assets-mws/JH.jpg",
        introImageAlt: "High School students",
        curriculumTitle: "Our Curriculum",
        curriculumDescription: ["Draft curriculum."],
        curriculumFile: null,
        curriculumLabel: null,
        closingText: null,
      },
      sections: [
        {
          title: "Leadership",
          text: "Draft leadership.",
          image: "/assets-mws/JH.jpg",
          imageAlt: "Leadership",
          imagePosition: "right",
        },
      ],
      faq: [],
    },
  };
}

afterEach(() => {
  mock.restore();
});

describe("AcademicPageService", () => {
  it("reads high-school content from the JuniorHigh model", async () => {
    const juniorHigh = {
      findFirst: mock(async () => academicRecord()),
    };
    const kindergarten = {
      findFirst: mock(async () => null),
    };

    spyOn(prismaLib, "getPrisma").mockReturnValue({
      kindergarten,
      juniorHigh,
    } as never);

    const result = await AcademicPageService.getPublicLevel("high-school");

    expect(juniorHigh.findFirst).toHaveBeenCalled();
    expect(kindergarten.findFirst).not.toHaveBeenCalled();
    expect(result.levelKey).toBe("high-school");
    expect(result.page.hero.title).toBe("High School");
  });

  it("creates draft high-school content in the JuniorHigh model", async () => {
    const createdRecord = academicRecord({ status: "DRAFT", publishedAt: null });
    const juniorHigh = {
      findFirst: mock(async () => null),
      create: mock(async () => createdRecord),
    };
    const juniorHighFaq = {
      deleteMany: mock(async () => ({ count: 0 })),
    };
    const academicLevel = {
      findFirst: mock(async () => null),
      create: mock(async () => ({ id: "academic-level-1" })),
    };

    spyOn(prismaLib, "getPrisma").mockReturnValue({
      academicLevel,
      juniorHigh,
      juniorHighFaq,
    } as never);
    spyOn(GalleryService, "listGalleries").mockResolvedValue([]);

    await AcademicPageService.saveLevel("high-school", payload());

    expect(academicLevel.create).toHaveBeenCalledWith({
      data: {
        title: "High School",
        description: "Secondary learning pathway",
      },
    });
    expect(juniorHigh.create).toHaveBeenCalled();

    const createCalls = (juniorHigh.create.mock.calls as unknown[]) as unknown[][];
    const createArgs = createCalls[0]?.[0] as {
      data: { academicLevelId: string; status: string; publishedAt: Date | null };
    };
    expect(createArgs.data.academicLevelId).toBe("academic-level-1");
    expect(createArgs.data.status).toBe("DRAFT");
    expect(createArgs.data.publishedAt).toBeNull();
  });
});
