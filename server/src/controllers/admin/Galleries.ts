import type { Context } from "hono";
import { ResponseError } from "../../error/response-error";
import { toJsonSafe } from "../../lib/json-response";
import { GalleryService } from "../../services/gallery-service";

type MultipartValue = string | File;
type MultipartBody = Record<string, MultipartValue | MultipartValue[]>;

async function readJson(c: Context) {
  try {
    return await c.req.json();
  } catch {
    throw new ResponseError(400, "Invalid JSON body.");
  }
}

function firstFormValue(value: MultipartValue | MultipartValue[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function textField(body: MultipartBody, key: string) {
  const value = firstFormValue(body[key]);
  return typeof value === "string" ? value : undefined;
}

function fileField(body: MultipartBody, key: string) {
  const value = firstFormValue(body[key]);
  return value instanceof File ? value : null;
}

async function readMultipartImage(c: Context) {
  const body = (await c.req.parseBody()) as MultipartBody;
  const file = fileField(body, "file");

  if (!file) {
    throw new ResponseError(400, "Image file is required.");
  }

  return {
    file,
    metadata: {
      title: textField(body, "title"),
      caption: textField(body, "caption"),
      sortOrder: textField(body, "sortOrder"),
    },
  };
}

async function readMultipartVideo(c: Context) {
  const body = (await c.req.parseBody()) as MultipartBody;
  const file = fileField(body, "file");

  if (!file) {
    throw new ResponseError(400, "Video file is required.");
  }

  return {
    file,
    metadata: {
      title: textField(body, "title"),
      caption: textField(body, "caption"),
      sortOrder: textField(body, "sortOrder"),
    },
  };
}

export class AdminGalleriesController {
  static async list(c: Context) {
    const galleries = await GalleryService.listGalleries();
    return c.json({ data: toJsonSafe(galleries) });
  }

  static async detail(c: Context) {
    const gallery = await GalleryService.getGallery(c.req.param("id"));
    return c.json({ data: toJsonSafe(gallery) });
  }

  static async create(c: Context) {
    const gallery = await GalleryService.createGallery(await readJson(c));
    return c.json({ data: toJsonSafe(gallery) }, 201);
  }

  static async update(c: Context) {
    const gallery = await GalleryService.updateGallery(
      c.req.param("id"),
      await readJson(c),
    );
    return c.json({ data: toJsonSafe(gallery) });
  }

  static async delete(c: Context) {
    await GalleryService.deleteGallery(c.req.param("id"));
    return c.body(null, 204);
  }

  static async uploadImage(c: Context) {
    const { file, metadata } = await readMultipartImage(c);
    const image = await GalleryService.uploadImage(
      c.req.param("id"),
      file,
      metadata,
    );
    return c.json({ data: toJsonSafe(image) }, 201);
  }

  static async uploadVideo(c: Context) {
    const { file, metadata } = await readMultipartVideo(c);
    const video = await GalleryService.uploadVideo(
      c.req.param("id"),
      file,
      metadata,
    );
    return c.json({ data: toJsonSafe(video) }, 201);
  }

  static async createYoutubeVideo(c: Context) {
    const video = await GalleryService.createYoutubeVideo(
      c.req.param("id"),
      await readJson(c),
    );
    return c.json({ data: toJsonSafe(video) }, 201);
  }
}

export class AdminGalleryImagesController {
  static async update(c: Context) {
    const image = await GalleryService.updateImage(
      c.req.param("id"),
      await readJson(c),
    );
    return c.json({ data: toJsonSafe(image) });
  }

  static async file(c: Context) {
    const file = await GalleryService.getImageFile(c.req.param("id"));
    c.header("Content-Type", file.contentType);
    c.header("Content-Length", String(file.size));
    c.header("Cache-Control", "private, max-age=300");
    return c.body(file.buffer);
  }

  static async delete(c: Context) {
    await GalleryService.deleteImage(c.req.param("id"));
    return c.body(null, 204);
  }
}

export class AdminGalleryVideosController {
  static async update(c: Context) {
    const video = await GalleryService.updateVideo(
      c.req.param("id"),
      await readJson(c),
    );
    return c.json({ data: toJsonSafe(video) });
  }

  static async file(c: Context) {
    const file = await GalleryService.getVideoFile(c.req.param("id"));
    c.header("Content-Type", file.contentType);
    c.header("Content-Length", String(file.size));
    c.header("Cache-Control", "private, max-age=300");
    return c.body(file.buffer);
  }

  static async delete(c: Context) {
    await GalleryService.deleteVideo(c.req.param("id"));
    return c.body(null, 204);
  }
}
