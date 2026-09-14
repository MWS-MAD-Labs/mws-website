import type { PrismaClient } from "@prisma/client";
import { ZodError } from "zod";
import { ResponseError } from "../error/response-error";
import {
  adminCrudModels,
  type AdminCrudModel,
  type AdminCrudResource,
} from "../models/admin-crud-model";
import { getPrisma } from "../lib/prisma";

const listQuerySchema = {
  parse(query: Record<string, string | undefined>) {
    const page = Number(query["page"] ?? 1);
    const pageSize = Number(query["pageSize"] ?? 20);

    if (!Number.isInteger(page) || page < 1) {
      throw new ResponseError(400, "page must be a positive integer.");
    }

    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
      throw new ResponseError(400, "pageSize must be between 1 and 100.");
    }

    return { page, pageSize };
  },
};

type PrismaDelegate = {
  findMany(args: unknown): Promise<unknown[]>;
  count(args: unknown): Promise<number>;
  findFirst(args: unknown): Promise<unknown | null>;
  create(args: unknown): Promise<unknown>;
  update(args: unknown): Promise<unknown>;
  delete(args: unknown): Promise<unknown>;
};

type NewsPostPayload = {
  tagIds?: string[];
  [key: string]: unknown;
};

function modelFor(resource: AdminCrudResource): AdminCrudModel {
  return adminCrudModels[resource];
}

function delegateFor(prisma: PrismaClient, model: AdminCrudModel): PrismaDelegate {
  const delegate = (prisma as unknown as Record<string, PrismaDelegate>)[
    model.delegate
  ];

  if (!delegate) {
    throw new ResponseError(500, `${model.label} repository is not available.`);
  }

  return delegate;
}

function activeWhere(model: AdminCrudModel, extra: Record<string, unknown> = {}) {
  return model.softDelete ? { ...extra, deletedAt: null } : extra;
}

function validationMessage(error: ZodError, model: AdminCrudModel) {
  const details = error.issues
    .map((issue) => {
      const path = issue.path.length ? issue.path.join(".") : "body";
      return `${path}: ${issue.message}`;
    })
    .join("; ");

  return `${model.label} validation failed. ${details}`;
}

function parsePayload(model: AdminCrudModel, payload: unknown, mode: "create" | "update") {
  const schema = mode === "create" ? model.createSchema : model.updateSchema;
  const result = schema.safeParse(payload);

  if (!result.success) {
    throw new ResponseError(400, validationMessage(result.error, model));
  }

  return result.data as Record<string, unknown>;
}

function mutationData(model: AdminCrudModel, payload: Record<string, unknown>) {
  if (!model.timestamps) return payload;

  return {
    ...payload,
    updatedAt: new Date(),
  };
}

function createArgs(model: AdminCrudModel, data: Record<string, unknown>) {
  if (model.resource !== "news-posts") {
    return { data, include: model.include };
  }

  const { tagIds, ...postData } = data as NewsPostPayload;
  return {
    data: {
      ...postData,
      postTags: tagIds?.length
        ? { createMany: { data: tagIds.map((tagId) => ({ tagId })) } }
        : undefined,
    },
    include: model.include,
  };
}

function updateArgs(model: AdminCrudModel, id: string, data: Record<string, unknown>) {
  if (model.resource !== "news-posts") {
    return {
      where: { id },
      data: mutationData(model, data),
      include: model.include,
    };
  }

  const { tagIds, ...postData } = data as NewsPostPayload;
  const nextData: Record<string, unknown> = mutationData(model, postData);

  if (tagIds) {
    nextData.postTags = {
      deleteMany: {},
      createMany: { data: tagIds.map((tagId) => ({ tagId })) },
    };
  }

  return {
    where: { id },
    data: nextData,
    include: model.include,
  };
}

function formatUniqueTarget(error: { meta?: { target?: unknown } }) {
  const target = error.meta?.target;
  if (Array.isArray(target)) return target.join(", ");
  if (typeof target === "string") return target;
  return "unique field";
}

function handleDatabaseError(error: unknown, model: AdminCrudModel): never {
  if (error instanceof ResponseError) throw error;

  const prismaError = error as { code?: string; meta?: { target?: unknown } };

  if (prismaError.code === "P2002") {
    throw new ResponseError(
      409,
      `${model.label} with the same ${formatUniqueTarget(prismaError)} already exists.`,
    );
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

  console.error(`${model.label} database error:`, error);
  throw new ResponseError(500, `Database error while processing ${model.label}.`);
}

export class AdminCrudService {
  static listResources() {
    return Object.values(adminCrudModels).map((model) => ({
      resource: model.resource,
      label: model.label,
    }));
  }

  static async list(
    resource: AdminCrudResource,
    rawQuery: Record<string, string | undefined>,
  ) {
    const model = modelFor(resource);
    const { page, pageSize } = listQuerySchema.parse(rawQuery);
    const prisma = getPrisma();
    const delegate = delegateFor(prisma, model);
    const where = activeWhere(model);
    const skip = (page - 1) * pageSize;

    try {
      const [items, total] = await Promise.all([
        delegate.findMany({
          where,
          orderBy: model.defaultOrderBy,
          skip,
          take: pageSize,
          include: model.include,
        }),
        delegate.count({ where }),
      ]);

      return {
        items,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      handleDatabaseError(error, model);
    }
  }

  static async findById(resource: AdminCrudResource, id: string) {
    const model = modelFor(resource);
    const prisma = getPrisma();
    const delegate = delegateFor(prisma, model);

    try {
      const item = await delegate.findFirst({
        where: activeWhere(model, { id }),
        include: model.include,
      });

      if (!item) {
        throw new ResponseError(404, `${model.label} not found.`);
      }

      return item;
    } catch (error) {
      handleDatabaseError(error, model);
    }
  }

  static async create(resource: AdminCrudResource, payload: unknown) {
    const model = modelFor(resource);
    const data = parsePayload(model, payload, "create");
    const prisma = getPrisma();
    const delegate = delegateFor(prisma, model);

    try {
      return await delegate.create(createArgs(model, data));
    } catch (error) {
      handleDatabaseError(error, model);
    }
  }

  static async update(resource: AdminCrudResource, id: string, payload: unknown) {
    const model = modelFor(resource);
    const data = parsePayload(model, payload, "update");
    const prisma = getPrisma();
    const delegate = delegateFor(prisma, model);

    try {
      const existing = await delegate.findFirst({
        where: activeWhere(model, { id }),
        select: { id: true },
      });

      if (!existing) {
        throw new ResponseError(404, `${model.label} not found.`);
      }

      return await delegate.update(updateArgs(model, id, data));
    } catch (error) {
      handleDatabaseError(error, model);
    }
  }

  static async delete(resource: AdminCrudResource, id: string) {
    const model = modelFor(resource);
    const prisma = getPrisma();
    const delegate = delegateFor(prisma, model);

    try {
      const existing = await delegate.findFirst({
        where: activeWhere(model, { id }),
        select: { id: true },
      });

      if (!existing) {
        throw new ResponseError(404, `${model.label} not found.`);
      }

      if (model.softDelete) {
        await delegate.update({
          where: { id },
          data: mutationData(model, { deletedAt: new Date() }),
        });
      } else {
        await delegate.delete({ where: { id } });
      }

      return { id, deleted: true };
    } catch (error) {
      handleDatabaseError(error, model);
    }
  }
}
