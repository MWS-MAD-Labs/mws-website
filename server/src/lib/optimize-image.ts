import sharp, { type OutputInfo, type Sharp } from "sharp";
import { ResponseError } from "../error/response-error";

/** Wide enough for a full-width article image on a retina laptop. */
export const ARTICLE_IMAGE_MAX_EDGE = 2000;
/** A stored article image must stay below this after optimizing. */
export const ARTICLE_IMAGE_MAX_OUTPUT_BYTES = 1.5 * 1024 * 1024;
/** Refuse decompression bombs: ~50 megapixels is more than any phone camera. */
const MAX_INPUT_PIXELS = 50_000_000;

export type OptimizedImage = {
  bytes: Buffer;
  width: number;
  height: number;
};

/**
 * Every uploaded image is resized to at most 2000px on its longest side and
 * re-encoded as WebP, so a 6MB phone photo lands as a few hundred KB. Sharp
 * also drops EXIF, which removes GPS location from photos of students.
 */
export async function optimizeImage(input: Uint8Array): Promise<OptimizedImage> {
  let pipeline: Sharp;
  try {
    pipeline = sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, failOn: "error" })
      .rotate()
      .resize({
        width: ARTICLE_IMAGE_MAX_EDGE,
        height: ARTICLE_IMAGE_MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      });
  } catch {
    throw new ResponseError(400, "Image could not be read.");
  }

  for (const quality of [80, 65, 50]) {
    let result: { data: Buffer; info: OutputInfo };
    try {
      result = await pipeline.clone().webp({ quality, effort: 4 }).toBuffer({
        resolveWithObject: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      throw new ResponseError(
        400,
        /pixel limit/i.test(message)
          ? "Image resolution is too large. Use a photo under 50 megapixels."
          : "Image could not be read. It may be damaged or not a real image.",
      );
    }

    if (result.data.byteLength <= ARTICLE_IMAGE_MAX_OUTPUT_BYTES) {
      return {
        bytes: result.data,
        width: result.info.width,
        height: result.info.height,
      };
    }
  }

  throw new ResponseError(
    400,
    "Image is still too heavy after compressing. Use a simpler or smaller photo.",
  );
}

/** @deprecated use optimizeImage */
export const optimizeArticleImage = optimizeImage;

/** Largest file an admin may upload; it is shrunk before it is stored. */
export const MAX_UPLOAD_IMAGE_SIZE = 15 * 1024 * 1024;

/** `photo.JPG` -> `photo.webp`, since the stored bytes are always WebP now. */
export function webpFileName(name: string) {
  return `${name.replace(/\.[^./]*$/, "") || "image"}.webp`;
}

/** Downscale for a thumbnail. Never enlarges; always WebP. */
export async function resizeImage(input: Uint8Array, width: number) {
  try {
    return await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS })
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 72, effort: 4 })
      .toBuffer();
  } catch {
    throw new ResponseError(404, "Image variant could not be created.");
  }
}
