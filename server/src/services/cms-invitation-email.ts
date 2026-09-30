import type { MailMessage } from "../lib/mailer";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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

/**
 * The invitee does not register anywhere: their account already exists in
 * Central, so the email only tells them access was granted and where to sign
 * in with their MWS Google account.
 */
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
<div style="font-family: Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #241718; max-width: 520px;">
  <p>Halo,</p>
  <p>${escapeHtml(inviter)} memberi Anda akses <strong>${escapeHtml(input.roleLabel)}</strong> ke CMS Website Millennia World School.</p>
  <p>Masuk menggunakan akun Google MWS Anda (<strong>${escapeHtml(input.email)}</strong>):</p>
  <p>
    <a href="${escapeHtml(loginUrl)}" style="display: inline-block; background: #7e1518; color: #ffffff; padding: 10px 20px; text-decoration: none; font-weight: bold;">Masuk ke CMS</a>
  </p>
  <p style="color: #625759; font-size: 13px;">Tidak perlu mendaftar. Akun Anda sudah terhubung dengan data Central.${
    expiry ? ` ${escapeHtml(expiry)}` : ""
  }</p>
  <p style="color: #625759; font-size: 13px;">Jika Anda merasa tidak seharusnya menerima email ini, abaikan saja.</p>
</div>`.trim();

  return {
    to: input.email,
    subject: "Akses CMS Website Millennia World School",
    text,
    html,
  };
}
