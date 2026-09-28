type RuntimeEnv = Record<string, string | undefined>;

const runtimeEnv: RuntimeEnv =
  typeof window !== "undefined" && (window as { __MWS_ENV__?: RuntimeEnv }).__MWS_ENV__
    ? (window as { __MWS_ENV__?: RuntimeEnv }).__MWS_ENV__!
    : {};

function readEnv(key: string): string {
  return runtimeEnv[key] || (import.meta.env[key] as string | undefined) || "";
}

function readRuntimeEnv(key: string): string | undefined {
  return Object.prototype.hasOwnProperty.call(runtimeEnv, key)
    ? runtimeEnv[key] || ""
    : undefined;
}

function defaultApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:4004`;
  }
  return "http://localhost:4004";
}

function defaultGoogleRedirectUri(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth/google/callback`;
  }
  return "http://localhost:7001/auth/google/callback";
}

const runtimeApiBaseUrl =
  readRuntimeEnv("VITE_API_BASE_URL") ?? readRuntimeEnv("VITE_HUB_API_BASE_URL");

export const env = {
  apiBaseUrl:
    runtimeApiBaseUrl ??
    (readEnv("VITE_API_BASE_URL") ||
      readEnv("VITE_HUB_API_BASE_URL") ||
      defaultApiBaseUrl()),
  googleClientId: readEnv("VITE_GOOGLE_CLIENT_ID"),
  googleRedirectUri: readEnv("VITE_GOOGLE_REDIRECT_URI") || defaultGoogleRedirectUri(),
};
