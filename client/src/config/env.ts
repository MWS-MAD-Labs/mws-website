type RuntimeEnv = Record<string, string | undefined>;

const runtimeEnv: RuntimeEnv =
  typeof window !== "undefined" && (window as { __MWS_ENV__?: RuntimeEnv }).__MWS_ENV__
    ? (window as { __MWS_ENV__?: RuntimeEnv }).__MWS_ENV__!
    : {};

function readEnv(key: string): string {
  return runtimeEnv[key] || (import.meta.env[key] as string | undefined) || "";
}

export const env = {
  apiBaseUrl:
    readEnv("VITE_API_BASE_URL") ||
    readEnv("VITE_HUB_API_BASE_URL") ||
    (import.meta.env.DEV ? "http://localhost:4004" : ""),
  googleClientId: readEnv("VITE_GOOGLE_CLIENT_ID"),
  googleRedirectUri: readEnv("VITE_GOOGLE_REDIRECT_URI"),
};
