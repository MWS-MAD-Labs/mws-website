import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import { ResponseError } from "../error/response-error";
import * as prismaLib from "../lib/prisma";
import { AcademicCrudService } from "../services/academic-crud-service";

const id = "11111111-1111-4111-8111-111111111111";
const academicLevelId = "22222222-2222-4222-8222-222222222222";

function delegate(overrides: Record<string, unknown> = {}) {
  return {
    findMany: mock(async () => []),
    findUnique: mock(async () => null),
    create: mock(async (args: unknown) => ({ id, args })),
    update: mock(async (args: unknown) => ({ id, args })),
    delete: mock(async () => ({ id })),
    ...overrides,
  };
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

describe("AcademicCrudService", () => {
  it("creates Academic rows with the finalized coverImage and galleryId fields", async () => {
    const academic = delegate();
    spyOn(prismaLib, "getPrisma").mockReturnValue({ academic } as never);

    await AcademicCrudService.create("academics", {
      title: "Academic Overview",
      description: "Learning overview",
      coverImage: "academic/images/overview.jpg",
      galleryId: "33333333-3333-4333-8333-333333333333",
    });

    expect(academic.create).toHaveBeenCalledWith({
      data: {
        title: "Academic Overview",
        description: "Learning overview",
        coverImage: "academic/images/overview.jpg",
        galleryId: "33333333-3333-4333-8333-333333333333",
      },
      include: { gallery: true },
    });
  });

  it("updates Kindergarten rows through the fixed level model, not Academic", async () => {
    const kindergarten = delegate();
    spyOn(prismaLib, "getPrisma").mockReturnValue({ kindergarten } as never);

    await AcademicCrudService.update("kindergartens", id, {
      academicLevelId,
      title: "Kindergarten",
      hero: { title: "Kindergarten" },
      overview: { introTitle: "Discovery" },
      sections: [{ title: "Play" }],
      status: "PUBLISHED",
      publishedAt: "2026-01-01T00:00:00.000Z",
    });

    const updateCalls = (kindergarten.update.mock.calls as unknown[]) as unknown[][];
    const updateArgs = updateCalls[0]?.[0] as {
      where: { id: string };
      data: { academicLevelId: string; title: string; publishedAt: Date };
      include: unknown;
    };

    expect(updateArgs.where).toEqual({ id });
    expect(updateArgs.data.academicLevelId).toBe(academicLevelId);
    expect(updateArgs.data.title).toBe("Kindergarten");
    expect(updateArgs.data.publishedAt).toBeInstanceOf(Date);
    expect(updateArgs.include).toEqual({
      academicLevel: true,
      gallery: true,
      faqs: {
        orderBy: { sortOrder: "asc" },
        include: { faq: true },
      },
    });
  });

  it("validates required JSON fields before creating fixed level rows", async () => {
    const elementary = delegate();
    spyOn(prismaLib, "getPrisma").mockReturnValue({ elementary } as never);

    await expectResponseError(
      AcademicCrudService.create("elementaries", {
        academicLevelId,
        title: "Elementary",
      }),
      400,
      "hero",
    );

    expect(elementary.create).not.toHaveBeenCalled();
  });

  it("attaches one reusable FAQ to a fixed academic level", async () => {
    const kindergarten = delegate({
      findUnique: mock(async () => ({ id })),
    });
    const kindergartenFaq = {
      upsert: mock(async (args: unknown) => ({ args })),
    };
    const faq = {
      findUnique: mock(async () => ({
        id: "33333333-3333-4333-8333-333333333333",
        isActive: true,
      })),
    };

    spyOn(prismaLib, "getPrisma").mockReturnValue({
      kindergarten,
      kindergartenFaq,
      faq,
    } as never);

    await AcademicCrudService.attachFaq("kindergartens", id, {
      faqId: "33333333-3333-4333-8333-333333333333",
      sortOrder: 2,
    });

    expect(kindergartenFaq.upsert).toHaveBeenCalledWith({
      where: {
        academicLevelId_faqId: {
          academicLevelId: id,
          faqId: "33333333-3333-4333-8333-333333333333",
        },
      },
      update: { sortOrder: 2 },
      create: {
        academicLevelId: id,
        faqId: "33333333-3333-4333-8333-333333333333",
        sortOrder: 2,
      },
      include: { faq: true },
    });
  });

  it("rejects inactive FAQ when attaching to a fixed academic level", async () => {
    const kindergarten = delegate({
      findUnique: mock(async () => ({ id })),
    });
    const kindergartenFaq = {
      upsert: mock(async (args: unknown) => ({ args })),
    };
    const faq = {
      findUnique: mock(async () => ({
        id: "33333333-3333-4333-8333-333333333333",
        isActive: false,
      })),
    };

    spyOn(prismaLib, "getPrisma").mockReturnValue({
      kindergarten,
      kindergartenFaq,
      faq,
    } as never);

    await expectResponseError(
      AcademicCrudService.attachFaq("kindergartens", id, {
        faqId: "33333333-3333-4333-8333-333333333333",
      }),
      400,
      "Only active FAQ",
    );

    expect(kindergartenFaq.upsert).not.toHaveBeenCalled();
  });

  it("deletes FAQ junctions before deleting the shared FAQ", async () => {
    const tx = mock(async () => undefined);
    const deleteMany = mock(() => ({}));
    const faq = {
      delete: mock(() => ({})),
    };

    spyOn(prismaLib, "getPrisma").mockReturnValue({
      $transaction: tx,
      kindergartenFaq: { deleteMany },
      elementaryFaq: { deleteMany },
      juniorHighFaq: { deleteMany },
      faq,
    } as never);

    await AcademicCrudService.delete("faqs", id);

    expect(deleteMany).toHaveBeenCalledTimes(3);
    expect(faq.delete).toHaveBeenCalledWith({ where: { id } });
    expect(tx).toHaveBeenCalled();
  });
});
