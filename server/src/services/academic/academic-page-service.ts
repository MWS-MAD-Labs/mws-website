import { z } from "zod";
import { Prisma } from "@prisma/client";
import { ResponseError } from "../../error/response-error";
import {
  getMinioObjectBuffer,
  putMinioObject,
  statMinioObject,
} from "../../lib/minio";
import { getPrisma } from "../../lib/prisma";
import { GalleryService } from "../gallery-service";

const asset = (fileName: string) => `/assets-mws/${fileName}`;

const LEVEL_KEYS = ["kindergarten", "elementary", "high-school"] as const;
type AcademicLevelKey = (typeof LEVEL_KEYS)[number];
type AcademicStatus = "DRAFT" | "PUBLISHED";

const levelKeySchema = z.enum(LEVEL_KEYS);
const statusSchema = z.enum(["DRAFT", "PUBLISHED"]);

const paragraphArray = z.array(z.string().trim().min(1)).min(1);
const richText = z.union([paragraphArray, z.string().trim().min(1).max(20000)]);

const academicPayloadSchema = z.object({
  status: statusSchema.optional(),
  program: z.object({
    title: z.string().trim().min(1).max(255),
    age: z.string().trim().max(100).nullable().optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    image: z.string().trim().max(1000).nullable().optional(),
    imageAlt: z.string().trim().max(255).nullable().optional(),
    path: z.string().trim().max(500).nullable().optional(),
    sortOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  }),
  page: z.object({
    isPublished: z.boolean().optional(),
    galleryId: z.string().uuid().nullable().optional(),
    hero: z.object({
      title: z.string().trim().min(1).max(255),
      description: z.string().trim().max(2000),
      image: z.string().trim().max(1000),
      imageAlt: z.string().trim().max(255),
    }),
    overview: z.object({
      introTitle: z.string().trim().min(1).max(255),
      intro: richText,
      introImage: z.string().trim().max(1000),
      introImageAlt: z.string().trim().max(255),
      curriculumTitle: z.string().trim().min(1).max(255),
      curriculumDescription: richText,
      curriculumFile: z.string().trim().max(1000).nullable().optional(),
      curriculumLabel: z.string().trim().max(255).nullable().optional(),
      closingText: z.string().trim().max(20000).nullable().optional(),
    }),
    sections: z.array(
      z.object({
        title: z.string().trim().min(1).max(255),
        text: z.string().trim().min(1).max(20000),
        image: z.string().trim().max(1000),
        imageAlt: z.string().trim().max(255),
        imagePosition: z.enum(["left", "right"]).optional(),
      }),
    ),
    faq: z
      .array(
        z.object({
          question: z.string().trim().min(1).max(255),
          answer: z.string().trim().min(1).max(2000),
        }),
      )
      .optional(),
  }),
});

type AcademicPayload = z.infer<typeof academicPayloadSchema>;
type AcademicProgramPayload = AcademicPayload["program"];
type AcademicPagePayload = AcademicPayload["page"];
type AcademicLevelRecord = {
  id: string;
  academicLevelId: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  galleryId: string | null;
  hero: Prisma.JsonValue;
  overview: Prisma.JsonValue;
  sections: Prisma.JsonValue;
  publishedTitle: string | null;
  publishedDescription: string | null;
  publishedCoverImage: string | null;
  publishedGalleryId: string | null;
  publishedHero: Prisma.JsonValue | null;
  publishedOverview: Prisma.JsonValue | null;
  publishedSections: Prisma.JsonValue | null;
  status: string;
  publishedAt: Date | null;
  updatedAt: Date;
  academicLevel: {
    title: string;
    description: string | null;
  };
  faqs: Array<{
    sortOrder: number;
    faq: {
      id: string;
      question: string;
      answer: string;
      isActive: boolean;
    };
  }>;
};

const defaultLevels = {
  kindergarten: {
    levelKey: "kindergarten",
    program: {
      title: "Kindergarten",
      age: "Age 2-6",
      description:
        "A nurturing first step into learning, where children build curiosity, confidence, communication, and positive relationships through meaningful experiences.",
      image: asset("Kindergarten.jpg"),
      imageAlt: "Kindergarten students exploring their learning environment",
      path: "/academic/kindergarten",
      sortOrder: 0,
      isActive: true,
    },
    page: {
      isPublished: true,
      galleryId: null,
      hero: {
        image: asset("Kindergarten.jpg"),
        imageAlt: "MWS Kindergarten learning environment",
        title: "Kindergarten",
        description:
          "The early years program supports curiosity, language, social confidence, and joyful independence through play-based inquiry.",
      },
      overview: {
        introTitle: "Growing Through Discovery",
        intro: [
          "The early years are a time of wonder, curiosity, and rapid growth. At Millennia World School, children are encouraged to explore their surroundings, ask questions, and build meaningful relationships in a warm and supportive environment.",
          "Learning happens through play, conversation, movement, creative expression, and hands-on experiences. These experiences help children develop confidence while building the foundations they need for their next stage of learning.",
        ],
        introImage: asset("Kindergarten.jpg"),
        introImageAlt:
          "Kindergarten students exploring their learning environment",
        curriculumTitle: "Our Curriculum",
        curriculumDescription: [
          "Our Kindergarten curriculum provides a balance of guided learning and open-ended exploration. Children develop early literacy and numeracy skills while learning to communicate, collaborate, solve problems, and make sense of the world around them.",
          "Through an inquiry-based approach, teachers create opportunities for children to investigate ideas, express their thinking, and connect new experiences with what they already know.",
          "Our approach recognizes that every child develops at their own pace, with learning experiences designed to nurture curiosity, confidence, independence, and a genuine love of learning.",
        ],
        curriculumFile: "/documents/kindergarten-curriculum.pdf",
        curriculumLabel: "Kindergarten Curriculum",
        closingText:
          "Every experience in Kindergarten is designed to help children become curious learners, confident communicators, and caring members of their community.",
      },
      sections: [
        {
          title: "Learning Through Play",
          text: "Play is an important part of how young children make sense of the world. Through purposeful play, children develop language, early mathematical thinking, creativity, coordination, and social skills while learning to make choices and solve simple problems.",
          image: asset("Kindergarten.jpg"),
          imageAlt: "Kindergarten students learning through play",
          imagePosition: "right" as const,
        },
        {
          title: "Growing Independence",
          text: "Daily routines give children opportunities to take responsibility for themselves and their learning. From caring for personal belongings to working with friends and expressing their ideas, children gradually develop confidence, independence, and a sense of responsibility.",
          image: asset("_DSC7101.jpg"),
          imageAlt:
            "Kindergarten students participating in a classroom activity",
          imagePosition: "left" as const,
        },
      ],
      faq: [],
    },
  },
  elementary: {
    levelKey: "elementary",
    program: {
      title: "Elementary",
      age: "Age 6-12",
      description:
        "A stage for building strong academic foundations while developing independence, creativity, collaboration, and a deeper understanding of the world.",
      image: asset("Elementary.jpg"),
      imageAlt: "MWS Elementary students learning together",
      path: "/academic/elementary",
      sortOrder: 1,
      isActive: true,
    },
    page: {
      isPublished: true,
      galleryId: null,
      hero: {
        image: asset("Elementary.jpg"),
        imageAlt: "MWS Elementary learning environment",
        title: "Elementary",
        description:
          "Elementary learners build strong academic foundations while practicing inquiry, collaboration, and independence.",
      },
      overview: {
        introTitle: "Building Strong Foundations",
        intro: [
          "Elementary is a time when students build strong academic foundations while becoming increasingly curious, collaborative, and independent learners. At Millennia World School, students are encouraged to explore ideas, ask meaningful questions, and connect their learning with the world around them.",
          "Through a balance of explicit teaching, inquiry, projects, and collaboration, students develop the knowledge, skills, and confidence they need to approach learning with purpose and curiosity.",
        ],
        introImage: asset("Elementary.jpg"),
        introImageAlt: "MWS Elementary students learning together",
        curriculumTitle: "Our Curriculum",
        curriculumDescription: [
          "Our Elementary curriculum develops essential skills in literacy, numeracy, science, culture, and communication while giving students opportunities to explore their interests through inquiry and project-based learning.",
          "Students learn to investigate questions, work collaboratively, communicate their ideas, and reflect on their progress. Digital tools are also introduced as part of a balanced learning experience that supports creativity, research, and responsible participation.",
          "Alongside academic development, students build habits of compassion, responsibility, and respect through classroom routines, collaboration, and meaningful connections with the wider school community.",
        ],
        curriculumFile: "/documents/kindergarten-curriculum.pdf",
        curriculumLabel: "Elementary Curriculum",
        closingText:
          "Elementary provides a supportive environment where students can build strong foundations, discover their interests, and grow into confident and responsible learners.",
      },
      sections: [
        {
          title: "Learning Through Collaboration",
          text: "Students work together to explore questions, solve problems, and create meaningful outcomes. Collaborative projects help learners practice communication, listen to different perspectives, and understand how individual contributions can strengthen a shared result.",
          image: asset("_DSC7101.jpg"),
          imageAlt: "Elementary students collaborating on a project",
          imagePosition: "right" as const,
        },
        {
          title: "Inquiry Beyond the Classroom",
          text: "Learning extends beyond textbooks and classroom routines. Students investigate their surroundings, observe the world around them, and use questions to guide research, experimentation, and discovery across different areas of learning.",
          image: asset("Elementary.jpg"),
          imageAlt: "Elementary students exploring their learning environment",
          imagePosition: "left" as const,
        },
      ],
      faq: [],
    },
  },
  "high-school": {
    levelKey: "high-school",
    program: {
      title: "High School",
      age: "Age 12-15",
      description:
        "The secondary pathway helps students strengthen academic confidence, leadership, and readiness for more independent learning.",
      image: asset("JH.jpg"),
      imageAlt: "MWS High School learning environment",
      path: "/academic/high-school",
      sortOrder: 2,
      isActive: true,
    },
    page: {
      isPublished: true,
      galleryId: null,
      hero: {
        image: asset("JH.jpg"),
        imageAlt: "MWS High School learning environment",
        title: "High School",
        description:
          "The secondary pathway helps students strengthen academic confidence, leadership, and readiness for more independent learning.",
      },
      overview: {
        introTitle: "Growing Into Independence",
        intro: [
          "High School is a time when students begin to take greater ownership of their learning, interests, and personal development. At Millennia World School, students are supported as they build confidence while navigating a broader and more challenging academic experience.",
          "Learning combines subject knowledge with inquiry, collaboration, communication, and reflection. Students are encouraged to ask deeper questions, take responsibility for their choices, and develop the independence needed for the next stage of their education.",
        ],
        introImage: asset("JH.jpg"),
        introImageAlt: "MWS High School students learning together",
        curriculumTitle: "Our Curriculum",
        curriculumDescription: [
          "Our High School curriculum provides students with a balanced academic experience that develops subject knowledge, critical thinking, communication, and independent learning habits.",
          "Through projects, discussions, research, and collaborative learning, students are encouraged to connect ideas across subjects and apply their learning to meaningful situations.",
          "The program also creates opportunities for students to develop leadership, responsibility, wellbeing, and a growing awareness of their role within the wider community.",
        ],
        curriculumFile: "/documents/kindergarten-curriculum.pdf",
        curriculumLabel: "High School Curriculum",
        closingText:
          "High School helps students grow into confident, responsible, and increasingly independent learners who are ready to take on new academic and personal challenges.",
      },
      sections: [
        {
          title: "Learning With Greater Independence",
          text: "Students take a more active role in planning, managing, and reflecting on their learning. They develop stronger study habits while learning to communicate their ideas, respond to feedback, and take responsibility for their progress.",
          image: asset("_DSC7101.jpg"),
          imageAlt: "High School students collaborating on a learning activity",
          imagePosition: "right" as const,
        },
        {
          title: "Leadership and Responsibility",
          text: "High School students are given opportunities to develop leadership through collaboration, presentations, service, and student-led initiatives. These experiences help them understand how their choices can contribute positively to the school community.",
          image: asset("JH.jpg"),
          imageAlt:
            "High School students participating in a collaborative activity",
          imagePosition: "left" as const,
        },
      ],
      faq: [],
    },
  },
} satisfies Record<
  AcademicLevelKey,
  AcademicPayload & { levelKey: AcademicLevelKey }
>;

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set([
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const ACCEPTED_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function parseLevelKey(value: string | undefined): AcademicLevelKey {
  const parsed = levelKeySchema.safeParse(value);
  if (!parsed.success)
    throw new ResponseError(404, "Academic level not found.");
  return parsed.data;
}

function nullable(value: string | null | undefined) {
  return value?.trim() ? value.trim() : null;
}

function json<T>(value: Prisma.JsonValue | null | undefined): T | null {
  return value ? (value as unknown as T) : null;
}

function programFromRecord(
  levelKey: AcademicLevelKey,
  record: AcademicLevelRecord,
): AcademicProgramPayload {
  const fallback = defaultLevels[levelKey].program;
  return {
    title: record.title,
    age: fallback.age,
    description:
      record.description ||
      record.academicLevel.description ||
      fallback.description,
    image: record.coverImage || fallback.image,
    imageAlt: fallback.imageAlt,
    path: fallback.path,
    sortOrder: fallback.sortOrder,
    isActive: record.status !== "ARCHIVED",
  };
}

function pageFromRecord(
  levelKey: AcademicLevelKey,
  record: AcademicLevelRecord,
): AcademicPagePayload {
  const fallback = defaultLevels[levelKey].page;
  return {
    isPublished: record.status === "PUBLISHED",
    galleryId: record.galleryId,
    hero: json<AcademicPagePayload["hero"]>(record.hero) ?? fallback.hero,
    overview:
      json<AcademicPagePayload["overview"]>(record.overview) ??
      fallback.overview,
    sections:
      json<AcademicPagePayload["sections"]>(record.sections) ??
      fallback.sections,
    faq: (record.faqs ?? [])
      .filter((item) => item.faq.isActive)
      .map((item) => ({
        question: item.faq.question,
        answer: item.faq.answer,
      })),
  };
}

function pageResponse(
  levelKey: AcademicLevelKey,
  record: AcademicLevelRecord | null,
) {
  const fallback = defaultLevels[levelKey];
  if (!record) {
    return {
      ...fallback,
      status: "PUBLISHED" as AcademicStatus,
      draftSavedAt: null,
      publishedAt: null,
    };
  }

  return {
    levelKey,
    status: record.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
    draftSavedAt: record.status === "DRAFT" ? record.updatedAt : null,
    publishedAt: record.publishedAt,
    program: programFromRecord(levelKey, record),
    page: pageFromRecord(levelKey, record),
  };
}

function publishedRecord(
  record: AcademicLevelRecord,
): AcademicLevelRecord | null {
  if (record.status === "PUBLISHED") return record;
  if (
    !record.publishedHero ||
    !record.publishedOverview ||
    !record.publishedSections
  ) {
    return null;
  }

  return {
    ...record,
    title: record.publishedTitle ?? record.title,
    description: record.publishedDescription,
    coverImage: record.publishedCoverImage,
    galleryId: record.publishedGalleryId,
    hero: record.publishedHero,
    overview: record.publishedOverview,
    sections: record.publishedSections,
    status: "PUBLISHED",
    academicLevel: {
      ...record.academicLevel,
      title: record.publishedTitle ?? record.academicLevel.title,
      description: record.publishedDescription,
    },
  };
}

function publicPageResponse(
  levelKey: AcademicLevelKey,
  record: AcademicLevelRecord | null,
) {
  if (!record) return pageResponse(levelKey, null);
  return pageResponse(levelKey, publishedRecord(record));
}

async function findLevelRecord(
  levelKey: AcademicLevelKey,
): Promise<AcademicLevelRecord | null> {
  const prisma = getPrisma();
  const query = {
    where: { levelKey },
    include: {
      academicLevel: { select: { title: true, description: true } },
      faqs: {
        orderBy: { sortOrder: "asc" },
        include: { faq: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  } as const;

  if (levelKey === "kindergarten") {
    return prisma.kindergarten.findFirst(query);
  }
  if (levelKey === "elementary") {
    return prisma.elementary.findFirst(query);
  }
  return prisma.juniorHigh.findFirst(query);
}

async function ensureAcademicLevel(
  levelKey: AcademicLevelKey,
  existing: AcademicLevelRecord | null,
  program: AcademicProgramPayload,
) {
  const prisma = getPrisma();
  const data = {
    title: program.title,
    description: nullable(program.description),
  };

  if (existing) {
    return prisma.academicLevel.update({
      where: { id: existing.academicLevelId },
      data,
    });
  }

  const fallbackTitle = defaultLevels[levelKey].program.title;
  const found = await prisma.academicLevel.findFirst({
    where: { title: fallbackTitle },
    orderBy: { updatedAt: "desc" },
  });

  if (found) {
    return prisma.academicLevel.update({
      where: { id: found.id },
      data,
    });
  }

  return prisma.academicLevel.create({ data });
}

function levelData(
  levelKey: AcademicLevelKey,
  academicLevelId: string,
  data: AcademicPayload,
  status: AcademicStatus,
  previousStatus: string | null,
) {
  const dataToSave: Record<string, unknown> = {
    levelKey,
    academicLevelId,
    title: data.program.title,
    description: nullable(
      data.program.description ?? data.page.hero.description,
    ),
    coverImage: nullable(data.program.image ?? data.page.hero.image),
    galleryId: data.page.galleryId ?? null,
    hero: data.page.hero as Prisma.InputJsonValue,
    overview: data.page.overview as Prisma.InputJsonValue,
    sections: data.page.sections as Prisma.InputJsonValue,
    status,
  };

  if (status === "PUBLISHED") {
    dataToSave.publishedAt = new Date();
    dataToSave.publishedTitle = data.program.title;
    dataToSave.publishedDescription = nullable(
      data.program.description ?? data.page.hero.description,
    );
    dataToSave.publishedCoverImage = nullable(
      data.program.image ?? data.page.hero.image,
    );
    dataToSave.publishedGalleryId = data.page.galleryId ?? null;
    dataToSave.publishedHero = data.page.hero as Prisma.InputJsonValue;
    dataToSave.publishedOverview = data.page.overview as Prisma.InputJsonValue;
    dataToSave.publishedSections = data.page.sections as Prisma.InputJsonValue;
  } else if (previousStatus === "PUBLISHED") {
    // Unpublishing takes the page off the website: drop the published copy so
    // the public page falls back to default content, as the CMS promises.
    dataToSave.publishedAt = null;
    dataToSave.publishedTitle = null;
    dataToSave.publishedDescription = null;
    dataToSave.publishedCoverImage = null;
    dataToSave.publishedGalleryId = null;
    dataToSave.publishedHero = Prisma.DbNull;
    dataToSave.publishedOverview = Prisma.DbNull;
    dataToSave.publishedSections = Prisma.DbNull;
  }

  return dataToSave;
}

async function findOrCreateFaq(item: { question: string; answer: string }) {
  const prisma = getPrisma();
  const question = item.question.trim();
  const answer = item.answer.trim();
  const existing = await prisma.faq.findFirst({
    where: { question, answer },
    orderBy: { updatedAt: "desc" },
  });

  if (existing) return existing;
  return prisma.faq.create({ data: { question, answer, isActive: true } });
}

async function upsertLegacyFaqLink(
  levelKey: AcademicLevelKey,
  academicLevelId: string,
  faqId: string,
  sortOrder: number,
) {
  const prisma = getPrisma();
  const args = {
    where: {
      academicLevelId_faqId: {
        academicLevelId,
        faqId,
      },
    },
    update: { sortOrder },
    create: {
      academicLevelId,
      faqId,
      sortOrder,
    },
  };

  if (levelKey === "kindergarten") return prisma.kindergartenFaq.upsert(args);
  if (levelKey === "elementary") return prisma.elementaryFaq.upsert(args);
  return prisma.juniorHighFaq.upsert(args);
}

async function deleteMissingLegacyFaqLinks(
  levelKey: AcademicLevelKey,
  academicLevelId: string,
  faqIds: string[],
) {
  const prisma = getPrisma();
  const args = {
    where: {
      academicLevelId,
      ...(faqIds.length ? { faqId: { notIn: faqIds } } : {}),
    },
  };

  if (levelKey === "kindergarten")
    return prisma.kindergartenFaq.deleteMany(args);
  if (levelKey === "elementary") return prisma.elementaryFaq.deleteMany(args);
  return prisma.juniorHighFaq.deleteMany(args);
}

async function syncLegacyFaqPayload(
  levelKey: AcademicLevelKey,
  academicLevelId: string,
  faqItems: AcademicPagePayload["faq"] | undefined,
) {
  const cleanItems = (faqItems ?? [])
    .map((item) => ({
      question: item.question.trim(),
      answer: item.answer.trim(),
    }))
    .filter((item) => item.question && item.answer);
  const faqIds: string[] = [];

  for (const [sortOrder, item] of cleanItems.entries()) {
    const faq = await findOrCreateFaq(item);
    faqIds.push(faq.id);
    await upsertLegacyFaqLink(levelKey, academicLevelId, faq.id, sortOrder);
  }

  await deleteMissingLegacyFaqLinks(levelKey, academicLevelId, faqIds);
}

async function saveLevelRecord(
  levelKey: AcademicLevelKey,
  existing: AcademicLevelRecord | null,
  data: AcademicPayload,
  status: AcademicStatus,
) {
  const prisma = getPrisma();
  const academicLevel = await ensureAcademicLevel(
    levelKey,
    existing,
    data.program,
  );
  const nextData = levelData(
    levelKey,
    academicLevel.id,
    data,
    status,
    existing?.status ?? null,
  );

  if (levelKey === "kindergarten") {
    const saved = existing
      ? prisma.kindergarten.update({
          where: { id: existing.id },
          data: nextData as Prisma.KindergartenUncheckedUpdateInput,
        })
      : prisma.kindergarten.create({
          data: nextData as Prisma.KindergartenUncheckedCreateInput,
        });
    const record = await saved;
    await syncLegacyFaqPayload(levelKey, record.id, data.page.faq);
    return record;
  }
  if (levelKey === "elementary") {
    const saved = existing
      ? prisma.elementary.update({
          where: { id: existing.id },
          data: nextData as Prisma.ElementaryUncheckedUpdateInput,
        })
      : prisma.elementary.create({
          data: nextData as Prisma.ElementaryUncheckedCreateInput,
        });
    const record = await saved;
    await syncLegacyFaqPayload(levelKey, record.id, data.page.faq);
    return record;
  }
  const saved = existing
    ? prisma.juniorHigh.update({
        where: { id: existing.id },
        data: nextData as Prisma.JuniorHighUncheckedUpdateInput,
      })
    : prisma.juniorHigh.create({
        data: nextData as Prisma.JuniorHighUncheckedCreateInput,
      });
  const record = await saved;
  await syncLegacyFaqPayload(levelKey, record.id, data.page.faq);
  return record;
}

function parseSavePayload(payload: unknown) {
  const parsed = academicPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ResponseError(400, "Invalid academic level payload.");
  }
  return parsed.data;
}

function sanitizeFileName(name: string) {
  const safe = name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return safe || "academic-asset";
}

function academicObjectKey(type: "image" | "document", fileName: string) {
  const folder = type === "image" ? "images" : "documents";
  return `academic/${folder}/${crypto.randomUUID()}-${sanitizeFileName(fileName)}`;
}

function academicAssetUrl(objectName: string) {
  return `/api/pages/academic-assets/${encodeURIComponent(objectName)}`;
}

function validateAssetFile(file: File, type: "image" | "document") {
  const accepted =
    type === "image" ? ACCEPTED_IMAGE_TYPES : ACCEPTED_DOCUMENT_TYPES;
  const maxSize = type === "image" ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE;
  if (!accepted.has(file.type)) {
    throw new ResponseError(
      400,
      type === "image"
        ? "Only AVIF, WebP, JPEG, or PNG images are allowed. Use WebP/AVIF for photos."
        : "Only PDF, DOC, or DOCX files are allowed.",
    );
  }
  if (file.size <= 0) throw new ResponseError(400, "Uploaded file is empty.");
  if (file.size > maxSize) {
    throw new ResponseError(
      400,
      type === "image"
        ? "Image file must be 5MB or smaller. Use WebP/AVIF for photos."
        : "Document file must be 25MB or smaller.",
    );
  }
}

function decodeAcademicObjectName(rawObjectName: string | undefined) {
  const objectName = decodeURIComponent(rawObjectName ?? "");
  if (!objectName.startsWith("academic/")) {
    throw new ResponseError(404, "Academic asset not found.");
  }
  return objectName;
}

export class AcademicPageService {
  static async listLevels() {
    const records = await Promise.all(LEVEL_KEYS.map(findLevelRecord));

    return LEVEL_KEYS.map((levelKey, index) => {
      return publicPageResponse(levelKey, records[index] ?? null);
    });
  }

  static async getLevel(rawLevelKey: string | undefined) {
    const levelKey = parseLevelKey(rawLevelKey);
    const [record, galleries] = await Promise.all([
      findLevelRecord(levelKey),
      GalleryService.listGalleries(),
    ]);

    return {
      ...pageResponse(levelKey, record),
      galleries,
    };
  }

  static async getPublicLevel(
    rawLevelKey: string | undefined,
    options: { previewDraft?: boolean } = {},
  ) {
    const levelKey = parseLevelKey(rawLevelKey);
    const record = await findLevelRecord(levelKey);

    if (options.previewDraft && record) {
      return pageResponse(levelKey, record);
    }

    const response = pageResponse(levelKey, record);
    return response.page.isPublished
      ? response
      : publicPageResponse(levelKey, record);
  }

  static async saveLevel(rawLevelKey: string | undefined, payload: unknown) {
    const levelKey = parseLevelKey(rawLevelKey);
    const data = parseSavePayload(payload);
    const status: AcademicStatus =
      data.status ?? (data.page.isPublished ? "PUBLISHED" : "DRAFT");
    const existing = await findLevelRecord(levelKey);
    await saveLevelRecord(levelKey, existing, data, status);

    return this.getLevel(levelKey);
  }

  static async uploadAsset(
    rawLevelKey: string | undefined,
    file: File,
    type: "image" | "document",
  ) {
    parseLevelKey(rawLevelKey);
    validateAssetFile(file, type);

    const objectName = academicObjectKey(type, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    await putMinioObject(objectName, buffer, {
      "Content-Type": file.type,
      "Cache-Control": "public, max-age=31536000",
    });

    return {
      path: academicAssetUrl(objectName),
      objectName,
      filename: file.name,
      contentType: file.type,
      size: file.size,
    };
  }

  static async getAssetFile(rawObjectName: string | undefined) {
    const objectName = decodeAcademicObjectName(rawObjectName);
    const [stat, buffer] = await Promise.all([
      statMinioObject(objectName),
      getMinioObjectBuffer(objectName),
    ]);

    return {
      buffer,
      contentType:
        String(
          stat.metaData?.["content-type"] ??
            stat.metaData?.["Content-Type"] ??
            "",
        ) || "application/octet-stream",
      size: stat.size,
    };
  }
}
