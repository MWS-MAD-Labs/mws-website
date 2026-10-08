/**
 * Checks the shape of the Gmail service account settings without printing
 * any secret value. Run from the server folder: `bun run src/scripts/check-mail-config.ts`
 */
import "dotenv/config";
import { createPrivateKey } from "node:crypto";

function mask(value: string) {
  if (value.length <= 6) return "*".repeat(value.length);
  return `${value.slice(0, 3)}…${value.slice(-3)} (${value.length} chars)`;
}

const rawEmail = process.env.GOOGLE_SA_CLIENT_EMAIL ?? "";
const email = rawEmail.trim();
const rawKey = process.env.GOOGLE_SA_PRIVATE_KEY ?? "";
const key = rawKey.replace(/\\n/g, "\n").trim();
const sender = (process.env.MAIL_SENDER ?? "").trim();
const recipients = (process.env.INQUIRY_NOTIFY_EMAILS ?? "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const checks: Array<[string, boolean, string]> = [];

checks.push(["GOOGLE_SA_CLIENT_EMAIL is set", Boolean(email), email ? mask(email) : "empty"]);
checks.push([
  "GOOGLE_SA_CLIENT_EMAIL is not the numeric Client ID",
  !/^\d+$/.test(email),
  /^\d+$/.test(email)
    ? "this is the Client ID; use client_email from the JSON instead"
    : "ok",
]);
checks.push([
  "GOOGLE_SA_CLIENT_EMAIL looks like a service account address",
  /^[a-z0-9-]+@[a-z0-9-]+\.iam\.gserviceaccount\.com$/.test(email),
  email.includes("@") ? `domain: ${email.split("@")[1]}` : "no @ found",
]);
checks.push([
  "GOOGLE_SA_CLIENT_EMAIL has no stray quotes or spaces",
  rawEmail === email && !/["'\s]/.test(email),
  rawEmail !== email ? "leading/trailing whitespace" : /["'\s]/.test(email) ? "contains quotes or spaces" : "ok",
]);

let keyOk = false;
let keyNote = "empty";
if (key) {
  try {
    const parsed = createPrivateKey(key);
    keyOk = parsed.asymmetricKeyType === "rsa";
    keyNote = `${parsed.asymmetricKeyType} key, ${key.split("\n").length} lines`;
  } catch (error) {
    keyNote = error instanceof Error ? error.message : "could not parse";
  }
}
checks.push(["GOOGLE_SA_PRIVATE_KEY parses as an RSA private key", keyOk, keyNote]);
checks.push([
  "GOOGLE_SA_PRIVATE_KEY has BEGIN/END PRIVATE KEY lines",
  key.startsWith("-----BEGIN PRIVATE KEY-----") && key.endsWith("-----END PRIVATE KEY-----"),
  "ok if parsing above passed",
]);

checks.push([
  "MAIL_SENDER is a millennia21.id mailbox",
  /^[^@\s]+@millennia21\.id$/.test(sender),
  sender || "empty",
]);
checks.push([
  "INQUIRY_NOTIFY_EMAILS has at least one address",
  recipients.length > 0,
  `${recipients.length} address(es)`,
]);

for (const [label, ok, note] of checks) {
  console.log(`${ok ? "OK  " : "FAIL"}  ${label}  —  ${note}`);
}
