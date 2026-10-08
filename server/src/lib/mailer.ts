import type { JWT } from "google-auth-library";
import {
  createServiceAccountClient,
  serviceAccountCredentials,
} from "./google-service-account";
import nodemailer, { type Transporter } from "nodemailer";

export type MailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
  /** Where replies go, e.g. the parent who sent an inquiry. */
  replyTo?: string;
};

export type MailResult =
  | { sent: true }
  | { sent: false; reason: string };

const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";
const GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

let transporter: Transporter | null = null;
let gmailClient: JWT | null = null;

// ---------- Google service account (Gmail API) ----------

function gmailConfig() {
  const credentials = serviceAccountCredentials();
  const sender = process.env.MAIL_SENDER?.trim();

  if (!credentials || !sender) return null;

  return {
    credentials,
    sender,
    senderName: process.env.MAIL_SENDER_NAME?.trim() || "Millennia World School",
  };
}

type GmailConfig = NonNullable<ReturnType<typeof gmailConfig>>;

function getGmailClient(config: GmailConfig) {
  // Only gmail.send, impersonating MAIL_SENDER (a service account has no mailbox).
  gmailClient ??= createServiceAccountClient(config.credentials, {
    scopes: [GMAIL_SEND_SCOPE],
    subject: config.sender,
  });
  return gmailClient;
}

/** Strips line breaks so a value cannot inject extra email headers. */
function headerValue(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function encodedWord(value: string) {
  return `=?UTF-8?B?${Buffer.from(headerValue(value)).toString("base64")}?=`;
}

function base64Body(value: string) {
  return (
    Buffer.from(value)
      .toString("base64")
      .match(/.{1,76}/g)
      ?.join("\r\n") ?? ""
  );
}

/** Builds the RFC 2822 message Gmail's `messages.send` expects, base64url encoded. */
export function buildRawMessage(from: { email: string; name: string }, message: MailMessage) {
  const boundary = `mws-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const mime = [
    `From: ${encodedWord(from.name)} <${headerValue(from.email)}>`,
    `To: ${headerValue(message.to)}`,
    ...(message.replyTo ? [`Reply-To: ${headerValue(message.replyTo)}`] : []),
    `Subject: ${encodedWord(message.subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    base64Body(message.text),
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    base64Body(message.html),
    `--${boundary}--`,
    "",
  ].join("\r\n");

  return Buffer.from(mime).toString("base64url");
}

async function sendWithGmail(config: GmailConfig, message: MailMessage): Promise<MailResult> {
  try {
    await getGmailClient(config).request({
      url: GMAIL_SEND_URL,
      method: "POST",
      data: { raw: buildRawMessage({ email: config.sender, name: config.senderName }, message) },
    });
    return { sent: true };
  } catch (error) {
    console.error("[MAIL] Gmail API send failed:", error);
    return {
      sent: false,
      reason: error instanceof Error ? error.message : "Email could not be sent.",
    };
  }
}

// ---------- SMTP (fallback) ----------

function smtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT || 587);

  if (!host || !user || !pass) return null;

  return {
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    from: process.env.SMTP_FROM?.trim() || user,
  };
}

async function sendWithSmtp(
  config: NonNullable<ReturnType<typeof smtpConfig>>,
  message: MailMessage,
): Promise<MailResult> {
  try {
    transporter ??= nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });

    await transporter.sendMail({ from: config.from, ...message });
    return { sent: true };
  } catch (error) {
    console.error("[MAIL] Failed to send email:", error);
    return {
      sent: false,
      reason: error instanceof Error ? error.message : "Email could not be sent.",
    };
  }
}

// ---------- Public API ----------

type MailTransport = "gmail" | "smtp" | "auto";

/**
 * MAIL_TRANSPORT picks how email is sent: "smtp" or "gmail" forces one,
 * empty/"auto" uses the service account when it is set, otherwise SMTP.
 * Forcing "smtp" keeps GOOGLE_SA_* in .env for other uses while Gmail
 * delegation is not approved yet.
 */
function mailTransport(): MailTransport {
  const value = process.env.MAIL_TRANSPORT?.trim().toLowerCase();
  return value === "gmail" || value === "smtp" ? value : "auto";
}

export function isMailerConfigured() {
  const transport = mailTransport();
  if (transport === "smtp") return smtpConfig() !== null;
  if (transport === "gmail") return gmailConfig() !== null;
  return gmailConfig() !== null || smtpConfig() !== null;
}

export async function sendMail(message: MailMessage): Promise<MailResult> {
  const transport = mailTransport();

  if (transport !== "smtp") {
    const gmail = gmailConfig();
    if (gmail) return sendWithGmail(gmail, message);
    if (transport === "gmail") {
      return { sent: false, reason: "MAIL_TRANSPORT=gmail but GOOGLE_SA_* or MAIL_SENDER is not set." };
    }
  }

  const smtp = smtpConfig();
  if (smtp) return sendWithSmtp(smtp, message);

  return {
    sent: false,
    reason:
      transport === "smtp"
        ? "MAIL_TRANSPORT=smtp but SMTP_HOST, SMTP_USER or SMTP_PASS is not set."
        : "Email is not configured.",
  };
}

export function resetMailerForTest() {
  transporter = null;
  gmailClient = null;
}
