import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { Readable } from "node:stream";
import { ResponseError } from "../error/response-error";
import {
  MAX_RANGE_CHUNK,
  deliversThroughNginx,
  redirectToNginx,
  streamStoredFile as sendStoredFile,
  type StoredFile,
} from "../lib/file-response";
import type { ByteRange } from "../lib/minio";

const BYTES = Buffer.from("0123456789");
const FILE: StoredFile = {
  objectName: "gallery/videos/clip.mp4",
  contentType: "video/mp4",
  size: BYTES.length,
  etag: '"abc123"',
  lastModified: new Date("2026-11-01T00:00:00.000Z"),
};

function app(acceptRanges: boolean) {
  const opened: Array<ByteRange | undefined> = [];
  const open = async (_name: string, range?: ByteRange) => {
    opened.push(range);
    return Readable.from([range ? BYTES.subarray(range.start, range.end + 1) : BYTES]);
  };

  const server = new Hono();
  server.onError((error, c) =>
    error instanceof ResponseError
      ? c.json({ errors: error.message }, error.status as 416)
      : c.json({ errors: "boom" }, 500),
  );
  server.on(["GET", "HEAD"], "/file", (c) =>
    sendStoredFile(c, FILE, { acceptRanges, cacheControl: "public, max-age=60" }, open),
  );

  return { server, opened };
}

describe("streamStoredFile", () => {
  it("streams the whole file with cache validators", async () => {
    const { server, opened } = app(false);
    const response = await server.request("/file");

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("0123456789");
    expect(response.headers.get("content-length")).toBe("10");
    expect(response.headers.get("etag")).toBe('"abc123"');
    expect(response.headers.get("last-modified")).toBe("Sun, 01 Nov 2026 00:00:00 GMT");
    expect(opened).toEqual([undefined]);
  });

  it("asks MinIO for only the requested range", async () => {
    const { server, opened } = app(true);
    const response = await server.request("/file", { headers: { range: "bytes=2-5" } });

    expect(response.status).toBe(206);
    expect(await response.text()).toBe("2345");
    expect(response.headers.get("content-range")).toBe("bytes 2-5/10");
    expect(response.headers.get("content-length")).toBe("4");
    expect(opened).toEqual([{ start: 2, end: 5 }]);
  });

  it("caps an open-ended range so one request never buffers a whole video", async () => {
    const big: StoredFile = { ...FILE, size: 50 * 1024 * 1024 };
    const opened: ByteRange[] = [];
    const server = new Hono();
    server.get("/big", (c) =>
      sendStoredFile(c, big, { acceptRanges: true, cacheControl: "public" }, async (_n, range) => {
        opened.push(range!);
        return Readable.from([Buffer.alloc(range!.end - range!.start + 1)]);
      }),
    );

    const response = await server.request("/big", { headers: { range: "bytes=0-" } });

    expect(response.status).toBe(206);
    expect(response.headers.get("content-range")).toBe(
      `bytes 0-${MAX_RANGE_CHUNK - 1}/${50 * 1024 * 1024}`,
    );
    expect((await response.arrayBuffer()).byteLength).toBe(MAX_RANGE_CHUNK);
    expect(opened).toEqual([{ start: 0, end: MAX_RANGE_CHUNK - 1 }]);
  });

  it("answers 304 without opening the object when the browser has it", async () => {
    const { server, opened } = app(false);
    const response = await server.request("/file", {
      headers: { "if-none-match": 'W/"abc123"' },
    });

    expect(response.status).toBe(304);
    expect(opened).toEqual([]);
  });

  it("does not open the object for HEAD", async () => {
    const { server, opened } = app(true);
    const response = await server.request("/file", { method: "HEAD" });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-length")).toBe("10");
    expect(opened).toEqual([]);
  });

  it("rejects an unsatisfiable range", async () => {
    const { server, opened } = app(true);
    const response = await server.request("/file", { headers: { range: "bytes=50-60" } });

    expect(response.status).toBe(416);
    expect(opened).toEqual([]);
  });

  it("ignores Range on files served without range support", async () => {
    const { server, opened } = app(false);
    const response = await server.request("/file", { headers: { range: "bytes=2-5" } });

    expect(response.status).toBe(200);
    expect(opened).toEqual([undefined]);
  });
});

describe("nginx delivery", () => {
  it("is opt-in through FILE_DELIVERY", () => {
    expect(deliversThroughNginx({})).toBe(false);
    expect(deliversThroughNginx({ FILE_DELIVERY: "nginx" })).toBe(true);
  });

  it("hands nginx a signed MinIO path and sends no bytes", async () => {
    const presigned: string[] = [];
    const server = new Hono();
    server.get("/file", (c) =>
      redirectToNginx(
        c,
        { objectName: "gallery/videos/clip.mp4" },
        { cacheControl: "public, max-age=60" },
        async (name) => {
          presigned.push(name);
          return "http://minio:9000/mws-gallery/gallery/videos/clip.mp4?X-Amz-Signature=abc";
        },
      ),
    );

    const response = await server.request("/file");

    expect(response.headers.get("x-accel-redirect")).toBe(
      "/_minio/mws-gallery/gallery/videos/clip.mp4?X-Amz-Signature=abc",
    );
    expect(response.headers.get("cache-control")).toBe("public, max-age=60");
    expect(await response.text()).toBe("");
    expect(presigned).toEqual(["gallery/videos/clip.mp4"]);
  });
});
