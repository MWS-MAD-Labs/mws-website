/**
 * Asks Google whether configured Google integrations are reachable. Sends no
 * email; prints only OK or Google's error code, never the credentials.
 *
 * Run from the server folder: `bun run src/scripts/check-google-access.ts`
 */
import "dotenv/config";
import {
  createServiceAccountClient,
  serviceAccountCredentials,
} from "../lib/google-service-account";

const mailSender = process.env.MAIL_SENDER?.trim();
const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim();
const calendarApiKey = process.env.GOOGLE_CALENDAR_API_KEY?.trim();

const checks: Array<{ label: string; scope: string; subject?: string }> = [];
if (mailSender) {
  checks.push({
    label: `Email: gmail.send as ${mailSender}`,
    scope: "https://www.googleapis.com/auth/gmail.send",
    subject: mailSender,
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

if (checks.length) {
  const credentials = serviceAccountCredentials();
  if (!credentials) {
    console.log("FAIL  GOOGLE_SA_CLIENT_EMAIL / GOOGLE_SA_PRIVATE_KEY are not set.");
  } else {
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
  }
}

if (calendarId && calendarApiKey) {
  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
  );
  url.searchParams.set("key", calendarApiKey);
  url.searchParams.set("maxResults", "1");
  url.searchParams.set("singleEvents", "true");
  try {
    const response = await fetch(url);
    console.log(`${response.ok ? "OK" : "FAIL"}   Calendar: public events via API key`);
    if (!response.ok) console.log(`      Google: HTTP ${response.status}`);
  } catch (error) {
    console.log("FAIL  Calendar: public events via API key");
    console.log(`      Google: ${error instanceof Error ? error.message : String(error)}`);
  }
} else if (calendarId || calendarApiKey) {
  console.log("FAIL  Calendar: set both GOOGLE_CALENDAR_ID and GOOGLE_CALENDAR_API_KEY.");
}

if (!checks.length && !calendarId && !calendarApiKey) {
  console.log("Nothing to check: set MAIL_SENDER or GOOGLE_CALENDAR_ID / GOOGLE_CALENDAR_API_KEY.");
}
