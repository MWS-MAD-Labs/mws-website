import { beforeEach, describe, expect, it, mock } from "bun:test";
import { Readable } from "node:stream";
import { ResponseError } from "../error/response-error";

const bucketExists = mock(async () => true);
const makeBucket = mock(async () => undefined);
const statObject = mock(async () => ({
  size: 3,
  metaData: { "content-type": "text/plain" },
}));
const removeObject = mock(async () => undefined);
const getObject = mock(async () => Readable.from([Buffer.from("ok")]));

mock.module("minio", () => ({
  Client: mock(function Client() {
    return {
      bucketExists,
      makeBucket,
      statObject,
      removeObject,
      getObject,
      setAppInfo: mock(() => undefined),
    };
  }),
}));

const { deleteMinioObject, getMinioObjectBuffer, statMinioObject } = await import(
  "../lib/minio"
);

function s3NotFound() {
  return Object.assign(new Error("Not Found"), { code: "NotFound" });
}

beforeEach(() => {
  process.env.MINIO_ENDPOINT = "127.0.0.1";
  process.env.MINIO_PORT = "9020";
  process.env.MINIO_USE_SSL = "false";
  process.env.MINIO_ACCESS_KEY = "minioadmin";
  process.env.MINIO_SECRET_KEY = "minioadmin123";
  process.env.MINIO_BUCKET = "mws-gallery";

  bucketExists.mockClear();
  makeBucket.mockClear();
  statObject.mockClear();
  removeObject.mockClear();
  getObject.mockClear();

  bucketExists.mockImplementation(async () => true);
  statObject.mockImplementation(async () => ({
    size: 3,
    metaData: { "content-type": "text/plain" },
  }));
  removeObject.mockImplementation(async () => undefined);
  getObject.mockImplementation(async () => Readable.from([Buffer.from("ok")]));
});

describe("MinIO helpers", () => {
  it("creates the configured bucket before reading object metadata", async () => {
    bucketExists.mockImplementationOnce(async () => false);

    await statMinioObject("gallery/images/photo.jpg");

    expect(makeBucket).toHaveBeenCalledWith("mws-gallery", "us-east-1");
    expect(statObject).toHaveBeenCalledWith(
      "mws-gallery",
      "gallery/images/photo.jpg",
    );
  });

  it("maps S3 missing object responses to app 404 errors", async () => {
    statObject.mockImplementationOnce(async () => {
      throw s3NotFound();
    });

    await expect(
      statMinioObject("gallery/videos/missing.mp4"),
    ).rejects.toMatchObject({
      status: 404,
      message: "Storage object not found: gallery/videos/missing.mp4",
    } satisfies Partial<ResponseError>);
  });

  it("ignores missing stored objects during delete", async () => {
    removeObject.mockImplementationOnce(async () => {
      throw s3NotFound();
    });

    await expect(
      deleteMinioObject("gallery/images/missing.jpg"),
    ).resolves.toBeUndefined();
  });

  it("returns object data from the storage stream", async () => {
    await expect(getMinioObjectBuffer("gallery/images/photo.jpg")).resolves.toEqual(
      Buffer.from("ok"),
    );
  });
});
