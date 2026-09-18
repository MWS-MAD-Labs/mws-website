import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import { ResponseError } from "../error/response-error";
import { GalleryRepository } from "../repositories/gallery-repository";
import { GalleryService } from "../services/gallery-service";

afterEach(() => {
  mock.restore();
});

describe("GalleryService reference safety", () => {
  it("blocks deleting a gallery referenced by page content", async () => {
    spyOn(GalleryRepository, "findGalleryById").mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      title: "Referenced gallery",
      description: null,
      createdAt: new Date("2026-09-18T00:00:00.000Z"),
      updatedAt: new Date("2026-09-18T00:00:00.000Z"),
      images: [],
      videos: [],
    });
    spyOn(GalleryRepository, "countReferences").mockResolvedValue(1);
    spyOn(GalleryRepository, "deleteGallery").mockResolvedValue({} as never);

    await expect(
      GalleryService.deleteGallery("11111111-1111-4111-8111-111111111111"),
    ).rejects.toMatchObject({
      status: 409,
      message: "Cannot delete a gallery that is referenced by content.",
    });
    expect(GalleryRepository.deleteGallery).not.toHaveBeenCalled();
  });
});
