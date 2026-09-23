import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import {
  NewsRepository,
  type NewsPostWithRelations,
} from "../repositories/news-repository";

const putMinioObject = mock(async () => undefined);
const deleteMinioObject = mock(async () => undefined);

mock.module("../lib/minio", () => ({
  putMinioObject,
  deleteMinioObject,
  getMinioObjectBuffer: mock(async () => Buffer.alloc(0)),
  statMinioObject: mock(async () => ({ size: 0, metaData: {} })),
}));

const { NewsService } = await import("../services/news-service");

const POST_ID = "11111111-1111-4111-8111-111111111111";
const COVER_MEDIA_ID = "22222222-2222-4222-8222-222222222222";

function imageFile(name: string) {
  return new File([new Uint8Array([1, 2, 3])], name, { type: "image/jpeg" });
}

function mediaRow(id: string, url: string, sortOrder = 0) {
  return {
    id,
    newsPostId: POST_ID,
    mediaType: "IMAGE" as const,
    url,
    alt: null,
    caption: null,
    sortOrder,
    createdAt: new Date("2026-09-21T00:00:00.000Z"),
    updatedAt: new Date("2026-09-21T00:00:00.000Z"),
  };
}

/** A post whose cover is already served by its own media row. */
function postWithCover(): NewsPostWithRelations {
  return {
    id: POST_ID,
    categoryId: null,
    title: "STEAM Exhibition",
    slug: "steam-exhibition",
    excerpt: null,
    coverImage: `/api/news/media/${COVER_MEDIA_ID}/file`,
    coverImageAlt: "Cover A",
    content: {},
    authorName: null,
    authorId: null,
    status: "DRAFT",
    isFeatured: false,
    isPublished: false,
    publishedAt: null,
    seoTitle: null,
    seoDescription: null,
    readTime: 0,
    viewCount: 0,
    createdAt: new Date("2026-09-21T00:00:00.000Z"),
    updatedAt: new Date("2026-09-21T00:00:00.000Z"),
    category: null,
    author: null,
    media: [
      mediaRow(COVER_MEDIA_ID, "news/images/cover-a.jpg", 0),
      mediaRow("33333333-3333-4333-8333-333333333333", "news/images/photo-b.jpg", 1),
    ],
    postTags: [],
  } as unknown as NewsPostWithRelations;
}

beforeEach(() => {
  putMinioObject.mockClear();
  deleteMinioObject.mockClear();
});

afterEach(() => mock.restore());

describe("NewsService.uploadImageMedia", () => {
  it("routes an ARTICLE upload to post media without touching the cover", async () => {
    spyOn(NewsRepository, "findPostById").mockResolvedValue(postWithCover());
    spyOn(NewsRepository, "nextMediaSortOrder").mockResolvedValue(2);
    const createMedia = spyOn(NewsRepository, "createMedia").mockResolvedValue(
      mediaRow("44444444-4444-4444-8444-444444444444", "news/images/photo-c.jpg", 2),
    );
    const createCoverMedia = spyOn(NewsRepository, "createCoverMedia");

    await NewsService.uploadImageMedia(POST_ID, imageFile("photo-c.jpg"), {
      purpose: "ARTICLE",
    });

    expect(createCoverMedia).not.toHaveBeenCalled();
    expect(createMedia).toHaveBeenCalledTimes(1);
    // Appended, so article photos keep the order they were uploaded in.
    expect(createMedia.mock.calls[0]![0]).toMatchObject({
      newsPostId: POST_ID,
      mediaType: "IMAGE",
      sortOrder: 2,
    });
  });

  it("routes a COVER upload to the cover and retires the previous cover media", async () => {
    spyOn(NewsRepository, "findPostById").mockResolvedValue(postWithCover());
    const createMedia = spyOn(NewsRepository, "createMedia");
    const createCoverMedia = spyOn(
      NewsRepository,
      "createCoverMedia",
    ).mockResolvedValue(
      mediaRow("55555555-5555-4555-8555-555555555555", "news/images/cover-new.jpg"),
    );

    await NewsService.uploadImageMedia(POST_ID, imageFile("cover-new.jpg"), {
      purpose: "COVER",
      alt: "Cover B",
    });

    expect(createMedia).not.toHaveBeenCalled();
    expect(createCoverMedia).toHaveBeenCalledTimes(1);
    expect(createCoverMedia.mock.calls[0]![1]).toBe(COVER_MEDIA_ID);
    expect(deleteMinioObject).toHaveBeenCalledWith("news/images/cover-a.jpg");
  });

  it("treats an upload without a purpose as an article photo", async () => {
    spyOn(NewsRepository, "findPostById").mockResolvedValue(postWithCover());
    spyOn(NewsRepository, "nextMediaSortOrder").mockResolvedValue(2);
    spyOn(NewsRepository, "createMedia").mockResolvedValue(
      mediaRow("66666666-6666-4666-8666-666666666666", "news/images/photo-d.jpg", 2),
    );
    const createCoverMedia = spyOn(NewsRepository, "createCoverMedia");

    await NewsService.uploadImageMedia(POST_ID, imageFile("photo-d.jpg"), {});

    expect(createCoverMedia).not.toHaveBeenCalled();
  });
});

describe("NewsService.deleteMedia", () => {
  const PHOTO_MEDIA_ID = "33333333-3333-4333-8333-333333333333";

  it("removes an article photo row and its stored object", async () => {
    spyOn(NewsRepository, "findPostById").mockResolvedValue(postWithCover());
    spyOn(NewsRepository, "findMediaById").mockResolvedValue(
      mediaRow(PHOTO_MEDIA_ID, "news/images/photo-b.jpg", 1),
    );
    const deleteMedia = spyOn(NewsRepository, "deleteMedia").mockResolvedValue(
      undefined,
    );

    const result = await NewsService.deleteMedia(POST_ID, PHOTO_MEDIA_ID);

    expect(result).toEqual({ id: PHOTO_MEDIA_ID, deleted: true });
    expect(deleteMedia).toHaveBeenCalledWith(PHOTO_MEDIA_ID);
    // The cover keeps its own object; only the article photo is cleaned up.
    expect(deleteMinioObject).toHaveBeenCalledTimes(1);
    expect(deleteMinioObject).toHaveBeenCalledWith("news/images/photo-b.jpg");
  });

  it("leaves storage alone for media that is not an uploaded news image", async () => {
    spyOn(NewsRepository, "findPostById").mockResolvedValue(postWithCover());
    spyOn(NewsRepository, "findMediaById").mockResolvedValue(
      mediaRow(PHOTO_MEDIA_ID, "/api/gallery-images/shared/file", 1),
    );
    spyOn(NewsRepository, "deleteMedia").mockResolvedValue(undefined);

    await NewsService.deleteMedia(POST_ID, PHOTO_MEDIA_ID);

    expect(deleteMinioObject).not.toHaveBeenCalled();
  });

  it("refuses to delete media belonging to another post", async () => {
    spyOn(NewsRepository, "findPostById").mockResolvedValue(postWithCover());
    spyOn(NewsRepository, "findMediaById").mockResolvedValue({
      ...mediaRow(PHOTO_MEDIA_ID, "news/images/photo-b.jpg", 1),
      newsPostId: "99999999-9999-4999-8999-999999999999",
    });
    const deleteMedia = spyOn(NewsRepository, "deleteMedia");

    await expect(
      NewsService.deleteMedia(POST_ID, PHOTO_MEDIA_ID),
    ).rejects.toMatchObject({
      status: 404,
      message: "News post media not found.",
    });
    expect(deleteMedia).not.toHaveBeenCalled();
    expect(deleteMinioObject).not.toHaveBeenCalled();
  });
});

describe("NewsService.updatePost", () => {
  it("drops the media row of a cover the post no longer points at", async () => {
    const existing = postWithCover();
    spyOn(NewsRepository, "findPostById").mockResolvedValue(existing);
    spyOn(NewsRepository, "updatePost").mockResolvedValue({
      ...existing,
      coverImage: "/api/gallery-images/other/file",
    });
    const deleteMedia = spyOn(NewsRepository, "deleteMedia").mockResolvedValue(
      undefined,
    );

    await NewsService.updatePost(POST_ID, {
      coverImage: "/api/gallery-images/other/file",
    });

    expect(deleteMedia).toHaveBeenCalledWith(COVER_MEDIA_ID);
    expect(deleteMinioObject).toHaveBeenCalledWith("news/images/cover-a.jpg");
  });

  it("keeps article photos alone when the cover does not change", async () => {
    const existing = postWithCover();
    spyOn(NewsRepository, "findPostById").mockResolvedValue(existing);
    spyOn(NewsRepository, "updatePost").mockResolvedValue(existing);
    const deleteMedia = spyOn(NewsRepository, "deleteMedia");

    await NewsService.updatePost(POST_ID, { title: "STEAM Exhibition 2026" });

    expect(deleteMedia).not.toHaveBeenCalled();
  });
});
