import { VideoSourceType, type GalleryImage, type GalleryVideo } from "@prisma/client";
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
  type GalleryVideoUpdateData,
  type GalleryWithMedia,
} from "../repositories/gallery-repository";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 200 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const ACCEPTED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
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

const videoMetadataSchema = imageMetadataSchema;
const youtubeVideoSchema = videoMetadataSchema.extend({
  url: z.string().trim().url().max(1000),
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

function videoObjectKey(fileName: string) {
  return `gallery/videos/${crypto.randomUUID()}-${sanitizeFileName(fileName)}`;
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

function videoResponse(video: GalleryVideo) {
  return {
    ...video,
    previewPath:
      video.sourceType === "UPLOAD"
        ? `/admin/gallery-videos/${video.id}/file`
        : null,
  };
}

function galleryResponse(gallery: GalleryWithMedia) {
  return {
    ...gallery,
    images: gallery.images.map(imageResponse),
    videos: gallery.videos.map(videoResponse),
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

function validateVideoFile(file: File) {
  if (!ACCEPTED_VIDEO_TYPES.has(file.type)) {
    throw new ResponseError(400, "Only MP4, WebM, or MOV videos are allowed.");
  }

  if (file.size <= 0) {
    throw new ResponseError(400, "Video file is empty.");
  }

  if (file.size > MAX_VIDEO_SIZE) {
    throw new ResponseError(400, "Video file must be 200MB or smaller.");
  }
}

function parseVideoMetadata(payload: unknown): GalleryVideoUpdateData {
  const result = videoMetadataSchema.safeParse(payload);
  if (!result.success) throw new ResponseError(400, "Invalid video metadata.");
  return result.data;
}

function parseYoutubeVideo(payload: unknown) {
  const result = youtubeVideoSchema.safeParse(payload);
  if (!result.success) throw new ResponseError(400, "Invalid YouTube video payload.");

  const host = new URL(result.data.url).hostname.replace(/^www\./, "");
  if (!["youtube.com", "youtu.be", "m.youtube.com"].includes(host)) {
    throw new ResponseError(400, "Only YouTube URLs are allowed.");
  }

  return result.data;
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
    for (const video of gallery.videos) {
      if (video.sourceType === "UPLOAD") await deleteMinioObject(video.source);
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

  static async uploadVideo(
    galleryId: string | undefined,
    file: File,
    metadataPayload: unknown,
  ) {
    requireUuid(galleryId, "galleryId");
    validateVideoFile(file);

    const gallery = await GalleryRepository.findGalleryById(galleryId);
    if (!gallery) throw new ResponseError(404, "Gallery not found.");

    const metadata = parseVideoMetadata(metadataPayload);
    const objectName = videoObjectKey(file.name);
    const buffer = Buffer.from(await file.arrayBuffer());

    await putMinioObject(objectName, buffer, {
      "Content-Type": file.type,
      "Cache-Control": "private, max-age=300",
    });

    try {
      return videoResponse(
        await GalleryRepository.createVideo({
          galleryId,
          sourceType: VideoSourceType.UPLOAD,
          source: objectName,
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

  static async createYoutubeVideo(galleryId: string | undefined, payload: unknown) {
    requireUuid(galleryId, "galleryId");
    const gallery = await GalleryRepository.findGalleryById(galleryId);
    if (!gallery) throw new ResponseError(404, "Gallery not found.");

    const data = parseYoutubeVideo(payload);
    return videoResponse(
      await GalleryRepository.createVideo({
        galleryId,
        sourceType: VideoSourceType.YOUTUBE,
        source: data.url,
        title: data.title,
        caption: data.caption,
        sortOrder: data.sortOrder,
      }),
    );
  }

  static async updateVideo(id: string | undefined, payload: unknown) {
    requireUuid(id);
    const video = await GalleryRepository.findVideoById(id);
    if (!video) throw new ResponseError(404, "Gallery video not found.");
    return videoResponse(
      await GalleryRepository.updateVideo(id, parseVideoMetadata(payload)),
    );
  }

  static async getVideoFile(id: string | undefined) {
    requireUuid(id);
    const video = await GalleryRepository.findVideoById(id);
    if (!video) throw new ResponseError(404, "Gallery video not found.");
    if (video.sourceType !== "UPLOAD") {
      throw new ResponseError(400, "This gallery video is not an uploaded file.");
    }

    const [stat, buffer] = await Promise.all([
      statMinioObject(video.source),
      getMinioObjectBuffer(video.source),
    ]);

    return {
      buffer,
      contentType:
        String(stat.metaData?.["content-type"] ?? stat.metaData?.["Content-Type"] ?? "")
          || "application/octet-stream",
      size: stat.size,
    };
  }

  static async deleteVideo(id: string | undefined) {
    requireUuid(id);
    const video = await GalleryRepository.findVideoById(id);
    if (!video) return;

    if (video.sourceType === "UPLOAD") {
      await deleteMinioObject(video.source);
    }
    await GalleryRepository.deleteVideo(id);
  }
}
