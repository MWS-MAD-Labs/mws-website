import { z, ZodError } from "zod";
import { ResponseError } from "../error/response-error";
import {
  deleteMinioObject,
  getMinioObjectBuffer,
  putMinioObject,
  statMinioObject,
} from "../lib/minio";
import {
  newsCategorySchema,
  newsPostMediaSchema,
  newsPostSchema,
  newsTagSchema,
} from "../models/newsModels";
import {
  NewsRepository,
  type NewsPostFilters,
  type NewsPostWithRelations,
} from "../repositories/news-repository";

type NewsStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

const uuidSchema = z.string().trim().uuid();

const categoryUpdateSchema = newsCategorySchema.partial();
const tagUpdateSchema = newsTagSchema.partial();
const postUpdateSchema = newsPostSchema.partial();
const mediaCreateSchema = newsPostMediaSchema;
const mediaUpdateSchema = newsPostMediaSchema.omit({ newsPostId: true }).partial();
const imageUploadMetadataSchema = z.object({
  alt: z.string().trim().max(255).optional(),
  caption: z.string().trim().max(2000).optional(),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
});

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  categoryId: uuidSchema.optional(),
  tagId: uuidSchema.optional(),
  isFeatured: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  search: z.string().trim().min(1).optional(),
});

function flatten(error: ZodError) {
  return error.issues
    .map((issue) => {
      const path = issue.path.length ? issue.path.join(".") : "body";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}

function parse<T extends z.ZodTypeAny>(
  schema: T,
  payload: unknown,
  label: string,
): z.infer<T> {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new ResponseError(400, `${label} validation failed. ${flatten(result.error)}`);
  }
  return result.data;
}

/**
 * Zod keeps applying `.default()` after `.partial()`, so a PATCH that only sets
 * `title` would still ship `content: {}`, `status: "DRAFT"`, `readTime: 0`, ...
 * and silently wipe those columns. Keep only the keys the client actually sent.
 */
function parseUpdate<T extends z.ZodTypeAny>(
  schema: T,
  payload: unknown,
  label: string,
): Partial<z.infer<T>> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ResponseError(400, `${label} payload must be a JSON object.`);
  }

  const sent = new Set(Object.keys(payload as Record<string, unknown>));
  const parsed = parse(schema, payload, label) as Record<string, unknown>;

  const data = Object.fromEntries(
    Object.entries(parsed).filter(([key]) => sent.has(key)),
  );

  if (!Object.keys(data).length) {
    throw new ResponseError(400, `${label} update requires at least one field.`);
  }

  return data as Partial<z.infer<T>>;
}

function requireUuid(id: string | undefined, label: string): string {
  if (!id || !uuidSchema.safeParse(id).success) {
    throw new ResponseError(400, `Valid UUID ${label} is required.`);
  }
  return id;
}

function uniqueTarget(error: { meta?: { target?: unknown } }): string {
  const target = error.meta?.target;
  if (Array.isArray(target)) return target.join(", ");
  if (typeof target === "string") return target;
  return "unique field";
}

function handleDatabaseError(error: unknown, label: string): never {
  if (error instanceof ResponseError) throw error;

  const prismaError = error as { code?: string; meta?: { target?: unknown } };

  if (prismaError.code === "P2002") {
    throw new ResponseError(
      409,
      `${label} with the same ${uniqueTarget(prismaError)} already exists.`,
    );
  }

  if (prismaError.code === "P2003") {
    throw new ResponseError(
      400,
      `${label} references data that does not exist.`,
    );
  }

  if (prismaError.code === "P2025") {
    throw new ResponseError(404, `${label} not found.`);
  }

  throw error;
}

function sanitizeFileName(name: string) {
  const safe = name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  return safe || "image";
}

function imageObjectKey(fileName: string) {
  return `news/images/${crypto.randomUUID()}-${sanitizeFileName(fileName)}`;
}

function validateImageFile(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
    throw new ResponseError(400, "Only JPEG, PNG, WebP, or GIF images are allowed.");
  }

  if (file.size <= 0) {
    throw new ResponseError(400, "Image file is empty.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new ResponseError(400, "Image file must be 10MB or smaller.");
  }
}

function isUploadedNewsImage(url: string) {
  return url.startsWith("news/images/");
}

/**
 * `status`, `isPublished` and `publishedAt` can contradict each other, so
 * `status` is treated as the single source of truth and the other two are
 * derived from it. Change this one function if you want different behaviour.
 */
function derivePublication(
  data: {
    status?: NewsStatus;
    isPublished?: boolean;
    publishedAt?: Date | null;
  },
  existing?: { status: NewsStatus; publishedAt: Date | null },
) {
  const touched =
    data.status !== undefined ||
    data.isPublished !== undefined ||
    data.publishedAt !== undefined;

  if (existing && !touched) return {};

  const status = data.status ?? existing?.status ?? "DRAFT";

  if (status !== "PUBLISHED") {
    return {
      status,
      isPublished: false,
      publishedAt:
        data.publishedAt !== undefined
          ? data.publishedAt
          : (existing?.publishedAt ?? null),
    };
  }

  return {
    status,
    isPublished: true,
    publishedAt:
      data.publishedAt ?? existing?.publishedAt ?? new Date(),
  };
}

async function assertTagsExist(tagIds: string[] | undefined) {
  if (!tagIds?.length) return;

  const unique = [...new Set(tagIds)];
  const found = await NewsRepository.countExistingTags(unique);

  if (found !== unique.length) {
    throw new ResponseError(400, "One or more tag ids do not exist.");
  }
}

function postResponse(post: NewsPostWithRelations) {
  const { postTags, ...rest } = post;
  return {
    ...rest,
    tags: postTags.map((entry) => entry.tag),
  };
}

export class NewsService {
  // ---------- Categories ----------

  static async listCategories() {
    return NewsRepository.listCategories();
  }

  static async getCategory(rawId: string | undefined) {
    const id = requireUuid(rawId, "category id");
    const category = await NewsRepository.findCategoryById(id);
    if (!category) throw new ResponseError(404, "News category not found.");
    return category;
  }

  static async createCategory(payload: unknown) {
    const data = parse(newsCategorySchema, payload, "News category");
    try {
      return await NewsRepository.createCategory(data);
    } catch (error) {
      handleDatabaseError(error, "News category");
    }
  }

  static async updateCategory(rawId: string | undefined, payload: unknown) {
    const id = requireUuid(rawId, "category id");
    const data = parseUpdate(categoryUpdateSchema, payload, "News category");

    await this.getCategory(id);

    try {
      return await NewsRepository.updateCategory(id, data);
    } catch (error) {
      handleDatabaseError(error, "News category");
    }
  }

  static async deleteCategory(rawId: string | undefined) {
    const id = requireUuid(rawId, "category id");
    const category = await this.getCategory(id);

    try {
      await NewsRepository.deleteCategory(id);
    } catch (error) {
      handleDatabaseError(error, "News category");
    }

    return {
      id,
      deleted: true,
      detachedPosts: category._count.posts,
    };
  }

  // ---------- Tags ----------

  static async listTags() {
    return NewsRepository.listTags();
  }

  static async getTag(rawId: string | undefined) {
    const id = requireUuid(rawId, "tag id");
    const tag = await NewsRepository.findTagById(id);
    if (!tag) throw new ResponseError(404, "News tag not found.");
    return tag;
  }

  static async createTag(payload: unknown) {
    const data = parse(newsTagSchema, payload, "News tag");
    try {
      return await NewsRepository.createTag(data);
    } catch (error) {
      handleDatabaseError(error, "News tag");
    }
  }

  static async updateTag(rawId: string | undefined, payload: unknown) {
    const id = requireUuid(rawId, "tag id");
    const data = parseUpdate(tagUpdateSchema, payload, "News tag");

    await this.getTag(id);

    try {
      return await NewsRepository.updateTag(id, data);
    } catch (error) {
      handleDatabaseError(error, "News tag");
    }
  }

  static async deleteTag(rawId: string | undefined) {
    const id = requireUuid(rawId, "tag id");
    await this.getTag(id);

    const usage = await NewsRepository.countTagUsage(id);
    if (usage > 0) {
      throw new ResponseError(
        409,
        `Tag is still used by ${usage} post(s). Remove it from those posts first.`,
      );
    }

    try {
      await NewsRepository.deleteTag(id);
    } catch (error) {
      handleDatabaseError(error, "News tag");
    }

    return { id, deleted: true };
  }

  // ---------- Posts ----------

  static async listPosts(rawQuery: Record<string, string | undefined>) {
    const query = parse(listQuerySchema, rawQuery, "News post query");
    const filters: NewsPostFilters = query;

    const { items, total } = await NewsRepository.listPosts(filters);

    return {
      items: items.map(postResponse),
      pagination: {
        page: filters.page,
        pageSize: filters.pageSize,
        total,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    };
  }

  static async getPost(rawId: string | undefined) {
    const id = requireUuid(rawId, "post id");
    const post = await NewsRepository.findPostById(id);
    if (!post) throw new ResponseError(404, "News post not found.");
    return postResponse(post);
  }

  /**
   * `authorId` is taken from the logged-in admin, never from the request body.
   * `newsPostSchema` has no `authorId` key, so a client-supplied one is dropped
   * by zod before it ever reaches here. `authorName` stays free text: it is the
   * printed byline (e.g. "MWS Editorial Team") and survives user deletion,
   * while `authorId` is the real FK-backed attribution.
   */
  static async createPost(payload: unknown, authorId: string) {
    const { tagIds, ...data } = parse(newsPostSchema, payload, "News post");

    await assertTagsExist(tagIds);

    try {
      const post = await NewsRepository.createPost(
        {
          ...data,
          authorId,
          content: data.content ?? {},
          ...derivePublication(data),
        },
        tagIds,
      );
      return postResponse(post);
    } catch (error) {
      handleDatabaseError(error, "News post");
    }
  }

  static async updatePost(rawId: string | undefined, payload: unknown) {
    const id = requireUuid(rawId, "post id");
    const { tagIds, ...data } = parseUpdate(postUpdateSchema, payload, "News post");

    const existing = await NewsRepository.findPostById(id);
    if (!existing) throw new ResponseError(404, "News post not found.");

    await assertTagsExist(tagIds);

    const nextData = {
      ...data,
      ...(data.content !== undefined ? { content: data.content ?? {} } : {}),
      ...derivePublication(data, {
        status: existing.status,
        publishedAt: existing.publishedAt,
      }),
    };

    try {
      const post = await NewsRepository.updatePost(id, nextData, tagIds);
      return postResponse(post);
    } catch (error) {
      handleDatabaseError(error, "News post");
    }
  }

  static async deletePost(rawId: string | undefined) {
    const id = requireUuid(rawId, "post id");
    const post = await NewsRepository.findPostById(id);
    if (!post) throw new ResponseError(404, "News post not found.");

    try {
      await NewsRepository.deletePost(id);
    } catch (error) {
      handleDatabaseError(error, "News post");
    }

    await Promise.allSettled(
      post.media
        .filter((media) => isUploadedNewsImage(media.url))
        .map((media) => deleteMinioObject(media.url)),
    );

    return { id, deleted: true };
  }

  // ---------- Post media ----------

  /** Media always belongs to the post in the URL, never to a post id in the body. */
  private static async assertMediaBelongsToPost(
    postId: string,
    rawMediaId: string | undefined,
  ) {
    const mediaId = requireUuid(rawMediaId, "media id");
    const media = await NewsRepository.findMediaById(mediaId);

    if (!media || media.newsPostId !== postId) {
      throw new ResponseError(404, "News post media not found.");
    }

    return media;
  }

  static async listMedia(rawPostId: string | undefined) {
    const postId = requireUuid(rawPostId, "post id");
    await this.getPost(postId);
    return NewsRepository.listMedia(postId);
  }

  static async getMedia(
    rawPostId: string | undefined,
    rawMediaId: string | undefined,
  ) {
    const postId = requireUuid(rawPostId, "post id");
    await this.getPost(postId);
    return this.assertMediaBelongsToPost(postId, rawMediaId);
  }

  static async createMedia(rawPostId: string | undefined, payload: unknown) {
    const postId = requireUuid(rawPostId, "post id");
    await this.getPost(postId);

    const body = { ...(payload as Record<string, unknown>), newsPostId: postId };
    const data = parse(mediaCreateSchema, body, "News post media");

    try {
      return await NewsRepository.createMedia(data);
    } catch (error) {
      handleDatabaseError(error, "News post media");
    }
  }

  static async uploadImageMedia(
    rawPostId: string | undefined,
    file: File,
    metadataPayload: unknown,
  ) {
    const postId = requireUuid(rawPostId, "post id");
    await this.getPost(postId);
    validateImageFile(file);

    const metadata = parse(
      imageUploadMetadataSchema,
      metadataPayload,
      "News image metadata",
    );
    const objectName = imageObjectKey(file.name);
    const buffer = Buffer.from(await file.arrayBuffer());

    await putMinioObject(objectName, buffer, {
      "Content-Type": file.type,
      "Cache-Control": "public, max-age=31536000",
    });

    try {
      return await NewsRepository.createImageMediaAsCover({
        newsPostId: postId,
        mediaType: "IMAGE",
        url: objectName,
        alt: metadata.alt || null,
        caption: metadata.caption || null,
        sortOrder: metadata.sortOrder,
      });
    } catch (error) {
      await deleteMinioObject(objectName).catch(() => undefined);
      handleDatabaseError(error, "News image");
    }
  }

  static async getMediaFile(rawMediaId: string | undefined) {
    const mediaId = requireUuid(rawMediaId, "media id");
    const media = await NewsRepository.findMediaById(mediaId);

    if (!media || media.mediaType !== "IMAGE" || !isUploadedNewsImage(media.url)) {
      throw new ResponseError(404, "News image not found.");
    }

    const [stat, buffer] = await Promise.all([
      statMinioObject(media.url),
      getMinioObjectBuffer(media.url),
    ]);

    return {
      buffer,
      contentType:
        String(stat.metaData?.["content-type"] ?? stat.metaData?.["Content-Type"] ?? "") ||
        "application/octet-stream",
      size: stat.size,
    };
  }

  static async updateMedia(
    rawPostId: string | undefined,
    rawMediaId: string | undefined,
    payload: unknown,
  ) {
    const postId = requireUuid(rawPostId, "post id");
    await this.getPost(postId);

    const media = await this.assertMediaBelongsToPost(postId, rawMediaId);
    const data = parseUpdate(mediaUpdateSchema, payload, "News post media");

    try {
      return await NewsRepository.updateMedia(media.id, data);
    } catch (error) {
      handleDatabaseError(error, "News post media");
    }
  }

  static async deleteMedia(
    rawPostId: string | undefined,
    rawMediaId: string | undefined,
  ) {
    const postId = requireUuid(rawPostId, "post id");
    await this.getPost(postId);

    const media = await this.assertMediaBelongsToPost(postId, rawMediaId);

    try {
      if (isUploadedNewsImage(media.url)) {
        await deleteMinioObject(media.url);
      }
      await NewsRepository.deleteMedia(media.id);
    } catch (error) {
      handleDatabaseError(error, "News post media");
    }

    return { id: media.id, deleted: true };
  }
}
