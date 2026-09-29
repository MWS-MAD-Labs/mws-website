import type { Context } from "hono";
import { ResponseError } from "../error/response-error";

type StoredFile = {
  buffer: Buffer;
  contentType: string;
  size: number;
};

type FileResponseOptions = {
  cacheControl: string;
  acceptRanges?: boolean;
};

function bufferBody(buffer: Buffer) {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

function parseRange(rangeHeader: string, size: number) {
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

export function sendStoredFile(
  c: Context,
  file: StoredFile,
  { acceptRanges = false, cacheControl }: FileResponseOptions,
) {
  c.header("Content-Type", file.contentType);
  c.header("Cache-Control", cacheControl);

  if (!acceptRanges) {
    c.header("Content-Length", String(file.size));
    return c.body(bufferBody(file.buffer));
  }

  c.header("Accept-Ranges", "bytes");
  const rangeHeader = c.req.header("range");
  if (!rangeHeader) {
    c.header("Content-Length", String(file.size));
    return c.body(bufferBody(file.buffer));
  }

  const range = parseRange(rangeHeader, file.size);
  if (!range) {
    c.header("Content-Range", `bytes */${file.size}`);
    throw new ResponseError(416, "Requested range not satisfiable.");
  }

  const chunk = file.buffer.subarray(range.start, range.end + 1);
  c.header("Content-Length", String(chunk.length));
  c.header("Content-Range", `bytes ${range.start}-${range.end}/${file.size}`);
  return c.body(bufferBody(chunk), 206);
}
