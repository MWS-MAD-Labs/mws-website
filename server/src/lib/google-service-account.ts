import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { JWT } from "google-auth-library";

/** server/ — this file lives in server/src/lib. */
const SERVER_ROOT = path.resolve(import.meta.dir, "../..");

/**
 * Finds the service account JSON key named by WEBSITE_GMAIL_CREDENTIALS_FILE.
 * The value may be a file or a folder holding exactly one .json file, and may
 * be relative to the working directory, the server folder or the repo root
 * (so both "secret" and "server/secret" work).
 */
function resolveCredentialsFile(value: string): string | null {
  const candidates = path.isAbsolute(value)
    ? [value]
    : [
        path.resolve(process.cwd(), value),
        path.resolve(SERVER_ROOT, value),
        path.resolve(SERVER_ROOT, "..", value),
      ];

  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;
    if (statSync(candidate).isFile()) return candidate;

    const jsonFiles = readdirSync(candidate).filter((name) => name.endsWith(".json"));
    if (jsonFiles.length === 1) return path.join(candidate, jsonFiles[0]!);
    if (jsonFiles.length > 1) {
      console.error(
        `[GOOGLE] ${candidate} has ${jsonFiles.length} .json files; set WEBSITE_GMAIL_CREDENTIALS_FILE to one of them.`,
      );
      return null;
    }
  }

  return null;
}

function credentialsFromFile() {
  const configured = process.env.WEBSITE_GMAIL_CREDENTIALS_FILE?.trim();
  if (!configured) return null;

  const file = resolveCredentialsFile(configured);
  if (!file) {
    console.error("[GOOGLE] WEBSITE_GMAIL_CREDENTIALS_FILE does not point to a readable JSON key.");
    return null;
  }

  try {
    const json = JSON.parse(readFileSync(file, "utf8")) as {
      client_email?: unknown;
      private_key?: unknown;
    };
    const clientEmail = typeof json.client_email === "string" ? json.client_email.trim() : "";
    const privateKey = typeof json.private_key === "string" ? json.private_key.trim() : "";

    if (!clientEmail || !privateKey) {
      console.error("[GOOGLE] Service account JSON is missing client_email or private_key.");
      return null;
    }
    return { clientEmail, privateKey };
  } catch {
    console.error("[GOOGLE] Service account JSON could not be read.");
    return null;
  }
}

/**
 * Reads the Google service account from GOOGLE_SA_CLIENT_EMAIL and
 * GOOGLE_SA_PRIVATE_KEY (copied from the JSON key's `client_email` and
 * `private_key`), or else from the JSON key file named by
 * WEBSITE_GMAIL_CREDENTIALS_FILE. Returns null when neither is set.
 */
export function serviceAccountCredentials() {
  const clientEmail = process.env.GOOGLE_SA_CLIENT_EMAIL?.trim();
  // .env files keep the key on one line with literal "\n" sequences.
  const privateKey = process.env.GOOGLE_SA_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();

  if (clientEmail && privateKey) return { clientEmail, privateKey };
  return credentialsFromFile();
}

export type ServiceAccountCredentials = NonNullable<ReturnType<typeof serviceAccountCredentials>>;

/**
 * A client that signs requests as the service account. Each feature asks only
 * for the scopes it needs. `subject` impersonates a Workspace user through
 * domain-wide delegation; leave it out to act as the service account itself
 * (for example on a calendar shared directly with its email).
 */
export function createServiceAccountClient(
  credentials: ServiceAccountCredentials,
  options: { scopes: string[]; subject?: string },
) {
  return new JWT({
    email: credentials.clientEmail,
    key: credentials.privateKey,
    scopes: options.scopes,
    subject: options.subject,
  });
}
