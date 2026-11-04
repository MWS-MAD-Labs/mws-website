/**
 * Shrinks images uploaded before uploads were optimized. Each object keeps its
 * key (so every URL and database row stays valid); only its bytes become a
 * <=2000px WebP. Objects already small enough are left alone.
 *
 *   bun run images:optimize            # dry run: prints what would change
 *   bun run images:optimize --apply    # rewrites objects in MinIO
 *
 * Back up the MinIO volume before --apply: originals are overwritten.
 */
import "dotenv/config";
import sharp from "sharp";
import {
  deleteMinioObject,
  ensureMinioBucket,
  getMinioClient,
  getMinioConfig,
  getMinioObjectBuffer,
  putMinioObject,
} from "../lib/minio";
import { variantObjectNames } from "../lib/image-variant-names";
import { ARTICLE_IMAGE_MAX_EDGE, optimizeImage } from "../lib/optimize-image";

const PREFIXES = ["gallery/images/", "news/images/", "academic/images/"];
/** Below this an image that already fits 2000px is not worth re-encoding. */
const SKIP_BELOW_BYTES = 400 * 1024;

const apply = process.argv.includes("--apply");

function formatBytes(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)}MB`
    : `${Math.round(bytes / 1024)}KB`;
}

async function listObjects(prefix: string) {
  const { bucket } = getMinioConfig();
  const names: Array<{ name: string; size: number }> = [];
  const stream = getMinioClient().listObjectsV2(bucket, prefix, true);

  for await (const item of stream as AsyncIterable<{ name?: string; size?: number }>) {
    if (item.name) names.push({ name: item.name, size: item.size ?? 0 });
  }
  return names;
}

async function main() {
  await ensureMinioBucket();
  console.log(apply ? "Applying changes." : "Dry run. Pass --apply to rewrite objects.");

  let before = 0;
  let after = 0;
  let changed = 0;
  let skipped = 0;
  let failed = 0;

  for (const prefix of PREFIXES) {
    for (const object of await listObjects(prefix)) {
      try {
        const input = await getMinioObjectBuffer(object.name);
        const meta = await sharp(input).metadata();
        const fits =
          (meta.width ?? 0) <= ARTICLE_IMAGE_MAX_EDGE &&
          (meta.height ?? 0) <= ARTICLE_IMAGE_MAX_EDGE;

        if (fits && input.byteLength < SKIP_BELOW_BYTES) {
          skipped += 1;
          continue;
        }

        const optimized = await optimizeImage(input);
        if (optimized.bytes.byteLength >= input.byteLength) {
          skipped += 1;
          continue;
        }

        before += input.byteLength;
        after += optimized.bytes.byteLength;
        changed += 1;
        console.log(
          `${apply ? "rewrote" : "would rewrite"} ${object.name}: ` +
            `${meta.width}x${meta.height} ${formatBytes(input.byteLength)} -> ` +
            `${optimized.width}x${optimized.height} ${formatBytes(optimized.bytes.byteLength)}`,
        );

        if (apply) {
          await putMinioObject(object.name, optimized.bytes, {
            "Content-Type": "image/webp",
            "Cache-Control": "public, max-age=31536000",
          });
          // Thumbnails made from the old bytes are rebuilt on next request.
          await Promise.all(
            variantObjectNames(object.name).map((name) =>
              deleteMinioObject(name).catch(() => undefined),
            ),
          );
        }
      } catch (error) {
        failed += 1;
        console.warn(`skipped ${object.name}: ${error instanceof Error ? error.message : error}`);
      }
    }
  }

  console.log(
    `\n${changed} ${apply ? "rewritten" : "to rewrite"}, ${skipped} already fine, ${failed} failed. ` +
      `${formatBytes(before)} -> ${formatBytes(after)}.`,
  );
}

await main();
process.exit(0);
