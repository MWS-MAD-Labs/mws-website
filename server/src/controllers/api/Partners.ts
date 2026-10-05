import type { Context } from "hono";
import { toJsonSafe } from "../../lib/json-response";
import { PartnerService } from "../../services/partner-service";

export class PublicPartnersController {
  static async list(c: Context) {
    const partners = await PartnerService.publicLogos();

    return c.json({ data: toJsonSafe(partners) });
  }
}
