import { Client, type ClientOptions } from "minio";
import type { Readable } from "node:stream";

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

export async function ensureMinioBucket(bucket = getMinioConfig().bucket) {
  const client = getMinioClient();
  const exists = await client.bucketExists(bucket);

  if (!exists) {
    await client.makeBucket(bucket, getMinioConfig().region);
  }

  return bucket;
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
  return getMinioClient().statObject(config.bucket, objectName);
}

export async function deleteMinioObject(objectName: string) {
  const config = getMinioConfig();
  return getMinioClient().removeObject(config.bucket, objectName);
}

export async function getMinioObjectBuffer(objectName: string) {
  const config = getMinioConfig();
  const stream = (await getMinioClient().getObject(
    config.bucket,
    objectName,
  )) as Readable;
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}
