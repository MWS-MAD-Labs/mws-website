import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import { ResponseError } from "../error/response-error";
import {
  NewsRepository,
  type NewsPostWithRelations,
} from "../repositories/news-repository";
import { PublicNewsService } from "../services/public-news-service";

afterEach(() => mock.restore());

const publishedPost = {
  id: "11111111-1111-4111-8111-111111111111",
  categoryId: "22222222-2222-4222-8222-222222222222",
  title: "STEAM Exhibition",
  slug: "steam-exhibition",
  excerpt: "Students share their projects.",
  coverImage: "/api/gallery-images/image-id/file",
  coverImageAlt: "Students at the exhibition",
  content: { format: "plain_text", text: "Full story" },
  authorName: null,
  authorId: "33333333-3333-4333-8333-333333333333",
  status: "PUBLISHED",
  isFeatured: true,
  isPublished: true,
  publishedAt: new Date("2026-09-20T00:00:00.000Z"),
  seoTitle: null,
  seoDescription: null,
  readTime: 4,
  viewCount: 0,
  createdAt: new Date("2026-09-19T00:00:00.000Z"),
  updatedAt: new Date("2026-09-20T00:00:00.000Z"),
  category: {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Student Life",
    slug: "student-life",
    description: null,
    isActive: true,
    createdAt: new Date("2026-09-01T00:00:00.000Z"),
    updatedAt: new Date("2026-09-01T00:00:00.000Z"),
  },
  author: {
    id: "33333333-3333-4333-8333-333333333333",
    name: "CMS Author",
    isActive: true,
  },
  media: [],
  postTags: [],
} as NewsPostWithRelations;

describe("PublicNewsService", () => {
  it("returns a public list DTO without CMS author data", async () => {
    spyOn(NewsRepository, "listPublishedPosts").mockResolvedValue({
      items: [publishedPost],
      total: 1,
    });

    const result = await PublicNewsService.list({ page: "1", pageSize: "6" });

    expect(result.pagination).toEqual({
      page: 1,
      pageSize: 6,
      total: 1,
      totalPages: 1,
    });
    expect(result.items[0]).toMatchObject({
      slug: "steam-exhibition",
      authorName: "CMS Author",
      category: { name: "Student Life", slug: "student-life" },
    });
    expect(result.items[0]).not.toHaveProperty("author");
    expect(result.items[0]).not.toHaveProperty("authorId");
  });

  it("returns detail by slug with related news", async () => {
    spyOn(NewsRepository, "findPublishedPostBySlug").mockResolvedValue(
      {
        ...publishedPost,
        media: [
          {
            id: "55555555-5555-4555-8555-555555555555",
            newsPostId: publishedPost.id,
            mediaType: "IMAGE",
            url: "news/images/uploaded-cover.webp",
            alt: "Uploaded cover",
            caption: null,
            sortOrder: 0,
            createdAt: new Date("2026-09-20T00:00:00.000Z"),
            updatedAt: new Date("2026-09-20T00:00:00.000Z"),
          },
        ],
      },
    );
    spyOn(NewsRepository, "listRelatedPublishedPosts").mockResolvedValue([
      {
        ...publishedPost,
        id: "44444444-4444-4444-8444-444444444444",
        slug: "more-news",
      },
    ]);

    const result = await PublicNewsService.detail("steam-exhibition");

    expect(result.slug).toBe("steam-exhibition");
    expect(result.seo.title).toBe("STEAM Exhibition");
    expect(result.media[0]?.url).toBe(
      "/api/news/media/55555555-5555-4555-8555-555555555555/file",
    );
    expect(result.relatedNews[0]?.slug).toBe("more-news");
  });

  it("uses 404 for invalid or unavailable slugs", async () => {
    expect(PublicNewsService.detail("Not a valid slug")).rejects.toBeInstanceOf(
      ResponseError,
    );

    spyOn(NewsRepository, "findPublishedPostBySlug").mockResolvedValue(null);
    expect(PublicNewsService.detail("missing-story")).rejects.toMatchObject({
      status: 404,
    });
  });
});
