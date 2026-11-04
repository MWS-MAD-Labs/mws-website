import {
  getMinioObjectBuffer,
  putMinioObject,
  statMinioObject,
} from "./minio";
import { resizeImage } from "./optimize-image";
import { ResponseError } from "../error/response-error";
import { IMAGE_VARIANT_WIDTHS, variantObjectName } from "./image-variant-names";

export { IMAGE_VARIANT_WIDTHS, variantObjectName };

/** Resizing is CPU heavy; at most this many run at once. */
const MAX_PARALLEL_RESIZES = 2;
/** Variants known to exist, to skip a MinIO stat on every request. */
const KNOWN_LIMIT = 5000;

const known = new Set<string>();
const inFlight = new Map<string, Promise<string>>();
let running = 0;
const waiting: Array<() => void> = [];

export function parseVariantWidth(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const width = Number(raw);
  return (IMAGE_VARIANT_WIDTHS as readonly number[]).includes(width) ? width : undefined;
}

async function withResizeSlot<T>(task: () => Promise<T>) {
  if (running >= MAX_PARALLEL_RESIZES) {
    // The finishing task hands its slot straight to us, so `running` stays put.
    await new Promise<void>((resolve) => waiting.push(resolve));
  } else {
    running += 1;
  }

  try {
    return await task();
  } finally {
    const next = waiting.shift();
    if (next) next();
    else running -= 1;
  }
}

function remember(name: string) {
  if (known.size >= KNOWN_LIMIT) known.clear();
  known.add(name);
}

type Storage = {
  stat: (name: string) => Promise<unknown>;
  read: (name: string) => Promise<Buffer>;
  write: (name: string, bytes: Buffer) => Promise<unknown>;
  resize: (bytes: Uint8Array, width: number) => Promise<Buffer>;
};

const minioStorage: Storage = {
  stat: (name) => statMinioObject(name),
  read: (name) => getMinioObjectBuffer(name),
  write: (name, bytes) =>
    putMinioObject(name, bytes, {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000",
    }),
  resize: resizeImage,
};

function isMissing(error: unknown) {
  return error instanceof ResponseError && error.status === 404;
}

/**
 * Returns the object name of a downscaled copy, creating it the first time
 * it is asked for. Later requests are served straight from MinIO by nginx.
 */
export async function ensureImageVariant(
  objectName: string,
  width: number,
  storage: Storage = minioStorage,
): Promise<string> {
  const name = variantObjectName(objectName, width);
  if (known.has(name)) return name;

  const pending = inFlight.get(name);
  if (pending) return pending;

  const job = (async () => {
    try {
      await storage.stat(name);
    } catch (error) {
      if (!isMissing(error)) throw error;

      await withResizeSlot(async () => {
        const original = await storage.read(objectName);
        await storage.write(name, await storage.resize(original, width));
      });
    }

    remember(name);
    return name;
  })();

  inFlight.set(name, job);
  try {
    return await job;
  } finally {
    inFlight.delete(name);
  }
}

/** Test hook. */
export function resetImageVariantState() {
  known.clear();
  inFlight.clear();
}
