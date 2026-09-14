import type { Context } from "hono";
import { ResponseError } from "../../error/response-error";
import { toJsonSafe } from "../../lib/json-response";
import { type AdminCrudResource } from "../../models/admin-crud-model";
import { AdminCrudService } from "../../services/admin-crud-service";
import type { SessionVariables } from "../../types/hono-context";

const idSchema = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function readJsonBody(c: Context) {
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

export class AdminCrudController {
  static resources(c: Context<{ Variables: SessionVariables }>) {
    return c.json({ data: AdminCrudService.listResources() });
  }

  static list(resource: AdminCrudResource) {
    return async (c: Context<{ Variables: SessionVariables }>) => {
      const result = await AdminCrudService.list(resource, c.req.query());

      return c.json({ data: toJsonSafe(result) });
    };
  }

  static detail(resource: AdminCrudResource) {
    return async (c: Context<{ Variables: SessionVariables }>) => {
      const result = await AdminCrudService.findById(resource, idFromParam(c));

      return c.json({ data: toJsonSafe(result) });
    };
  }

  static create(resource: AdminCrudResource) {
    return async (c: Context<{ Variables: SessionVariables }>) => {
      const result = await AdminCrudService.create(resource, await readJsonBody(c));

      return c.json({ data: toJsonSafe(result) }, 201);
    };
  }

  static update(resource: AdminCrudResource) {
    return async (c: Context<{ Variables: SessionVariables }>) => {
      const result = await AdminCrudService.update(
        resource,
        idFromParam(c),
        await readJsonBody(c),
      );

      return c.json({ data: toJsonSafe(result) });
    };
  }

  static delete(resource: AdminCrudResource) {
    return async (c: Context<{ Variables: SessionVariables }>) => {
      const result = await AdminCrudService.delete(resource, idFromParam(c));

      return c.json({ data: result });
    };
  }
}
