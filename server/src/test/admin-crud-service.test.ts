import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import { ResponseError } from "../error/response-error";
import * as prismaLib from "../lib/prisma";
import type { AdminCrudResource } from "../models/admin-crud-model";
import { AdminCrudService } from "../services/admin-crud-service";

function delegate(overrides: Record<string, unknown> = {}) {
  return {
    findMany: mock(async () => []),
    count: mock(async () => 0),
    findFirst: mock(async () => null),
    create: mock(async (args: unknown) => ({ id: "created-id", args })),
    update: mock(async (args: unknown) => ({ id: "updated-id", args })),
    delete: mock(async (args: unknown) => ({ id: "deleted-id", args })),
    ...overrides,
  };
}

function mockPrisma(resource: AdminCrudResource, resourceDelegate: unknown) {
  const delegateNameByResource: Record<AdminCrudResource, string> = {
    "hero-slides": "heroSlide",
    "media-assets": "mediaAsset",
    campuses: "campus",
    "academic-programs": "academicProgram",
    "news-categories": "newsCategory",
    "news-tags": "newsTag",
    "news-posts": "newsPost",
    testimonials: "testimonial",
    "faq-items": "faqItem",
    inquiries: "inquiry",
    applications: "application",
    "application-documents": "applicationDocument",
    "tuition-fees": "tuitionFee",
    events: "event",
    "cms-pages": "cmsPage",
    settings: "setting",
  };

  spyOn(prismaLib, "getPrisma").mockReturnValue({
    [delegateNameByResource[resource]]: resourceDelegate,
  } as never);
}

async function expectResponseError(
  promise: Promise<unknown>,
  status: number,
  messagePart: string,
) {
  try {
    await promise;
    throw new Error("Expected ResponseError.");
  } catch (error) {
    expect(error).toBeInstanceOf(ResponseError);
    expect((error as ResponseError).status).toBe(status);
    expect((error as ResponseError).message).toContain(messagePart);
  }
}

afterEach(() => {
  mock.restore();
});

describe("AdminCrudService", () => {
  it("validates create payloads before calling Prisma", async () => {
    const getPrisma = spyOn(prismaLib, "getPrisma").mockImplementation(() => {
      throw new Error("getPrisma should not be called.");
    });

    await expectResponseError(
      AdminCrudService.create("campuses", { name: "Main Campus" }),
      400,
      "slug",
    );

    expect(getPrisma).not.toHaveBeenCalled();
  });

  it("validates list pagination", async () => {
    await expectResponseError(
      AdminCrudService.list("campuses", { page: "0" }),
      400,
      "page must be a positive integer",
    );
  });

  it("requires JSON fields that are required by Prisma", async () => {
    await expectResponseError(
      AdminCrudService.create("news-posts", {
        title: "Open House",
        slug: "open-house",
      }),
      400,
      "content",
    );
  });

  it("lists active rows with pagination metadata", async () => {
    const campus = delegate({
      findMany: mock(async () => [{ id: "campus-1", name: "Main Campus" }]),
      count: mock(async () => 1),
    });
    mockPrisma("campuses", campus);

    const result = await AdminCrudService.list("campuses", {
      page: "2",
      pageSize: "10",
    });

    expect(campus.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      skip: 10,
      take: 10,
      include: { heroImage: true },
    });
    expect(result).toEqual({
      items: [{ id: "campus-1", name: "Main Campus" }],
      pagination: { page: 2, pageSize: 10, total: 1, totalPages: 1 },
    });
  });

  it("returns not found for missing detail rows", async () => {
    const campus = delegate({ findFirst: mock(async () => null) });
    mockPrisma("campuses", campus);

    await expectResponseError(
      AdminCrudService.findById("campuses", "campus-id"),
      404,
      "Campus not found",
    );
  });

  it("maps duplicate database errors to 409", async () => {
    const campus = delegate({
      create: mock(async () => {
        throw { code: "P2002", meta: { target: ["slug"] } };
      }),
    });
    mockPrisma("campuses", campus);

    await expectResponseError(
      AdminCrudService.create("campuses", {
        name: "Main Campus",
        slug: "main-campus",
      }),
      409,
      "same slug",
    );
  });

  it("soft deletes models with deletedAt", async () => {
    const campus = delegate({
      findFirst: mock(async () => ({ id: "campus-id" })),
      update: mock(async (args: unknown) => args),
    });
    mockPrisma("campuses", campus);

    const result = await AdminCrudService.delete("campuses", "campus-id");

    expect(campus.update).toHaveBeenCalled();
    const updateArgs = campus.update.mock.calls[0]?.[0] as {
      data: { deletedAt: Date; updatedAt: Date };
    };
    expect(updateArgs.data.deletedAt).toBeInstanceOf(Date);
    expect(updateArgs.data.updatedAt).toBeInstanceOf(Date);
    expect(result).toEqual({ id: "campus-id", deleted: true });
  });

  it("hard deletes models without deletedAt", async () => {
    const applicationDocument = delegate({
      findFirst: mock(async () => ({ id: "document-id" })),
    });
    mockPrisma("application-documents", applicationDocument);

    await AdminCrudService.delete("application-documents", "document-id");

    expect(applicationDocument.delete).toHaveBeenCalledWith({
      where: { id: "document-id" },
    });
    expect(applicationDocument.update).not.toHaveBeenCalled();
  });

  it("writes news post tag relations from tagIds", async () => {
    const tagId = "22222222-2222-4222-8222-222222222222";
    const newsPost = delegate();
    mockPrisma("news-posts", newsPost);

    await AdminCrudService.create("news-posts", {
      title: "Open House",
      slug: "open-house",
      content: { blocks: [] },
      tagIds: [tagId],
    });

    const createArgs = newsPost.create.mock.calls[0]?.[0] as {
      data: { postTags: { createMany: { data: { tagId: string }[] } } };
    };
    expect(createArgs.data.postTags.createMany.data).toEqual([{ tagId }]);
  });
});
