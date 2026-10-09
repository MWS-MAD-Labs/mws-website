/**
 * Asks Google whether the service account may get an access token for each
 * scope the website uses. Sends no email; prints
 * only OK or Google's error code, never the credentials.
 *
 * Run from the server folder: `bun run src/scripts/check-google-access.ts`
 */
import "dotenv/config";
import {
  createServiceAccountClient,
  serviceAccountCredentials,
} from "../lib/google-service-account";

const credentials = serviceAccountCredentials();
if (!credentials) {
  console.log("FAIL  GOOGLE_SA_CLIENT_EMAIL / GOOGLE_SA_PRIVATE_KEY are not set.");
  process.exit(1);
}

const mailSender = process.env.MAIL_SENDER?.trim();
const calendarSubject = process.env.GOOGLE_CALENDAR_SUBJECT?.trim() || undefined;
const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim();

const checks: Array<{ label: string; scope: string; subject?: string }> = [];
if (mailSender) {
  checks.push({
    label: `Email: gmail.send as ${mailSender}`,
    scope: "https://www.googleapis.com/auth/gmail.send",
    subject: mailSender,
  });
}

if (calendarId) {
  checks.push({
    label: `Calendar: calendar.readonly${calendarSubject ? ` as ${calendarSubject}` : " as service account"}`,
    scope: "https://www.googleapis.com/auth/calendar.readonly",
    subject: calendarSubject,
  });
}

const hints: Record<string, string> = {
  invalid_client:
    "GOOGLE_SA_CLIENT_EMAIL is wrong (use client_email, not client_id) or the service account was deleted/disabled.",
  invalid_grant:
    "The private key does not match this service account (key deleted or copied wrong), or the server clock is off.",
  unauthorized_client:
    "This scope is not in Domain-wide delegation for the service account's Client ID.",
  access_denied:
    "This scope is not in Domain-wide delegation for the service account's Client ID (or not saved yet / still propagating).",
};

for (const check of checks) {
  try {
    const client = createServiceAccountClient(credentials, {
      scopes: [check.scope],
      subject: check.subject,
    });
    await client.authorize();
    console.log(`OK    ${check.label}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const code = Object.keys(hints).find((key) => message.includes(key));
    console.log(`FAIL  ${check.label}`);
    console.log(`      Google: ${message.split("\n")[0]}`);
    if (code) console.log(`      Meaning: ${hints[code]}`);
  }
}

if (!checks.length) {
  console.log("Nothing to check: set MAIL_SENDER or GOOGLE_CALENDAR_ID.");
}
