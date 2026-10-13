import { Prisma } from "@prisma/client";
import { z, type ZodError, type ZodTypeAny } from "zod";
import { ResponseError } from "../error/response-error";
import { PopupPromotedRepository } from "../repositories/popup-promoted-repository";
import {
  createPopupPromotedSchema,
  updatePopupPromotedSchema,
} from "../validation/schemas/popup-promoted-schema";

const repository = new PopupPromotedRepository();

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
      `Popup promoted validation failed. ${validationMessage(result.error)}`,
    );
  }
  return result.data;
}

function requireId(id: string | undefined) {
  if (!id || !z.string().uuid().safeParse(id).success) {
    throw new ResponseError(400, "Valid UUID popup promoted id is required.");
  }

  return id;
}

function handleDatabaseError(error: unknown): never {
  if (error instanceof ResponseError) throw error;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      throw new ResponseError(404, "Popup promoted not found.");
    }
  }

  const prismaError = error as { code?: string };
  if (prismaError.code === "P2025") {
    throw new ResponseError(404, "Popup promoted not found.");
  }

  throw error;
}

export class PopupPromotedService {
  static async list() {
    return repository.findAll();
  }

  static async active() {
    return repository.findActive();
  }

  static async get(id: string | undefined) {
    const popupId = requireId(id);
    const popup = await repository.findById(popupId);

    if (!popup) {
      throw new ResponseError(404, "Popup promoted not found.");
    }

    return popup;
  }

  static async create(payload: unknown) {
    const data = parse(createPopupPromotedSchema, payload);

    try {
      return await repository.create(data);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async update(id: string | undefined, payload: unknown) {
    const popupId = requireId(id);
    const existing = await this.get(popupId);

    const data = parse(updatePopupPromotedSchema, payload);

    // The schema only sees the dates sent in this request; check the range
    // against the stored value of whichever date was left out.
    const activeFrom = data.activeFrom === undefined ? existing.activeFrom : data.activeFrom;
    const activeUntil = data.activeUntil === undefined ? existing.activeUntil : data.activeUntil;
    if (activeFrom && activeUntil && activeUntil.getTime() < activeFrom.getTime()) {
      throw new ResponseError(
        400,
        "Popup promoted validation failed. activeUntil: Active until must be after active from",
      );
    }

    try {
      return await repository.update(popupId, data);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  static async delete(id: string | undefined) {
    const popupId = requireId(id);
    await this.get(popupId);

    try {
      await repository.delete(popupId);
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}
