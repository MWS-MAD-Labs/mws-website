import type { Context } from "hono";
import { ResponseError } from "../../error/response-error";
import type { SessionVariables } from "../../types/hono-context";
import { PartnerService } from "../../services/partner-service";
import { toJsonSafe } from "../../lib/json-response";

type AdminContext = Context<{
  Variables: SessionVariables;
}>;

async function readJson(c: AdminContext) {
  try {
    return await c.req.json();
  } catch {
    throw new ResponseError(400, "Invalid JSON body.");
  }
}

export class PartnersController {
  static async list(c: AdminContext) {
    const partners = await PartnerService.list();

    return c.json({
      data: toJsonSafe(partners),
    });
  }

  static async get(c: AdminContext) {
    const partner = await PartnerService.get(c.req.param("id"));

    return c.json({
      data: toJsonSafe(partner),
    });
  }

  static async create(c: AdminContext) {
    const body = await readJson(c);

    const partner = await PartnerService.create(body);

    return c.json(
      {
        data: toJsonSafe(partner),
      },
      201,
    );
  }

  static async update(c: AdminContext) {
    const body = await readJson(c);

    const partner = await PartnerService.update(c.req.param("id"), body);

    return c.json({
      data: toJsonSafe(partner),
    });
  }

  static async delete(c: AdminContext) {
    await PartnerService.delete(c.req.param("id"));

    return c.body(null, 204);
  }
}
