import type { Prisma } from "@prisma/client";
import { getPrisma } from "../lib/prisma";

const mediaOrderBy = [
  { sortOrder: "asc" as const },
  { createdAt: "asc" as const },
];

const postInclude = {
  category: true,
  author: { select: { id: true, name: true, isActive: true } },
  media: { orderBy: mediaOrderBy },
  postTags: { include: { tag: true } },
};

export type NewsPostWithRelations = Prisma.NewsPostGetPayload<{
  include: typeof postInclude;
}>;

export type NewsCategoryWithCount = Prisma.NewsCategoryGetPayload<{
  include: { _count: { select: { posts: true } } };
}>;

export type NewsTagWithCount = Prisma.NewsTagGetPayload<{
  include: { _count: { select: { postTags: true } } };
}>;

export type NewsCategoryData = {
  name: string;
  slug: string;
  description?: string | null;
  isActive?: boolean;
};

export type NewsTagData = {
  name: string;
  slug: string;
};

export type NewsPostData = {
  categoryId?: string | null;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  coverImageAlt?: string | null;
  content?: Prisma.InputJsonValue;
  authorName?: string | null;
  authorId?: string | null;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isFeatured?: boolean;
  isPublished?: boolean;
  publishedAt?: Date | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  readTime?: number;
  viewCount?: number;
};

export type NewsPostFilters = {
  page: number;
  pageSize: number;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  categoryId?: string;
  tagId?: string;
  isFeatured?: boolean;
  search?: string;
};

export type NewsMediaData = {
  newsPostId: string;
  mediaType?: "IMAGE" | "VIDEO" | "DOCUMENT";
  url: string;
  alt?: string | null;
  caption?: string | null;
  sortOrder?: number;
};

function postWhere(filters: NewsPostFilters): Prisma.NewsPostWhereInput {
  const where: Prisma.NewsPostWhereInput = {};

  if (filters.status) where.status = filters.status;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured;
  if (filters.tagId) where.postTags = { some: { tagId: filters.tagId } };
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { slug: { contains: filters.search, mode: "insensitive" } },
      { excerpt: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return where;
}

export class NewsRepository {
  // ---------- Categories ----------

  static listCategories(): Promise<NewsCategoryWithCount[]> {
    return getPrisma().newsCategory.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { name: "asc" },
    });
  }

  static findCategoryById(id: string): Promise<NewsCategoryWithCount | null> {
    return getPrisma().newsCategory.findUnique({
      where: { id },
      include: { _count: { select: { posts: true } } },
    });
  }

  static createCategory(
    data: NewsCategoryData,
  ): Promise<NewsCategoryWithCount> {
    return getPrisma().newsCategory.create({
      data,
      include: { _count: { select: { posts: true } } },
    });
  }

  static updateCategory(
    id: string,
    data: Partial<NewsCategoryData>,
  ): Promise<NewsCategoryWithCount> {
    return getPrisma().newsCategory.update({
      where: { id },
      data,
      include: { _count: { select: { posts: true } } },
    });
  }

  static async deleteCategory(id: string): Promise<void> {
    // FK is ON DELETE SET NULL, so posts survive and become uncategorised.
    await getPrisma().newsCategory.delete({ where: { id } });
  }

  // ---------- Tags ----------

  static listTags(): Promise<NewsTagWithCount[]> {
    return getPrisma().newsTag.findMany({
      include: { _count: { select: { postTags: true } } },
      orderBy: { name: "asc" },
    });
  }

  static findTagById(id: string): Promise<NewsTagWithCount | null> {
    return getPrisma().newsTag.findUnique({
      where: { id },
      include: { _count: { select: { postTags: true } } },
    });
  }

  static createTag(data: NewsTagData): Promise<NewsTagWithCount> {
    return getPrisma().newsTag.create({
      data,
      include: { _count: { select: { postTags: true } } },
    });
  }

  static updateTag(
    id: string,
    data: Partial<NewsTagData>,
  ): Promise<NewsTagWithCount> {
    return getPrisma().newsTag.update({
      where: { id },
      data,
      include: { _count: { select: { postTags: true } } },
    });
  }

  static async deleteTag(id: string): Promise<void> {
    await getPrisma().newsTag.delete({ where: { id } });
  }

  static countTagUsage(id: string): Promise<number> {
    return getPrisma().newsPostTag.count({ where: { tagId: id } });
  }

  static countExistingTags(ids: string[]): Promise<number> {
    return getPrisma().newsTag.count({ where: { id: { in: ids } } });
  }

  // ---------- Posts ----------

  static async listPosts(filters: NewsPostFilters) {
    const prisma = getPrisma();
    const where = postWhere(filters);

    const [items, total] = await Promise.all([
      prisma.newsPost.findMany({
        where,
        include: postInclude,
        orderBy: [
          { publishedAt: "desc" },
          { createdAt: "desc" },
        ],
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      prisma.newsPost.count({ where }),
    ]);

    return { items, total };
  }

  static findPostById(id: string): Promise<NewsPostWithRelations | null> {
    return getPrisma().newsPost.findUnique({
      where: { id },
      include: postInclude,
    });
  }

  static createPost(
    data: NewsPostData,
    tagIds?: string[],
  ): Promise<NewsPostWithRelations> {
    return getPrisma().newsPost.create({
      data: {
        ...data,
        content: data.content ?? {},
        postTags: tagIds?.length
          ? { createMany: { data: tagIds.map((tagId) => ({ tagId })) } }
          : undefined,
      },
      include: postInclude,
    });
  }

  static updatePost(
    id: string,
    data: Partial<NewsPostData>,
    tagIds?: string[],
  ): Promise<NewsPostWithRelations> {
    return getPrisma().$transaction(async (tx) => {
      if (tagIds) {
        // NewsPostTag has a composite PK, so replace the whole set.
        await tx.newsPostTag.deleteMany({ where: { newsPostId: id } });
        if (tagIds.length) {
          await tx.newsPostTag.createMany({
            data: tagIds.map((tagId) => ({ newsPostId: id, tagId })),
          });
        }
      }

      return tx.newsPost.update({
        where: { id },
        data,
        include: postInclude,
      });
    });
  }

  static async deletePost(id: string): Promise<void> {
    // Both NewsPostTag and NewsPostMedia are ON DELETE RESTRICT,
    // so the children have to go first.
    await getPrisma().$transaction(async (tx) => {
      await tx.newsPostTag.deleteMany({ where: { newsPostId: id } });
      await tx.newsPostMedia.deleteMany({ where: { newsPostId: id } });
      await tx.newsPost.delete({ where: { id } });
    });
  }

  // ---------- Post media ----------

  static listMedia(newsPostId: string) {
    return getPrisma().newsPostMedia.findMany({
      where: { newsPostId },
      orderBy: mediaOrderBy,
    });
  }

  static findMediaById(id: string) {
    return getPrisma().newsPostMedia.findUnique({ where: { id } });
  }

  static createMedia(data: NewsMediaData) {
    return getPrisma().newsPostMedia.create({ data });
  }

  static updateMedia(id: string, data: Partial<Omit<NewsMediaData, "newsPostId">>) {
    return getPrisma().newsPostMedia.update({ where: { id }, data });
  }

  static async deleteMedia(id: string): Promise<void> {
    await getPrisma().newsPostMedia.delete({ where: { id } });
  }
}
