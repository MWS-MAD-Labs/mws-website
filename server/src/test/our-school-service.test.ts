import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import { ResponseError } from "../error/response-error";
import { OurSchoolRepository } from "../repositories/our-school-repository";
import { OurSchoolService } from "../services/our-school-service";

const galleryId = "11111111-1111-4111-8111-111111111111";
const imageId = "22222222-2222-4222-8222-222222222222";
const otherGalleryId = "33333333-3333-4333-8333-333333333333";
const ourSchoolId = "44444444-4444-4444-8444-444444444444";

const galleryImage = {
  id: imageId,
  galleryId,
  path: "gallery/images/school.jpg",
  title: "School",
  caption: null,
  sortOrder: 0,
  createdAt: new Date("2026-09-16T00:00:00.000Z"),
  updatedAt: new Date("2026-09-16T00:00:00.000Z"),
};

function ourSchool(overrides: Record<string, unknown> = {}) {
  return {
    id: ourSchoolId,
    title: "Our School",
    description: "About school",
    galleryId,
    featuredImageId: imageId,
    createdAt: new Date("2026-09-16T00:00:00.000Z"),
    updatedAt: new Date("2026-09-16T00:00:00.000Z"),
    gallery: null,
    featuredImage: galleryImage,
    ...overrides,
  };
}

async function expectResponseError(
  promise: Promise<unknown>,
  status: number,
  message: string,
) {
  try {
    await promise;
    throw new Error("Expected ResponseError.");
  } catch (error) {
    expect(error).toBeInstanceOf(ResponseError);
    expect((error as ResponseError).status).toBe(status);
    expect((error as ResponseError).message).toBe(message);
  }
}

afterEach(() => {
  mock.restore();
});

describe("OurSchoolService", () => {
  it("creates OurSchool with galleryId and featuredImageId", async () => {
    spyOn(OurSchoolRepository, "findImageById").mockResolvedValue(galleryImage);
    spyOn(OurSchoolRepository, "create").mockResolvedValue(ourSchool() as never);

    const result = await OurSchoolService.create({
      title: "Our School",
      description: "About school",
      galleryId,
      featuredImageId: imageId,
    });

    expect(OurSchoolRepository.create).toHaveBeenCalledWith({
      title: "Our School",
      description: "About school",
      galleryId,
      featuredImageId: imageId,
    });
    expect(result.featuredImage?.previewPath).toBe(
      `/admin/gallery-images/${imageId}/file`,
    );
  });

  it("clears featuredImageId on update", async () => {
    spyOn(OurSchoolRepository, "findById").mockResolvedValue(ourSchool() as never);
    spyOn(OurSchoolRepository, "update").mockResolvedValue(
      ourSchool({ featuredImageId: null, featuredImage: null }) as never,
    );

    const result = await OurSchoolService.update(ourSchoolId, {
      featuredImageId: null,
    });

    expect(OurSchoolRepository.update).toHaveBeenCalledWith(ourSchoolId, {
      featuredImageId: null,
    });
    expect(result.featuredImage).toBeNull();
  });

  it("rejects featured image from a different gallery", async () => {
    spyOn(OurSchoolRepository, "findImageById").mockResolvedValue({
      ...galleryImage,
      galleryId: otherGalleryId,
    });

    await expectResponseError(
      OurSchoolService.create({
        title: "Our School",
        galleryId,
        featuredImageId: imageId,
      }),
      400,
      "Selected featured image must belong to the selected gallery.",
    );
  });

  it("rejects changing gallery while keeping an incompatible featured image", async () => {
    spyOn(OurSchoolRepository, "findById").mockResolvedValue(ourSchool() as never);
    spyOn(OurSchoolRepository, "findImageById").mockResolvedValue(galleryImage);

    await expectResponseError(
      OurSchoolService.update(ourSchoolId, { galleryId: otherGalleryId }),
      400,
      "Selected featured image must belong to the selected gallery.",
    );
  });
});
