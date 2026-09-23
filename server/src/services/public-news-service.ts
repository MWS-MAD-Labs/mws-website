import { z, ZodError } from "zod";
import { ResponseError } from "../error/response-error";
import {
  newsMediaFileUrl,
  NewsRepository,
  type NewsPostWithRelations,
  type PublicNewsPostFilters,
} from "../repositories/news-repository";

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
  search: z.string().trim().min(1).max(200).optional(),
  category: slugSchema.optional(),
  tag: slugSchema.optional(),
  featured: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

function validationMessage(error: ZodError) {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "query"}: ${issue.message}`)
    .join("; ");
}

function parseListQuery(query: Record<string, string | undefined>) {
  const result = listQuerySchema.safeParse(query);
  if (!result.success) {
    throw new ResponseError(
      400,
      `News query validation failed. ${validationMessage(result.error)}`,
    );
  }
  return result.data;
}

function authorDisplayName(post: NewsPostWithRelations) {
  return post.authorName?.trim() || post.author?.name || "MWS Editorial Team";
}

function publicCategory(post: NewsPostWithRelations) {
  if (!post.category?.isActive) return null;
  return {
    id: post.category.id,
    name: post.category.name,
    slug: post.category.slug,
  };
}

function publicMediaUrl(media: NewsPostWithRelations["media"][number]) {
  return media.url.startsWith("news/images/")
    ? newsMediaFileUrl(media.id)
    : media.url;
}

/** The cover is rendered from `coverImage`, so it is not an article photo. */
function articleMedia(post: NewsPostWithRelations) {
  return post.media.filter(
    (media) => newsMediaFileUrl(media.id) !== post.coverImage,
  );
}

function listItem(post: NewsPostWithRelations) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    coverImageAlt: post.coverImageAlt,
    publishedAt: post.publishedAt,
    readTime: post.readTime,
    authorName: authorDisplayName(post),
    category: publicCategory(post),
  };
}

export class PublicNewsService {
  static async list(rawQuery: Record<string, string | undefined>) {
    const query = parseListQuery(rawQuery);
    const filters: PublicNewsPostFilters = {
      page: query.page,
      pageSize: query.pageSize,
      category: query.category,
      tag: query.tag,
      isFeatured: query.featured,
      search: query.search,
    };
    const { items, total } = await NewsRepository.listPublishedPosts(
      filters,
      new Date(),
    );

    return {
      items: items.map(listItem),
      pagination: {
        page: filters.page,
        pageSize: filters.pageSize,
        total,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    };
  }

  static async categories() {
    const categories = await NewsRepository.listPublicCategories(new Date());
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      count: category._count.posts,
    }));
  }

  static async detail(rawSlug: string | undefined) {
    const parsed = slugSchema.safeParse(rawSlug);
    if (!parsed.success) throw new ResponseError(404, "News post not found.");

    const now = new Date();
    const post = await NewsRepository.findPublishedPostBySlug(parsed.data, now);
    if (!post) throw new ResponseError(404, "News post not found.");

    const related = await NewsRepository.listRelatedPublishedPosts(
      post.id,
      post.categoryId,
      now,
    );

    return {
      ...listItem(post),
      content: post.content,
      tags: post.postTags.map(({ tag }) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
      })),
      media: articleMedia(post).map((media) => ({
        id: media.id,
        mediaType: media.mediaType,
        url: publicMediaUrl(media),
        alt: media.alt,
        caption: media.caption,
        sortOrder: media.sortOrder,
      })),
      seo: {
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt,
      },
      relatedNews: related.map(listItem),
    };
  }
}
