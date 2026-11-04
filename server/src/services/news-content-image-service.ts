import { z } from "zod";
import { storedObject } from "../lib/file-response";
import { ResponseError } from "../error/response-error";
import {
  putMinioObject,
} from "../lib/minio";
import {
  NEWS_CONTENT_IMAGE_NAME,
  newsContentImageUrl,
} from "../lib/news-content-image";
import { MAX_UPLOAD_IMAGE_SIZE, optimizeImage } from "../lib/optimize-image";
import {
  detectImageKind,
  fetchRemoteImage,
  imageTooLargeMessage,
} from "../lib/remote-image";

/**
 * What an admin may hand in. It is never what visitors download: every image
 * is shrunk and re-encoded before it is stored (see optimizeImage).
 */
export const MAX_CONTENT_IMAGE_SIZE = MAX_UPLOAD_IMAGE_SIZE;

const OBJECT_PREFIX = "news/content/";

const importSchema = z.object({
  url: z.string().trim().min(1, "Image link is required.").max(2048),
});

export type StoredContentImage = {
  url: string;
  width: number;
  height: number;
  /** Bytes visitors download. */
  size: number;
  /** Bytes the admin handed in, so the editor can show what was saved. */
  originalSize: number;
};

async function store(input: Uint8Array): Promise<StoredContentImage> {
  const optimized = await optimizeImage(input);
  const name = `${crypto.randomUUID()}.webp`;

  await putMinioObject(`${OBJECT_PREFIX}${name}`, optimized.bytes, {
    "Content-Type": "image/webp",
    "Cache-Control": "public, max-age=31536000, immutable",
  });

  return {
    url: newsContentImageUrl(name),
    width: optimized.width,
    height: optimized.height,
    size: optimized.bytes.byteLength,
    originalSize: input.byteLength,
  };
}

/**
 * Images placed inside the article body. They are not tied to a post, so they
 * work while a new post has no id yet; the article HTML is what references
 * them, and the sanitizer only lets through `src` values that point here.
 */
export class NewsContentImageService {
  static async upload(file: File) {
    if (file.size <= 0) throw new ResponseError(400, "Image file is empty.");
    if (file.size > MAX_CONTENT_IMAGE_SIZE) {
      throw new ResponseError(400, imageTooLargeMessage(MAX_CONTENT_IMAGE_SIZE));
    }

    const bytes = new Uint8Array(await file.arrayBuffer());

    if (!detectImageKind(bytes)) {
      throw new ResponseError(
        400,
        "Only AVIF, WebP, JPEG, or PNG images are allowed. iPhone HEIC photos must be exported as JPEG first.",
      );
    }

    return store(bytes);
  }

  static async importFromUrl(payload: unknown) {
    const result = importSchema.safeParse(payload);
    if (!result.success) {
      throw new ResponseError(
        400,
        result.error.issues[0]?.message ?? "Image link is required.",
      );
    }

    const { bytes } = await fetchRemoteImage(result.data.url, {
      maxBytes: MAX_CONTENT_IMAGE_SIZE,
    });

    return store(bytes);
  }

  static async getFile(name: string | undefined) {
    if (!name || !NEWS_CONTENT_IMAGE_NAME.test(name)) {
      throw new ResponseError(404, "News image not found.");
    }

    const objectName = `${OBJECT_PREFIX}${name}`;
    return storedObject(objectName);
  }
}
