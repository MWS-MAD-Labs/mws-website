import type { PrismaClient } from "@prisma/client";
import { z, ZodError } from "zod";
import { ResponseError } from "../error/response-error";
import { getPrisma } from "../lib/prisma";

const uuid = z.string().trim().uuid();
const optionalUuid = uuid.nullable().optional();

const optionalText = (max?: number) => {
  const schema = z.string().trim();
  return (max ? schema.max(max) : schema).nullable().optional();
};

const requiredJson = z.custom<unknown>((value) => value !== undefined, {
  message: "Required",
});
const optionalDate = z.coerce.date().nullable().optional();

const academicSchema = z.strictObject({
  title: z.string().trim().min(1).max(255),
  description: optionalText(2000),
  coverImage: optionalText(1000),
  galleryId: optionalUuid,
});

const academicLevelSchema = z.strictObject({
  title: z.string().trim().min(1).max(255),
  description: optionalText(2000),
});

const faqSchema = z.strictObject({
  question: z.string().trim().min(1).max(500),
  answer: z.string().trim().min(1).max(20000),
  isActive: z.boolean().optional(),
});

const fixedLevelSchema = z.strictObject({
  academicLevelId: uuid,
  title: z.string().trim().min(1).max(255),
  description: optionalText(2000),
  coverImage: optionalText(1000),
  galleryId: optionalUuid,
  hero: requiredJson,
  overview: requiredJson,
  sections: requiredJson,
  status: z.string().trim().min(1).max(30).optional(),
  publishedAt: optionalDate,
});

const faqAttachSchema = z.strictObject({
  faqId: uuid,
  sortOrder: z.number().int().min(0).optional(),
});

const faqReorderSchema = z.strictObject({
  items: z
    .array(
      z.strictObject({
        faqId: uuid,
        sortOrder: z.number().int().min(0),
      }),
    )
    .optional(),
  faqIds: z.array(uuid).optional(),
});

const withAtLeastOneField = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) =>
  schema.partial().refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

export type AcademicCrudResource =
  | "academics"
  | "academic-levels"
  | "faqs"
  | "kindergartens"
  | "elementaries"
  | "junior-highs";

export type FixedAcademicCrudResource =
  | "kindergartens"
  | "elementaries"
  | "junior-highs";

type AcademicCrudModel = {
  resource: AcademicCrudResource;
  label: string;
  delegate: string;
  createSchema: z.ZodTypeAny;
  updateSchema: z.ZodTypeAny;
  include?: unknown;
  orderBy: unknown;
};

const fixedLevelInclude = {
  academicLevel: true,
  gallery: true,
  faqs: {
    orderBy: { sortOrder: "asc" },
    include: { faq: true },
  },
};

const academicCrudModels: Record<AcademicCrudResource, AcademicCrudModel> = {
  academics: {
    resource: "academics",
    label: "Academic",
    delegate: "academic",
    createSchema: academicSchema,
    updateSchema: withAtLeastOneField(academicSchema),
    include: { gallery: true },
    orderBy: { updatedAt: "desc" },
  },
  "academic-levels": {
    resource: "academic-levels",
    label: "Academic level",
    delegate: "academicLevel",
    createSchema: academicLevelSchema,
    updateSchema: withAtLeastOneField(academicLevelSchema),
    orderBy: { updatedAt: "desc" },
  },
  faqs: {
    resource: "faqs",
    label: "FAQ",
    delegate: "faq",
    createSchema: faqSchema,
    updateSchema: withAtLeastOneField(faqSchema),
    include: {
      _count: {
        select: {
          kindergartens: true,
          elementaries: true,
          juniorHighs: true,
        },
      },
    },
    orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
  },
  kindergartens: {
    resource: "kindergartens",
    label: "Kindergarten",
    delegate: "kindergarten",
    createSchema: fixedLevelSchema,
    updateSchema: withAtLeastOneField(fixedLevelSchema),
    include: fixedLevelInclude,
    orderBy: { updatedAt: "desc" },
  },
  elementaries: {
    resource: "elementaries",
    label: "Elementary",
    delegate: "elementary",
    createSchema: fixedLevelSchema,
    updateSchema: withAtLeastOneField(fixedLevelSchema),
    include: fixedLevelInclude,
    orderBy: { updatedAt: "desc" },
  },
  "junior-highs": {
    resource: "junior-highs",
    label: "Junior high",
    delegate: "juniorHigh",
    createSchema: fixedLevelSchema,
    updateSchema: withAtLeastOneField(fixedLevelSchema),
    include: fixedLevelInclude,
    orderBy: { updatedAt: "desc" },
  },
};

type PrismaDelegate = {
  findMany(args: unknown): Promise<unknown[]>;
  findUnique(args: unknown): Promise<unknown | null>;
  findFirst?(args: unknown): Promise<unknown | null>;
  create(args: unknown): Promise<unknown>;
  update(args: unknown): Promise<unknown>;
  delete(args: unknown): Promise<unknown>;
  deleteMany?(args: unknown): Promise<unknown>;
  upsert?(args: unknown): Promise<unknown>;
};

type FaqRelationModel = {
  resource: FixedAcademicCrudResource;
  label: string;
  levelDelegate: "kindergarten" | "elementary" | "juniorHigh";
  junctionDelegate: "kindergartenFaq" | "elementaryFaq" | "juniorHighFaq";
};

const faqRelationModels: Record<FixedAcademicCrudResource, FaqRelationModel> = {
  kindergartens: {
    resource: "kindergartens",
    label: "Kindergarten",
    levelDelegate: "kindergarten",
    junctionDelegate: "kindergartenFaq",
  },
  elementaries: {
    resource: "elementaries",
    label: "Elementary",
    levelDelegate: "elementary",
    junctionDelegate: "elementaryFaq",
  },
  "junior-highs": {
    resource: "junior-highs",
    label: "Junior high",
    levelDelegate: "juniorHigh",
    junctionDelegate: "juniorHighFaq",
  },
};

function modelFor(resource: AcademicCrudResource) {
  return academicCrudModels[resource];
}

function delegateFor(prisma: PrismaClient, model: AcademicCrudModel): PrismaDelegate {
  const delegate = (prisma as unknown as Record<string, PrismaDelegate>)[
    model.delegate
  ];

  if (!delegate) {
    throw new ResponseError(500, `${model.label} repository is not available.`);
  }

  return delegate;
}

function rawDelegate(prisma: PrismaClient, delegate: string): PrismaDelegate {
  const resolved = (prisma as unknown as Record<string, PrismaDelegate>)[delegate];
  if (!resolved) {
    throw new ResponseError(500, `${delegate} repository is not available.`);
  }
  return resolved;
}

function validationMessage(error: ZodError, model: AcademicCrudModel) {
  const details = error.issues
    .map((issue) => {
      const path = issue.path.length ? issue.path.join(".") : "body";
      return `${path}: ${issue.message}`;
    })
    .join("; ");

  return `${model.label} validation failed. ${details}`;
}

function parsePayload(
  model: AcademicCrudModel,
  payload: unknown,
  mode: "create" | "update",
) {
  const schema = mode === "create" ? model.createSchema : model.updateSchema;
  const result = schema.safeParse(payload);

  if (!result.success) {
    throw new ResponseError(400, validationMessage(result.error, model));
  }

  return result.data as Record<string, unknown>;
}

function handleDatabaseError(error: unknown, model: AcademicCrudModel): never {
  if (error instanceof ResponseError) throw error;

  const prismaError = error as { code?: string; meta?: { target?: unknown } };

  if (prismaError.code === "P2002") {
    throw new ResponseError(409, `${model.label} already exists.`);
  }

  if (prismaError.code === "P2003") {
    throw new ResponseError(
      400,
      `${model.label} references data that does not exist or cannot be changed.`,
    );
  }

  if (prismaError.code === "P2025") {
    throw new ResponseError(404, `${model.label} not found.`);
  }

  console.error(`[CMS] ${model.label} database error`, {
    code: prismaError.code ?? "unknown",
  });
  throw new ResponseError(500, `Database error while processing ${model.label}.`);
}

export class AcademicCrudService {
  static async list(resource: AcademicCrudResource) {
    const model = modelFor(resource);
    const delegate = delegateFor(getPrisma(), model);

    try {
      return await delegate.findMany({
        orderBy: model.orderBy,
        include: model.include,
      });
    } catch (error) {
      handleDatabaseError(error, model);
    }
  }

  static async detail(resource: AcademicCrudResource, id: string) {
    const model = modelFor(resource);
    const delegate = delegateFor(getPrisma(), model);

    try {
      const item = await delegate.findUnique({
        where: { id },
        include: model.include,
      });

      if (!item) throw new ResponseError(404, `${model.label} not found.`);
      return item;
    } catch (error) {
      handleDatabaseError(error, model);
    }
  }

  static async create(resource: AcademicCrudResource, payload: unknown) {
    const model = modelFor(resource);
    const data = parsePayload(model, payload, "create");
    const delegate = delegateFor(getPrisma(), model);

    try {
      return await delegate.create({
        data,
        include: model.include,
      });
    } catch (error) {
      handleDatabaseError(error, model);
    }
  }

  static async update(
    resource: AcademicCrudResource,
    id: string,
    payload: unknown,
  ) {
    const model = modelFor(resource);
    const data = parsePayload(model, payload, "update");
    const delegate = delegateFor(getPrisma(), model);

    try {
      return await delegate.update({
        where: { id },
        data,
        include: model.include,
      });
    } catch (error) {
      handleDatabaseError(error, model);
    }
  }

  static async delete(resource: AcademicCrudResource, id: string) {
    const model = modelFor(resource);
    const prisma = getPrisma();
    const delegate = delegateFor(prisma, model);

    try {
      if (resource === "faqs") {
        await prisma.$transaction([
          prisma.kindergartenFaq.deleteMany({ where: { faqId: id } }),
          prisma.elementaryFaq.deleteMany({ where: { faqId: id } }),
          prisma.juniorHighFaq.deleteMany({ where: { faqId: id } }),
          prisma.faq.delete({ where: { id } }),
        ]);
        return { id, deleted: true };
      }

      if (
        resource === "kindergartens" ||
        resource === "elementaries" ||
        resource === "junior-highs"
      ) {
        const relation = faqRelationModels[resource];
        const junction = rawDelegate(prisma, relation.junctionDelegate);
        await junction.deleteMany?.({ where: { academicLevelId: id } });
      }

      await delegate.delete({ where: { id } });
      return { id, deleted: true };
    } catch (error) {
      handleDatabaseError(error, model);
    }
  }

  static async attachFaq(
    resource: FixedAcademicCrudResource,
    academicLevelId: string,
    payload: unknown,
  ) {
    const parsed = faqAttachSchema.safeParse(payload);
    const relation = faqRelationModels[resource];

    if (!parsed.success) {
      throw new ResponseError(400, validationMessage(parsed.error, academicCrudModels.faqs));
    }

    const prisma = getPrisma();
    const levelDelegate = rawDelegate(prisma, relation.levelDelegate);
    const junction = rawDelegate(prisma, relation.junctionDelegate);

    try {
      const [level, faq] = await Promise.all([
        levelDelegate.findUnique({ where: { id: academicLevelId } }),
        prisma.faq.findUnique({ where: { id: parsed.data.faqId } }),
      ]);

      if (!level) throw new ResponseError(404, `${relation.label} not found.`);
      if (!faq) throw new ResponseError(404, "FAQ not found.");
      if (!faq.isActive) {
        throw new ResponseError(400, "Only active FAQ records can be attached.");
      }

      if (!junction.upsert) {
        throw new ResponseError(500, `${relation.label} FAQ repository is not available.`);
      }

      return await junction.upsert({
        where: {
          academicLevelId_faqId: {
            academicLevelId,
            faqId: parsed.data.faqId,
          },
        },
        update: {
          sortOrder: parsed.data.sortOrder ?? 0,
        },
        create: {
          academicLevelId,
          faqId: parsed.data.faqId,
          sortOrder: parsed.data.sortOrder ?? 0,
        },
        include: { faq: true },
      });
    } catch (error) {
      handleDatabaseError(error, academicCrudModels.faqs);
    }
  }

  static async detachFaq(
    resource: FixedAcademicCrudResource,
    academicLevelId: string,
    faqId: string,
  ) {
    const relation = faqRelationModels[resource];
    const junction = rawDelegate(getPrisma(), relation.junctionDelegate);

    try {
      await junction.delete({
        where: {
          academicLevelId_faqId: {
            academicLevelId,
            faqId,
          },
        },
      });
      return { academicLevelId, faqId, detached: true };
    } catch (error) {
      handleDatabaseError(error, academicCrudModels.faqs);
    }
  }

  static async reorderFaqs(
    resource: FixedAcademicCrudResource,
    academicLevelId: string,
    payload: unknown,
  ) {
    const parsed = faqReorderSchema.safeParse(payload);
    if (!parsed.success) {
      throw new ResponseError(400, validationMessage(parsed.error, academicCrudModels.faqs));
    }

    const relation = faqRelationModels[resource];
    const junction = rawDelegate(getPrisma(), relation.junctionDelegate);
    const items =
      parsed.data.items ??
      parsed.data.faqIds?.map((faqId, sortOrder) => ({ faqId, sortOrder })) ??
      [];

    try {
      for (const item of items) {
        await junction.update({
          where: {
            academicLevelId_faqId: {
              academicLevelId,
              faqId: item.faqId,
            },
          },
          data: { sortOrder: item.sortOrder },
        });
      }

      return { academicLevelId, reordered: true };
    } catch (error) {
      handleDatabaseError(error, academicCrudModels.faqs);
    }
  }
}
