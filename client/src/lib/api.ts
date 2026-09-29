import axios, { AxiosError, type AxiosRequestConfig, type Method } from "axios";
import { env } from "@/config/env";

export class ApiError extends Error {
  status?: number;
  payload?: unknown;

  constructor(
    message: string,
    { status, payload }: { status?: number; payload?: unknown } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

type ApiRequestOptions = Omit<
  AxiosRequestConfig,
  "baseURL" | "data" | "headers" | "method" | "responseType" | "url" | "withCredentials"
> & {
  body?: unknown;
  headers?: HeadersInit;
  method?: Method;
};

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (import.meta.env.DEV) {
    const method = (config.method ?? "GET").toUpperCase();
    console.info(`[API][${method}] ${safeUrl(config.url)}`);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      const method = (response.config.method ?? "GET").toUpperCase();
      console.info(`[API][${response.status}] ${method} ${safeUrl(response.config.url)}`);
    }

    return response;
  },
  (error: AxiosError) => {
    if (import.meta.env.DEV) {
      const method = (error.config?.method ?? "GET").toUpperCase();
      console.error(`[API][ERROR] ${method} ${safeUrl(error.config?.url)}`);
      console.error(`[API][ERROR] status=${error.response?.status ?? "NETWORK"}`);
      console.error(`[API][ERROR] message=${safeErrorMessage(error)}`);
    }

    return Promise.reject(error);
  },
);

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T | null> {
  const { body, headers, method, ...axiosOptions } = options;
  const shouldSerialize = isJsonBody(body);

  try {
    const response = await apiClient.request<T>({
      ...axiosOptions,
      data: body,
      headers: {
        ...(shouldSerialize ? { "Content-Type": "application/json" } : {}),
        ...normalizeHeaders(headers),
      },
      method: method ?? (body === undefined ? "GET" : "POST"),
      url: path,
    });

    if (response.status === 204) return null;
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const payload = error.response?.data;
      throw new ApiError(
        getErrorMessage(payload) || error.response?.statusText || error.message,
        {
          status: error.response?.status,
          payload,
        },
      );
    }

    throw error;
  }
}

export function publicAssetUrl(path: string | null | undefined, fallback = "") {
  if (!path) return fallback;
  return path.startsWith("/api/") ? `${env.apiBaseUrl}${path}` : path;
}

export function normalizePublicAssetUrls<T>(value: T): T {
  if (typeof value === "string") {
    return publicAssetUrl(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizePublicAssetUrls(item)) as T;
  }

  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      normalizePublicAssetUrls(item),
    ]),
  ) as T;
}

function isJsonBody(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  if (body instanceof FormData) return false;
  if (body instanceof URLSearchParams) return false;
  if (body instanceof Blob) return false;
  if (body instanceof ArrayBuffer) return false;
  return true;
}

function normalizeHeaders(headers: HeadersInit | undefined) {
  if (!headers) return {};

  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  return headers;
}

function getErrorMessage(payload: unknown): string {
  if (!payload) return "";
  if (typeof payload === "string") return payload;
  if (typeof payload === "object" && payload !== null && "errors" in payload) {
    return String((payload as { errors: unknown }).errors);
  }
  return "";
}

function safeUrl(url: string | undefined) {
  if (!url) return "<unknown>";

  try {
    const parsed = new URL(url, env.apiBaseUrl || window.location.origin);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url.split("?")[0] || "<unknown>";
  }
}

function safeErrorMessage(error: AxiosError) {
  const payloadMessage = getErrorMessage(error.response?.data);
  return payloadMessage || error.response?.statusText || error.message;
}
