import type { GalleryImage } from "@prisma/client";
import { z } from "zod";
import { ResponseError } from "../error/response-error";
import {
  deleteMinioObject,
  getMinioObjectBuffer,
  putMinioObject,
  statMinioObject,
} from "../lib/minio";
import {
  GalleryRepository,
  type GalleryImageUpdateData,
  type GalleryUpdateData,
  type GalleryWithMedia,
} from "../repositories/gallery-repository";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const galleryCreateSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z
    .string()
    .trim()
    .transform((value) => value || null)
    .nullable()
    .optional(),
});

const galleryUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(255).optional(),
    description: z
      .string()
      .trim()
      .transform((value) => value || null)
      .nullable()
      .optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

const imageMetadataSchema = z.object({
  title: z
    .string()
    .trim()
    .max(255)
    .transform((value) => value || null)
    .nullable()
    .optional(),
  caption: z
    .string()
    .trim()
    .transform((value) => value || null)
    .nullable()
    .optional(),
  sortOrder: z.coerce.number().int().optional(),
});

function requireUuid(
  id: string | undefined,
  label = "id",
): asserts id is string {
  if (!id || !z.string().uuid().safeParse(id).success) {
    throw new ResponseError(400, `Valid UUID ${label} is required.`);
  }
}

function parseGalleryCreate(payload: unknown) {
  const result = galleryCreateSchema.safeParse(payload);
  if (!result.success) throw new ResponseError(400, "Invalid gallery payload.");
  return result.data;
}

function parseGalleryUpdate(payload: unknown): GalleryUpdateData {
  const result = galleryUpdateSchema.safeParse(payload);
  if (!result.success) throw new ResponseError(400, "Invalid gallery payload.");
  return result.data;
}

function parseImageMetadata(payload: unknown): GalleryImageUpdateData {
  const result = imageMetadataSchema.safeParse(payload);
  if (!result.success) throw new ResponseError(400, "Invalid image metadata.");
  return result.data;
}

function sanitizeFileName(name: string) {
  const fallback = "image";
  const safe = name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  return safe || fallback;
}

function imageObjectKey(fileName: string) {
  return `gallery/images/${crypto.randomUUID()}-${sanitizeFileName(fileName)}`;
}

async function deleteImageObject(path: string) {
  await deleteMinioObject(path);
}

function imageResponse(image: GalleryImage) {
  return {
    ...image,
    previewPath: `/admin/gallery-images/${image.id}/file`,
  };
}

function galleryResponse(gallery: GalleryWithMedia) {
  return {
    ...gallery,
    images: gallery.images.map(imageResponse),
  };
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

export class GalleryService {
  static async listGalleries() {
    const galleries = await GalleryRepository.listGalleries();
    return galleries.map(galleryResponse);
  }

  static async getGallery(id: string | undefined) {
    requireUuid(id);
    const gallery = await GalleryRepository.findGalleryById(id);
    if (!gallery) throw new ResponseError(404, "Gallery not found.");
    return galleryResponse(gallery);
  }

  static async createGallery(payload: unknown) {
    return galleryResponse(
      await GalleryRepository.createGallery(parseGalleryCreate(payload)),
    );
  }

  static async updateGallery(id: string | undefined, payload: unknown) {
    requireUuid(id);
    await this.getGallery(id);
    return galleryResponse(
      await GalleryRepository.updateGallery(id, parseGalleryUpdate(payload)),
    );
  }

  static async deleteGallery(id: string | undefined) {
    requireUuid(id);
    const gallery = await GalleryRepository.findGalleryById(id);
    if (!gallery) return;

    for (const image of gallery.images) {
      await deleteImageObject(image.path);
    }

    await GalleryRepository.deleteGallery(id);
  }

  static async uploadImage(
    galleryId: string | undefined,
    file: File,
    metadataPayload: unknown,
  ) {
    requireUuid(galleryId, "galleryId");
    validateImageFile(file);

    const gallery = await GalleryRepository.findGalleryById(galleryId);
    if (!gallery) throw new ResponseError(404, "Gallery not found.");

    const metadata = parseImageMetadata(metadataPayload);
    const objectName = imageObjectKey(file.name);
    const buffer = Buffer.from(await file.arrayBuffer());

    await putMinioObject(objectName, buffer, {
      "Content-Type": file.type,
      "Cache-Control": "public, max-age=31536000",
    });

    try {
      return imageResponse(
        await GalleryRepository.createImage({
          galleryId,
          path: objectName,
          title: metadata.title,
          caption: metadata.caption,
          sortOrder: metadata.sortOrder,
        }),
      );
    } catch (error) {
      await deleteMinioObject(objectName).catch(() => undefined);
      throw error;
    }
  }

  static async updateImage(id: string | undefined, payload: unknown) {
    requireUuid(id);
    const image = await GalleryRepository.findImageById(id);
    if (!image) throw new ResponseError(404, "Gallery image not found.");
    return imageResponse(
      await GalleryRepository.updateImage(id, parseImageMetadata(payload)),
    );
  }

  static async getImageFile(id: string | undefined) {
    requireUuid(id);
    const image = await GalleryRepository.findImageById(id);
    if (!image) throw new ResponseError(404, "Gallery image not found.");

    const [stat, buffer] = await Promise.all([
      statMinioObject(image.path),
      getMinioObjectBuffer(image.path),
    ]);

    return {
      buffer,
      contentType:
        String(stat.metaData?.["content-type"] ?? stat.metaData?.["Content-Type"] ?? "")
          || "application/octet-stream",
      size: stat.size,
    };
  }

  static async deleteImage(id: string | undefined) {
    requireUuid(id);
    const image = await GalleryRepository.findImageById(id);
    if (!image) return;

    await deleteImageObject(image.path);
    await GalleryRepository.deleteImage(id);
  }
}
