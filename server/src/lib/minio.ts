import { Client, type ClientOptions } from "minio";
import type { Readable } from "node:stream";
import { ResponseError } from "../error/response-error";
import { variantObjectNames } from "./image-variant-names";

export type MinioConfig = {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucket: string;
  region: string;
};

let minioClient: Client | null = null;
// Buckets are never deleted at runtime, so one successful check is enough.
// Without this every file request paid an extra round trip to MinIO.
const knownBuckets = new Set<string>();

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for MinIO configuration.`);
  }
  return value;
}

function optionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function readPort(value: string): number {
  const port = Number(value);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("MINIO_PORT must be a positive integer.");
  }
  return port;
}

function readBoolean(value: string): boolean {
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

export function getMinioConfig(): MinioConfig {
  return {
    endPoint: requiredEnv("MINIO_ENDPOINT"),
    port: readPort(requiredEnv("MINIO_PORT")),
    useSSL: readBoolean(requiredEnv("MINIO_USE_SSL")),
    accessKey: optionalEnv("MINIO_ACCESS_KEY") ?? requiredEnv("MINIO_ROOT_USER"),
    secretKey:
      optionalEnv("MINIO_SECRET_KEY") ?? requiredEnv("MINIO_ROOT_PASSWORD"),
    bucket: requiredEnv("MINIO_BUCKET"),
    region: optionalEnv("MINIO_REGION") ?? "us-east-1",
  };
}

export function getMinioClient(): Client {
  if (minioClient) return minioClient;

  const config = getMinioConfig();
  const options: ClientOptions = {
    endPoint: config.endPoint,
    port: config.port,
    useSSL: config.useSSL,
    accessKey: config.accessKey,
    secretKey: config.secretKey,
    region: config.region,
    pathStyle: true,
  };

  minioClient = new Client(options);
  minioClient.setAppInfo("mws-website", "1.0.0");

  return minioClient;
}

function isMinioNotFoundError(error: unknown) {
  const s3Error = error as {
    code?: string;
    statusCode?: number;
    message?: string;
  };
  const code = s3Error.code?.toLowerCase();
  const message = s3Error.message?.toLowerCase();

  return (
    s3Error.statusCode === 404 ||
    code === "notfound" ||
    code === "nosuchbucket" ||
    code === "nosuchkey" ||
    message === "not found"
  );
}

function toMissingObjectError(objectName: string) {
  return new ResponseError(404, `Storage object not found: ${objectName}`);
}

export async function ensureMinioBucket(bucket = getMinioConfig().bucket) {
  if (knownBuckets.has(bucket)) return bucket;

  const client = getMinioClient();
  const exists = await client.bucketExists(bucket);

  if (!exists) {
    await client.makeBucket(bucket, getMinioConfig().region);
  }

  knownBuckets.add(bucket);
  return bucket;
}

/** Test hook: forget which buckets were already checked. */
export function resetMinioBucketCache() {
  knownBuckets.clear();
}

export async function putMinioObject(
  objectName: string,
  data: Buffer | string,
  metaData?: Record<string, string>,
) {
  const config = getMinioConfig();
  await ensureMinioBucket(config.bucket);

  return getMinioClient().putObject(
    config.bucket,
    objectName,
    data,
    Buffer.byteLength(data),
    metaData,
  );
}

export async function statMinioObject(objectName: string) {
  const config = getMinioConfig();
  try {
    await ensureMinioBucket(config.bucket);
    return await getMinioClient().statObject(config.bucket, objectName);
  } catch (error) {
    if (isMinioNotFoundError(error)) {
      throw toMissingObjectError(objectName);
    }
    throw error;
  }
}

export async function deleteMinioObject(objectName: string) {
  const config = getMinioConfig();
  try {
    await ensureMinioBucket(config.bucket);
    await getMinioClient().removeObject(config.bucket, objectName);
  } catch (error) {
    if (isMinioNotFoundError(error)) return;
    throw error;
  }

  // Thumbnails made from this file. Most never existed, which MinIO ignores;
  // a leftover is only wasted space, so a failure here never fails the delete.
  const variants = variantObjectNames(objectName);
  if (variants.length) {
    await getMinioClient()
      .removeObjects(config.bucket, variants)
      .catch(() => undefined);
  }
}

export async function getMinioObjectBuffer(objectName: string) {
  const config = getMinioConfig();
  let stream: Readable;
  try {
    await ensureMinioBucket(config.bucket);
    stream = (await getMinioClient().getObject(
      config.bucket,
      objectName,
    )) as Readable;
  } catch (error) {
    if (isMinioNotFoundError(error)) {
      throw toMissingObjectError(objectName);
    }
    throw error;
  }
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

export type ByteRange = { start: number; end: number };

/**
 * Streams an object instead of buffering it, so serving a 50MB video costs a
 * few KB of memory per request. With a range only those bytes leave MinIO.
 */
export async function openMinioObjectStream(objectName: string, range?: ByteRange) {
  const config = getMinioConfig();
  try {
    await ensureMinioBucket(config.bucket);
    const client = getMinioClient();
    return (
      range
        ? await client.getPartialObject(
            config.bucket,
            objectName,
            range.start,
            range.end - range.start + 1,
          )
        : await client.getObject(config.bucket, objectName)
    ) as Readable;
  } catch (error) {
    if (isMinioNotFoundError(error)) {
      throw toMissingObjectError(objectName);
    }
    throw error;
  }
}

/**
 * A short-lived signed URL for nginx to fetch the object itself. Signing is
 * local (the region is configured), so this costs no request to MinIO.
 */
export async function presignMinioGet(
  objectName: string,
  responseHeaders: Record<string, string> = {},
  expiresSeconds = 300,
) {
  const config = getMinioConfig();
  return getMinioClient().presignedGetObject(
    config.bucket,
    objectName,
    expiresSeconds,
    responseHeaders,
  );
}
