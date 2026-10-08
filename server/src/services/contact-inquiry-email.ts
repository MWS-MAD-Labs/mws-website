import type { ContactInquiry } from "@prisma/client";
import { escapeHtml } from "../lib/email-html";
import type { MailMessage } from "../lib/mailer";

export function inquiryNotifyRecipients() {
  return (process.env.INQUIRY_NOTIFY_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

export function cmsInquiriesUrl() {
  const origin = (process.env.FRONTEND_ORIGIN ?? "http://localhost:7001").replace(/\/$/, "");
  return `${origin}/admin/inquiries`;
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(value);
}

/**
 * Tells the school staff a new message arrived from the public Contact form.
 * Reply-To is the sender, so staff can answer straight from their inbox.
 */
export function contactInquiryNotificationEmail(input: {
  to: string[];
  inquiry: Pick<
    ContactInquiry,
    "name" | "email" | "subject" | "category" | "message" | "createdAt"
  >;
  categoryLabel?: string | null;
}): MailMessage {
  const { inquiry } = input;
  const inboxUrl = cmsInquiriesUrl();
  const category = input.categoryLabel || inquiry.category || "-";
  const received = formatDateTime(inquiry.createdAt);

  const text = [
    "Ada pesan baru dari form Contact website Millennia World School.",
    "",
    `Nama     : ${inquiry.name}`,
    `Email    : ${inquiry.email}`,
    `Kategori : ${category}`,
    `Subjek   : ${inquiry.subject}`,
    `Diterima : ${received}`,
    "",
    "Pesan:",
    inquiry.message,
    "",
    `Balas email ini untuk menjawab langsung ke ${inquiry.email}.`,
    `Kelola pesan di CMS: ${inboxUrl}`,
  ].join("\n");

  const row = (label: string, value: string) =>
    `<tr><td style="padding: 4px 12px 4px 0; color: #625759; white-space: nowrap; vertical-align: top;">${label}</td><td style="padding: 4px 0;">${escapeHtml(value)}</td></tr>`;

  const html = `
<div style="font-family: Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #241718; max-width: 560px;">
  <p>Ada pesan baru dari form Contact website Millennia World School.</p>
  <table style="border-collapse: collapse; font-size: 14px;">
    ${row("Nama", inquiry.name)}
    ${row("Email", inquiry.email)}
    ${row("Kategori", category)}
    ${row("Subjek", inquiry.subject)}
    ${row("Diterima", received)}
  </table>
  <p style="margin-top: 16px; color: #625759; font-size: 13px;">Pesan:</p>
  <div style="white-space: pre-wrap; background: #faf8f5; border-left: 3px solid #7e1518; padding: 12px 16px;">${escapeHtml(inquiry.message)}</div>
  <p>
    <a href="${escapeHtml(inboxUrl)}" style="display: inline-block; background: #7e1518; color: #ffffff; padding: 10px 20px; text-decoration: none; font-weight: bold;">Buka di CMS</a>
  </p>
  <p style="color: #625759; font-size: 13px;">Balas email ini untuk menjawab langsung ke ${escapeHtml(inquiry.email)}.</p>
</div>`.trim();

  return {
    to: input.to.join(", "),
    replyTo: inquiry.email,
    subject: `Pesan baru dari ${inquiry.name}: ${inquiry.subject}`,
    text,
    html,
  };
}
