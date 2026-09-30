import nodemailer, { type Transporter } from "nodemailer";

export type MailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export type MailResult =
  | { sent: true }
  | { sent: false; reason: string };

let transporter: Transporter | null = null;

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

export function isMailerConfigured() {
  return smtpConfig() !== null;
}

/**
 * Sends one email through the shared MWS SMTP account (the same SMTP_* setup
 * the other MWS apps use). Never throws: callers decide what a failed
 * notification means for their own flow.
 */
export async function sendMail(message: MailMessage): Promise<MailResult> {
  const config = smtpConfig();
  if (!config) {
    return { sent: false, reason: "SMTP is not configured." };
  }

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

export function resetMailerForTest() {
  transporter = null;
}
