import type { Context } from "hono";
import { ResponseError } from "../../error/response-error";
import { toJsonSafe } from "../../lib/json-response";
import { ContactPageService } from "../../services/contact-page-service";
import { PageDataService } from "../../services/page-data-service";

export class PublicPagesController {
  static async get(c: Context) {
    const slug = c.req.param("slug");

    if (slug === "home") {
      return c.json({ data: toJsonSafe(await PageDataService.getHome()) });
    }

    if (slug === "admissions" || slug === "admission") {
      return c.json({ data: toJsonSafe(await PageDataService.getAdmissions()) });
    }

    if (slug === "our-school") {
      return c.json({ data: toJsonSafe(await PageDataService.getOurSchool()) });
    }

    if (slug === "community-stories") {
      return c.json({
        data: toJsonSafe(await PageDataService.getCommunityStories()),
      });
    }

    if (slug === "contact") {
      const page = await ContactPageService.getPublic();
      return c.json({ data: page });
    }

    throw new ResponseError(404, "Page not found.");
  }
}
