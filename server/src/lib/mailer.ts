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

/** The Workspace mailbox the service account sends as (GMAIL_SENDER_EMAIL, or legacy MAIL_SENDER). */
export function gmailSenderEmail() {
  return process.env.GMAIL_SENDER_EMAIL?.trim() || process.env.MAIL_SENDER?.trim() || null;
}

function gmailConfig() {
  const credentials = serviceAccountCredentials();
  const sender = gmailSenderEmail();

  if (!credentials || !sender) return null;

  return {
    credentials,
    sender,
    senderName:
      process.env.GMAIL_SENDER_NAME?.trim() ||
      process.env.MAIL_SENDER_NAME?.trim() ||
      "Millennia World School",
  };
}

type GmailConfig = NonNullable<ReturnType<typeof gmailConfig>>;

function getGmailClient(config: GmailConfig) {
  // Only gmail.send, impersonating the sender (a service account has no mailbox).
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
 * EMAIL_PROVIDER (or the older MAIL_TRANSPORT) picks how email is sent:
 * "smtp" and "gmail" use only that transport; an empty/"auto" setting tries
 * Gmail first and falls back to SMTP if Gmail is unavailable.
 */
function mailTransport(): MailTransport {
  const value = (process.env.EMAIL_PROVIDER?.trim() || process.env.MAIL_TRANSPORT?.trim() || "")
    .toLowerCase();
  return value === "gmail" || value === "smtp" ? value : "auto";
}

function transportSettingName() {
  return process.env.EMAIL_PROVIDER?.trim() ? "EMAIL_PROVIDER" : "MAIL_TRANSPORT";
}

export function isMailerConfigured() {
  const transport = mailTransport();
  if (transport === "smtp") return smtpConfig() !== null;
  if (transport === "gmail") return gmailConfig() !== null;
  return gmailConfig() !== null || smtpConfig() !== null;
}

export async function sendMail(message: MailMessage): Promise<MailResult> {
  const transport = mailTransport();

  if (transport === "smtp") {
    const smtp = smtpConfig();
    if (smtp) return sendWithSmtp(smtp, message);
    return {
      sent: false,
      reason: `${transportSettingName()}=smtp but SMTP_HOST, SMTP_USER or SMTP_PASS is not set.`,
    };
  }

  const gmail = gmailConfig();
  if (transport === "gmail") {
    if (!gmail) {
      return {
        sent: false,
        reason: `${transportSettingName()}=gmail but service account credentials or GMAIL_SENDER_EMAIL / MAIL_SENDER are not set.`,
      };
    }
    return sendWithGmail(gmail, message);
  }

  let gmailFailure: string | null = null;

  if (gmail) {
    const result = await sendWithGmail(gmail, message);
    if (result.sent) return result;
    gmailFailure = result.reason;
  }

  const smtp = smtpConfig();
  if (smtp) {
    if (gmailFailure) {
      console.warn(`[MAIL] Gmail API not used (${gmailFailure}); sending through SMTP instead.`);
    }
    return sendWithSmtp(smtp, message);
  }

  if (gmailFailure) return { sent: false, reason: gmailFailure };
  return { sent: false, reason: "Email is not configured." };
}

export function resetMailerForTest() {
  transporter = null;
  gmailClient = null;
}
