import type { Context } from "hono";
import { ResponseError } from "../../error/response-error";
import { ContactPageService } from "../../services/contact-page-service";

export class PublicPagesController {
  static async get(c: Context) {
    const slug = c.req.param("slug");

    if (slug === "contact") {
      const page = await ContactPageService.getPublic();
      return c.json({ data: page });
    }

    throw new ResponseError(404, "Page not found.");
  }
}
