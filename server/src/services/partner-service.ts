import { Prisma } from "@prisma/client";
import { z, type ZodError, type ZodTypeAny } from "zod";
import { ResponseError } from "../error/response-error";
import { PartnerRepository } from "../repositories/partner-repository";
import {
  createPartnerSchema,
  updatePartnerSchema,
} from "../validation/schemas/partner-schema";

const repository = new PartnerRepository();

function validationMessage(error: ZodError) {
  return error.issues
    .map((issue) => {
      const path = issue.path.length ? issue.path.join(".") : "body";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}

function parse<T extends ZodTypeAny>(schema: T, payload: unknown): z.infer<T> {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new ResponseError(
      400,
      `Partner validation failed. ${validationMessage(result.error)}`,
    );
  }
  return result.data;
}

function requireId(id: string | undefined) {
  if (!id || !z.string().uuid().safeParse(id).success) {
    throw new ResponseError(400, "Valid UUID partner id is required.");
  }

  return id;
}

function uniqueTarget(error: { meta?: { target?: unknown } }) {
  const target = error.meta?.target;
  if (Array.isArray(target)) return target.join(", ");
  if (typeof target === "string") return target;
  return "unique field";
}

function handleDatabaseError(error: unknown): never {
  if (error instanceof ResponseError) throw error;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      throw new ResponseError(
        409,
        `Partner with the same ${uniqueTarget(error)} already exists.`,
      );
    }

    if (error.code === "P2003") {
      throw new ResponseError(
        400,
        "Partner references data that does not exist.",
      );
    }

    if (error.code === "P2025") {
      throw new ResponseError(404, "Partner not found.");
    }
  }

  const prismaError = error as { code?: string; meta?: { target?: unknown } };
  if (prismaError.code === "P2002") {
    throw new ResponseError(
      409,
      `Partner with the same ${uniqueTarget(prismaError)} already exists.`,
    );
  }

  if (prismaError.code === "P2003") {
    throw new ResponseError(
      400,
      "Partner references data that does not exist.",
    );
  }

  if (prismaError.code === "P2025") {
    throw new ResponseError(404, "Partner not found.");
  }

  throw error;
}

export class PartnerService {
  static async list() {
    return repository.findAll();
  }

  static async publicLogos() {
    const partners = await repository.findAll();

    return partners
      .filter((partner) => partner.status.trim().toLowerCase() === "active")
      .map((partner) => ({ logo: partner.logo }));
  }

  static async get(id: string | undefined) {
    const partnerId = requireId(id);

    const partner = await repository.findById(partnerId);

    if (!partner) {
      throw new ResponseError(404, "Partner not found");
    }

    return partner;
  }

  static async create(payload: unknown) {
    const data = parse(createPartnerSchema, payload);

    try {
      return await repository.create(data);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async update(id: string | undefined, payload: unknown) {
    const partnerId = requireId(id);

    await this.get(partnerId);

    const data = parse(updatePartnerSchema, payload);

    try {
      return await repository.update(partnerId, data);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async delete(id: string | undefined) {
    const partnerId = requireId(id);

    await this.get(partnerId);

    try {
      await repository.delete(partnerId);
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}
