import { JWT } from "google-auth-library";

/**
 * Reads the Google service account from GOOGLE_SA_CLIENT_EMAIL and
 * GOOGLE_SA_PRIVATE_KEY (copied from the JSON key's `client_email` and
 * `private_key`). Returns null when either is missing.
 */
export function serviceAccountCredentials() {
  const clientEmail = process.env.GOOGLE_SA_CLIENT_EMAIL?.trim();
  // .env files keep the key on one line with literal "\n" sequences.
  const privateKey = process.env.GOOGLE_SA_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();

  if (!clientEmail || !privateKey) return null;
  return { clientEmail, privateKey };
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
