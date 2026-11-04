import type { Context } from "hono";
import { Readable } from "node:stream";
import { ResponseError } from "../error/response-error";
import { ensureImageVariant, parseVariantWidth } from "./image-variants";
import {
  openMinioObjectStream,
  presignMinioGet,
  statMinioObject,
  type ByteRange,
} from "./minio";

/** What a service hands back for a file: which object, not its bytes. */
export type StoredObjectRef = { objectName: string };

export function storedObject(objectName: string): StoredObjectRef {
  return { objectName };
}

/** Metadata of a MinIO object, read only when the backend streams it itself. */
export type StoredFile = StoredObjectRef & {
  contentType: string;
  size: number;
  etag?: string;
  lastModified?: Date;
};

type FileResponseOptions = {
  cacheControl: string;
  acceptRanges?: boolean;
};

type ObjectOpener = (objectName: string, range?: ByteRange) => Promise<Readable>;

/**
 * nginx location that fetches a signed MinIO URL on the backend's behalf. See
 * `location /_minio/` in client/nginx.conf.
 */
export const NGINX_MINIO_PREFIX = "/_minio";

/** Object keys we create only use these characters; anything else is streamed. */
const NGINX_SAFE_KEY = /^(?!.*\.\.)[A-Za-z0-9][A-Za-z0-9/._-]*$/;

/**
 * Production sets FILE_DELIVERY=nginx. Bun's HTTP server reads a streamed body
 * ahead without limit, so thirty slow visitors watching a 22MB video still
 * pushed the backend past 1GB of memory. nginx moves the bytes instead, with
 * real backpressure, Range support and a disk buffer for slow clients.
 */
export function deliversThroughNginx(env: NodeJS.ProcessEnv = process.env) {
  return env.FILE_DELIVERY?.trim().toLowerCase() === "nginx";
}

/**
 * Largest slice one range request returns. Browsers playing a video ask for
 * `bytes=0-` (everything); answering with a smaller slice is allowed by HTTP
 * and they simply ask for the next one. That keeps memory per request bounded
 * while still sending a real Content-Length, which Safari needs for video.
 */
export const MAX_RANGE_CHUNK = 2 * 1024 * 1024;

export async function statStoredFile(objectName: string): Promise<StoredFile> {
  const stat = await statMinioObject(objectName);

  return {
    objectName,
    contentType:
      String(
        stat.metaData?.["content-type"] ?? stat.metaData?.["Content-Type"] ?? "",
      ) || "application/octet-stream",
    size: stat.size,
    etag: stat.etag ? `"${String(stat.etag).replace(/"/g, "")}"` : undefined,
    lastModified: stat.lastModified,
  };
}

export function parseRange(rangeHeader: string, size: number): ByteRange | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
  if (!match) return null;

  const [, rawStart, rawEnd] = match;
  if (!rawStart && !rawEnd) return null;

  if (!rawStart) {
    const suffixLength = Number(rawEnd);
    if (!Number.isInteger(suffixLength) || suffixLength <= 0) return null;
    return {
      start: Math.max(size - suffixLength, 0),
      end: size - 1,
    };
  }

  const start = Number(rawStart);
  const end = rawEnd ? Number(rawEnd) : size - 1;

  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end < start ||
    start >= size
  ) {
    return null;
  }

  return {
    start,
    end: Math.min(end, size - 1),
  };
}

/**
 * Bun drops Content-Length for a stream whose bytes arrive later, so a full
 * file goes out chunked. Browsers are fine with that for images and documents.
 */
function webStream(stream: Readable) {
  // Pull-based on purpose: Readable.toWeb in Bun reads ahead without limit,
  // so a slow visitor made the server hold the whole file anyway. Here the
  // next chunk is read from MinIO only when the socket asks for it.
  const chunks = stream[Symbol.asyncIterator]();

  return new ReadableStream<Uint8Array>(
    {
      async pull(controller) {
        try {
          const { value, done } = await chunks.next();
          if (done) controller.close();
          else controller.enqueue(value instanceof Uint8Array ? value : Buffer.from(value));
        } catch (error) {
          controller.error(error);
        }
      },
      cancel() {
        stream.destroy();
      },
    },
    { highWaterMark: 1 },
  );
}

async function readAll(stream: Readable) {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function etagMatches(header: string | undefined, etag: string | undefined) {
  if (!header || !etag) return false;
  if (header.trim() === "*") return true;
  return header
    .split(",")
    .map((value) => value.trim().replace(/^W\//, ""))
    .includes(etag);
}

/**
 * The backend only checks the database and signs a URL; nginx fetches the
 * object from MinIO and sends it. MinIO answers Range, If-None-Match and
 * Content-Length itself. nginx keeps this response's Cache-Control and drops
 * MinIO's, so the header below is what visitors get.
 */
export async function redirectToNginx(
  c: Context,
  file: StoredObjectRef,
  { cacheControl }: FileResponseOptions,
  presign: typeof presignMinioGet = presignMinioGet,
) {
  const signed = new URL(await presign(file.objectName));

  c.header("X-Accel-Redirect", `${NGINX_MINIO_PREFIX}${signed.pathname}${signed.search}`);
  c.header("Cache-Control", cacheControl);
  c.header("X-Content-Type-Options", "nosniff");
  return c.body(null);
}

export async function sendStoredFile(
  c: Context,
  file: StoredObjectRef,
  options: FileResponseOptions,
) {
  if (deliversThroughNginx() && NGINX_SAFE_KEY.test(file.objectName)) {
    return redirectToNginx(c, file, options);
  }

  return streamStoredFile(c, await statStoredFile(file.objectName), options);
}

/**
 * Like sendStoredFile, but `?w=640` (one of IMAGE_VARIANT_WIDTHS) answers with
 * a downscaled WebP copy, made on first request and kept in MinIO. Any other
 * `w` is ignored and the original is sent.
 */
export async function sendStoredImage(
  c: Context,
  file: StoredObjectRef,
  options: FileResponseOptions,
) {
  const width = parseVariantWidth(c.req.query("w"));
  if (!width) return sendStoredFile(c, file, options);

  return sendStoredFile(
    c,
    { objectName: await ensureImageVariant(file.objectName, width) },
    options,
  );
}

/** Development path, used when no nginx sits in front of the backend. */
export async function streamStoredFile(
  c: Context,
  file: StoredFile,
  { acceptRanges = false, cacheControl }: FileResponseOptions,
  open: ObjectOpener = openMinioObjectStream,
) {
  c.header("Content-Type", file.contentType);
  c.header("Cache-Control", cacheControl);
  c.header("X-Content-Type-Options", "nosniff");
  if (file.etag) c.header("ETag", file.etag);
  if (file.lastModified) c.header("Last-Modified", file.lastModified.toUTCString());
  if (acceptRanges) c.header("Accept-Ranges", "bytes");

  // The browser already has this exact file: answer without touching MinIO.
  if (etagMatches(c.req.header("if-none-match"), file.etag)) {
    return c.body(null, 304);
  }

  const rangeHeader = acceptRanges ? c.req.header("range") : undefined;

  if (!rangeHeader) {
    c.header("Content-Length", String(file.size));
    if (c.req.method === "HEAD") return c.body(null);
    return c.body(webStream(await open(file.objectName)));
  }

  const requested = parseRange(rangeHeader, file.size);
  if (!requested) {
    c.header("Content-Range", `bytes */${file.size}`);
    throw new ResponseError(416, "Requested range not satisfiable.");
  }

  const range = {
    start: requested.start,
    end: Math.min(requested.end, requested.start + MAX_RANGE_CHUNK - 1),
  };

  c.header("Content-Length", String(range.end - range.start + 1));
  c.header("Content-Range", `bytes ${range.start}-${range.end}/${file.size}`);
  if (c.req.method === "HEAD") return c.body(null, 206);

  const bytes = await readAll(await open(file.objectName, range));
  return c.body(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
    206,
  );
}
