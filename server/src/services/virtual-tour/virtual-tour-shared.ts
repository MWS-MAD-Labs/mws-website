import { Prisma } from "@prisma/client";
import { z, type ZodError, type ZodTypeAny } from "zod";
import { ResponseError } from "../../error/response-error";

function validationMessage(error: ZodError) {
  return error.issues
    .map((issue) => {
      const path = issue.path.length ? issue.path.join(".") : "body";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}

export function parseVirtualTourPayload<T extends ZodTypeAny>(
  schema: T,
  payload: unknown,
): z.infer<T> {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new ResponseError(
      400,
      `Virtual tour validation failed. ${validationMessage(result.error)}`,
    );
  }
  return result.data;
}

export function requireVirtualTourId(
  id: string | undefined,
  label: "tour" | "scene" | "link",
) {
  if (!id || !z.string().uuid().safeParse(id).success) {
    throw new ResponseError(400, `Valid UUID virtual tour ${label} id is required.`);
  }
  return id;
}

export function handleVirtualTourDatabaseError(error: unknown): never {
  if (error instanceof ResponseError) throw error;

  const prismaError = error as { code?: string; meta?: { target?: unknown } };
  const isKnownError = error instanceof Prisma.PrismaClientKnownRequestError;
  const code = isKnownError ? error.code : prismaError.code;
  const target = isKnownError ? error.meta?.target : prismaError.meta?.target;

  if (code === "P2002") {
    const fields = Array.isArray(target)
      ? target.join(", ")
      : typeof target === "string"
        ? target
        : "unique fields";
    throw new ResponseError(
      409,
      `Virtual tour data with the same ${fields} already exists.`,
    );
  }

  if (code === "P2003") {
    throw new ResponseError(
      400,
      "Virtual tour references data that does not exist or is still in use.",
    );
  }

  if (code === "P2025") {
    throw new ResponseError(404, "Virtual tour data not found.");
  }

  throw error;
}
