import type { Context } from "hono";
import { toJsonSafe } from "../../lib/json-response";
import { PopupPromotedService } from "../../services/popup-promoted-service";

export class PublicPopupPromotedController {
  static async active(c: Context) {
    const popup = await PopupPromotedService.active();

    return c.json({
      data: popup ? toJsonSafe(popup) : null,
    });
  }
}
