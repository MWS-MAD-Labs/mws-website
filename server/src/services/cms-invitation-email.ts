import { escapeHtml } from "../lib/email-html";
import type { MailMessage } from "../lib/mailer";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "Asia/Jakarta",
  }).format(value);
}

export function cmsLoginUrl() {
  const origin = (process.env.FRONTEND_ORIGIN ?? "http://localhost:7001").replace(/\/$/, "");
  return `${origin}/admin/login`;
}
export function cmsInvitationEmail(input: {
  email: string;
  roleLabel: string;
  inviterName?: string | null;
  expiresAt?: Date | null;
}): MailMessage {
  const loginUrl = cmsLoginUrl();
  const inviter = input.inviterName?.trim() || "Tim MAD Labs";
  const expiry = input.expiresAt
    ? `Undangan ini berlaku sampai ${formatDate(input.expiresAt)}.`
    : "";

  const text = [
    "Halo,",
    "",
    `${inviter} memberi Anda akses ${input.roleLabel} ke CMS Website Millennia World School.`,
    "",
    `Masuk menggunakan akun Google MWS Anda (${input.email}) di:`,
    loginUrl,
    "",
    "Tidak perlu mendaftar. Akun Anda sudah terhubung dengan data Central.",
    expiry,
    "",
    "Jika Anda merasa tidak seharusnya menerima email ini, abaikan saja.",
  ]
    .filter((line, index, lines) => line !== "" || lines[index - 1] !== "")
    .join("\n");

  const html = `
<div style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.7; color: #241718; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
  <p style="margin: 0 0 28px; font-size: 13px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; color: #7e1518;">Millennia World School</p>

  <p style="margin: 0 0 16px;">Halo,</p>
  <p style="margin: 0 0 16px;">${escapeHtml(inviter)} memberi Anda akses <strong>${escapeHtml(input.roleLabel)}</strong> ke CMS Website Millennia World School.</p>
  <p style="margin: 0 0 24px;">Masuk menggunakan akun Google MWS Anda (<strong>${escapeHtml(input.email)}</strong>).</p>

  <p style="margin: 0 0 28px;">
    <a href="${escapeHtml(loginUrl)}" style="display: inline-block; background: #7e1518; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold;">Masuk ke CMS</a>
  </p>

  <p style="margin: 0 0 8px; color: #625759; font-size: 13px;">Tidak perlu mendaftar. Akun Anda sudah terhubung dengan data Central.${
    expiry ? ` ${escapeHtml(expiry)}` : ""
  }</p>
  <p style="margin: 0; color: #625759; font-size: 13px;">Jika Anda merasa tidak seharusnya menerima email ini, abaikan saja.</p>
</div>`.trim();

  return {
    to: input.email,
    subject: "Akses CMS Website Millennia World School",
    text,
    html,
  };
}
