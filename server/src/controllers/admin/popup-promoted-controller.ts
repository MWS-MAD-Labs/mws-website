import type { Context } from "hono";
import { ResponseError } from "../../error/response-error";
import { toJsonSafe } from "../../lib/json-response";
import { PopupPromotedService } from "../../services/popup-promoted-service";
import type { SessionVariables } from "../../types/hono-context";

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

export class PopupPromotedController {
  static async list(c: AdminContext) {
    const popups = await PopupPromotedService.list();

    return c.json({
      data: toJsonSafe(popups),
    });
  }

  static async get(c: AdminContext) {
    const popup = await PopupPromotedService.get(c.req.param("id"));

    return c.json({
      data: toJsonSafe(popup),
    });
  }

  static async create(c: AdminContext) {
    const body = await readJson(c);
    const popup = await PopupPromotedService.create(body);

    return c.json(
      {
        data: toJsonSafe(popup),
      },
      201,
    );
  }

  static async update(c: AdminContext) {
    const body = await readJson(c);
    const popup = await PopupPromotedService.update(c.req.param("id"), body);

    return c.json({
      data: toJsonSafe(popup),
    });
  }

  static async delete(c: AdminContext) {
    await PopupPromotedService.delete(c.req.param("id"));

    return c.body(null, 204);
  }
}
