import type { Context } from "hono";
import { ResponseError } from "../../error/response-error";
import { toJsonSafe } from "../../lib/json-response";
import { NewsService } from "../../services/news-service";
import type { SessionVariables } from "../../types/hono-context";

async function readJson(c: Context) {
  try {
    return await c.req.json();
  } catch {
    throw new ResponseError(400, "Invalid JSON body.");
  }
}

function ok(c: Context, data: unknown, status: 200 | 201 = 200) {
  return c.json({ data: toJsonSafe(data) }, status);
}

export class NewsController {
  // ---------- Categories ----------

  static async listCategories(c: Context) {
    return ok(c, await NewsService.listCategories());
  }

  static async detailCategory(c: Context) {
    return ok(c, await NewsService.getCategory(c.req.param("id")));
  }

  static async createCategory(c: Context) {
    return ok(c, await NewsService.createCategory(await readJson(c)), 201);
  }

  static async updateCategory(c: Context) {
    return ok(
      c,
      await NewsService.updateCategory(c.req.param("id"), await readJson(c)),
    );
  }

  static async deleteCategory(c: Context) {
    return ok(c, await NewsService.deleteCategory(c.req.param("id")));
  }

  // ---------- Tags ----------

  static async listTags(c: Context) {
    return ok(c, await NewsService.listTags());
  }

  static async detailTag(c: Context) {
    return ok(c, await NewsService.getTag(c.req.param("id")));
  }

  static async createTag(c: Context) {
    return ok(c, await NewsService.createTag(await readJson(c)), 201);
  }

  static async updateTag(c: Context) {
    return ok(
      c,
      await NewsService.updateTag(c.req.param("id"), await readJson(c)),
    );
  }

  static async deleteTag(c: Context) {
    return ok(c, await NewsService.deleteTag(c.req.param("id")));
  }

  // ---------- Posts ----------

  static async listPosts(c: Context) {
    return ok(c, await NewsService.listPosts(c.req.query()));
  }

  static async detailPost(c: Context) {
    return ok(c, await NewsService.getPost(c.req.param("id")));
  }

  static async createPost(c: Context<{ Variables: SessionVariables }>) {
    // authorId comes from the session, never from the body.
    return ok(
      c,
      await NewsService.createPost(await readJson(c), c.var.user.id),
      201,
    );
  }

  static async updatePost(c: Context) {
    return ok(
      c,
      await NewsService.updatePost(c.req.param("id"), await readJson(c)),
    );
  }

  static async deletePost(c: Context) {
    return ok(c, await NewsService.deletePost(c.req.param("id")));
  }

  // ---------- Post media ----------

  static async listMedia(c: Context) {
    return ok(c, await NewsService.listMedia(c.req.param("id")));
  }

  static async detailMedia(c: Context) {
    return ok(
      c,
      await NewsService.getMedia(c.req.param("id"), c.req.param("mediaId")),
    );
  }

  static async createMedia(c: Context) {
    return ok(
      c,
      await NewsService.createMedia(c.req.param("id"), await readJson(c)),
      201,
    );
  }

  static async updateMedia(c: Context) {
    return ok(
      c,
      await NewsService.updateMedia(
        c.req.param("id"),
        c.req.param("mediaId"),
        await readJson(c),
      ),
    );
  }

  static async deleteMedia(c: Context) {
    return ok(
      c,
      await NewsService.deleteMedia(c.req.param("id"), c.req.param("mediaId")),
    );
  }
}
