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
    spyOn(GalleryRepository, "listGalleryReferences").mockResolvedValue([
      { label: "Contact page gallery", count: 1 },
    ]);
    spyOn(GalleryRepository, "deleteGallery").mockResolvedValue({} as never);

    await expect(
      GalleryService.deleteGallery("11111111-1111-4111-8111-111111111111"),
    ).rejects.toMatchObject({
      status: 409,
      message:
        "Cannot delete this gallery because it is still used by: Contact page gallery (1). Remove those references first.",
    });
    expect(GalleryRepository.deleteGallery).not.toHaveBeenCalled();
  });

  it("blocks deleting an image and names the content still using it", async () => {
    spyOn(GalleryRepository, "findImageById").mockResolvedValue({
      id: "22222222-2222-4222-8222-222222222222",
      galleryId: "11111111-1111-4111-8111-111111111111",
      path: "gallery/images/hero.webp",
      title: null,
      caption: null,
      sortOrder: 0,
      createdAt: new Date("2026-09-18T00:00:00.000Z"),
      updatedAt: new Date("2026-09-18T00:00:00.000Z"),
    });
    spyOn(GalleryRepository, "listImageReferences").mockResolvedValue([
      { label: "Home hero slide media", count: 2 },
    ]);
    spyOn(GalleryRepository, "deleteImage").mockResolvedValue({} as never);

    await expect(
      GalleryService.deleteImage("22222222-2222-4222-8222-222222222222"),
    ).rejects.toMatchObject({
      status: 409,
      message:
        "Cannot delete this image because it is still used by: Home hero slide media (2). Remove those references first.",
    });
    expect(GalleryRepository.deleteImage).not.toHaveBeenCalled();
  });
});
