import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import { ResponseError } from "../../error/response-error";
import { toJsonSafe } from "../../lib/json-response";
import { sessionCookieName, verifySession } from "../../lib/session";
import { ContactPageService } from "../../services/contact-page-service";
import { AcademicPageService } from "../../services/academic-page-service";
import { PageDataService } from "../../services/page-data-service";

export class PublicPagesController {
  static async getAcademicLevel(c: Context) {
    const previewDraft = c.req.query("preview") === "draft";

    if (previewDraft) {
      const token = getCookie(c, sessionCookieName());
      const session = token ? await verifySession(token) : null;
      if (!session?.user?.isActive) {
        throw new ResponseError(401, "Not signed in.");
      }
    }

    return c.json({
      data: toJsonSafe(
        await AcademicPageService.getPublicLevel(c.req.param("levelKey"), {
          previewDraft,
        }),
      ),
    });
  }

  static async getAcademicAsset(c: Context) {
    const file = await AcademicPageService.getAssetFile(c.req.param("objectName"));
    c.header("Content-Type", file.contentType);
    c.header("Content-Length", String(file.size));
    c.header("Cache-Control", "public, max-age=31536000");
    return c.body(file.buffer);
  }

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

    if (slug === "academic") {
      return c.json({ data: toJsonSafe(await AcademicPageService.listLevels()) });
    }

    throw new ResponseError(404, "Page not found.");
  }
}
