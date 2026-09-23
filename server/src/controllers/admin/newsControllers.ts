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

type MultipartValue = string | File;
type MultipartBody = Record<string, MultipartValue | MultipartValue[]>;

function firstFormValue(value: MultipartValue | MultipartValue[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function readImageUpload(c: Context) {
  const body = (await c.req.parseBody()) as MultipartBody;
  const file = firstFormValue(body.file);

  if (!(file instanceof File)) {
    throw new ResponseError(400, "Image file is required.");
  }

  const text = (key: string) => {
    const value = firstFormValue(body[key]);
    return typeof value === "string" ? value : undefined;
  };

  return {
    file,
    metadata: {
      alt: text("alt"),
      caption: text("caption"),
      sortOrder: text("sortOrder"),
      // COVER or ARTICLE; the service defaults to ARTICLE when absent.
      purpose: text("purpose"),
    },
  };
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

  static async uploadImageMedia(c: Context) {
    const { file, metadata } = await readImageUpload(c);
    return ok(
      c,
      await NewsService.uploadImageMedia(c.req.param("id"), file, metadata),
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
