import type { Context } from "hono";
import { ResponseError } from "../../error/response-error";
import { toJsonSafe } from "../../lib/json-response";
import {
  AcademicCrudService,
  type AcademicCrudResource,
  type FixedAcademicCrudResource,
} from "../../services/academic-crud-service";

const idSchema =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function readJson(c: Context) {
  try {
    return await c.req.json();
  } catch {
    throw new ResponseError(400, "Invalid JSON body.");
  }
}

function idFromParam(c: Context) {
  const id = c.req.param("id");
  if (!id || !idSchema.test(id)) {
    throw new ResponseError(400, "Valid UUID id is required.");
  }

  return id;
}

export class AdminAcademicCrudController {
  static list(resource: AcademicCrudResource) {
    return async (c: Context) => {
      const result = await AcademicCrudService.list(resource);
      return c.json({ data: toJsonSafe(result) });
    };
  }

  static detail(resource: AcademicCrudResource) {
    return async (c: Context) => {
      const result = await AcademicCrudService.detail(resource, idFromParam(c));
      return c.json({ data: toJsonSafe(result) });
    };
  }

  static create(resource: AcademicCrudResource) {
    return async (c: Context) => {
      const result = await AcademicCrudService.create(resource, await readJson(c));
      return c.json({ data: toJsonSafe(result) }, 201);
    };
  }

  static update(resource: AcademicCrudResource) {
    return async (c: Context) => {
      const result = await AcademicCrudService.update(
        resource,
        idFromParam(c),
        await readJson(c),
      );
      return c.json({ data: toJsonSafe(result) });
    };
  }

  static delete(resource: AcademicCrudResource) {
    return async (c: Context) => {
      const result = await AcademicCrudService.delete(resource, idFromParam(c));
      return c.json({ data: result });
    };
  }

  static attachFaq(resource: FixedAcademicCrudResource) {
    return async (c: Context) => {
      const result = await AcademicCrudService.attachFaq(
        resource,
        idFromParam(c),
        await readJson(c),
      );
      return c.json({ data: toJsonSafe(result) }, 201);
    };
  }

  static detachFaq(resource: FixedAcademicCrudResource) {
    return async (c: Context) => {
      const faqId = c.req.param("faqId");
      if (!faqId || !idSchema.test(faqId)) {
        throw new ResponseError(400, "Valid UUID faqId is required.");
      }

      const result = await AcademicCrudService.detachFaq(
        resource,
        idFromParam(c),
        faqId,
      );
      return c.json({ data: result });
    };
  }

  static reorderFaqs(resource: FixedAcademicCrudResource) {
    return async (c: Context) => {
      const result = await AcademicCrudService.reorderFaqs(
        resource,
        idFromParam(c),
        await readJson(c),
      );
      return c.json({ data: result });
    };
  }
}
