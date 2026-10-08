import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import type { ContactInquiry } from "@prisma/client";
import { JWT } from "google-auth-library";
import nodemailer from "nodemailer";
import * as mailer from "../lib/mailer";
import { ContactInquiryService } from "../services/contact-inquiry-service";
import { ContactPageService, defaultContactPageContent } from "../services/contact-page-service";

const ENV_KEYS = [
  "GOOGLE_SA_CLIENT_EMAIL",
  "GOOGLE_SA_PRIVATE_KEY",
  "MAIL_SENDER",
  "MAIL_SENDER_NAME",
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASS",
  "INQUIRY_NOTIFY_EMAILS",
  "FRONTEND_ORIGIN",
  "MAIL_TRANSPORT",
  "SMTP_PORT",
  "SMTP_FROM",
];
const originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

// Bun loads server/.env into tests; start every test without real credentials
// so nothing here can reach Google.
beforeEach(() => {
  for (const key of ENV_KEYS) delete process.env[key];
  mailer.resetMailerForTest();
});

afterEach(() => {
  mock.restore();
  mailer.resetMailerForTest();
  for (const key of ENV_KEYS) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

function useServiceAccount() {
  process.env.GOOGLE_SA_CLIENT_EMAIL = "website-mailer@mws.iam.gserviceaccount.com";
  // As written in .env: one line with literal "\n" sequences.
  process.env.GOOGLE_SA_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n";
  process.env.MAIL_SENDER = "noreply@millennia21.id";
}

function decodeRaw(raw: string) {
  return Buffer.from(raw, "base64url").toString("utf8");
}

const message = {
  to: "staff@millennia21.id",
  subject: "Pesan baru",
  text: "Halo",
  html: "<p>Halo</p>",
  replyTo: "parent@example.com",
};

describe("sendMail with a Google service account", () => {
  it("sends through the Gmail API as MAIL_SENDER with only the gmail.send scope", async () => {
    useServiceAccount();
    let client: JWT | undefined;
    let request: { url?: unknown; method?: unknown; data?: unknown } | undefined;
    spyOn(JWT.prototype, "request").mockImplementation(function (this: JWT, opts) {
      client = this;
      request = opts as typeof request;
      return Promise.resolve({ data: { id: "msg-1" } }) as never;
    });

    const result = await mailer.sendMail(message);

    expect(result).toEqual({ sent: true });
    expect(client?.email).toBe("website-mailer@mws.iam.gserviceaccount.com");
    expect(client?.subject).toBe("noreply@millennia21.id");
    expect(client?.scopes).toEqual(["https://www.googleapis.com/auth/gmail.send"]);
    expect(client?.key).toBe("-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----");
    expect(request?.url).toBe("https://gmail.googleapis.com/gmail/v1/users/me/messages/send");
    expect(request?.method).toBe("POST");

    const mime = decodeRaw((request?.data as { raw: string }).raw);
    expect(mime).toContain("<noreply@millennia21.id>");
    expect(mime).toContain("To: staff@millennia21.id");
    expect(mime).toContain("Reply-To: parent@example.com");
    expect(mime).toContain(`Subject: =?UTF-8?B?${Buffer.from("Pesan baru").toString("base64")}?=`);
  });

  it("prefers the service account over SMTP when both are set", async () => {
    useServiceAccount();
    process.env.SMTP_HOST = "smtp.gmail.com";
    process.env.SMTP_USER = "noreply@millennia21.id";
    process.env.SMTP_PASS = "app-password";
    const request = spyOn(JWT.prototype, "request").mockResolvedValue({ data: {} } as never);

    await mailer.sendMail(message);

    expect(request).toHaveBeenCalledTimes(1);
  });

  it("reports a Gmail failure without throwing", async () => {
    useServiceAccount();
    spyOn(console, "error").mockImplementation(() => undefined);
    spyOn(JWT.prototype, "request").mockRejectedValue(new Error("unauthorized_client") as never);

    const result = await mailer.sendMail(message);

    expect(result).toEqual({ sent: false, reason: "unauthorized_client" });
  });

  it("does not let header values inject extra headers", () => {
    const raw = mailer.buildRawMessage(
      { email: "noreply@millennia21.id", name: "MWS" },
      { ...message, to: "staff@millennia21.id\r\nBcc: attacker@example.com" },
    );

    expect(decodeRaw(raw)).not.toContain("\r\nBcc:");
  });
});

function useSmtp() {
  process.env.SMTP_HOST = "smtp.gmail.com";
  process.env.SMTP_USER = "staff@millennia21.id";
  process.env.SMTP_PASS = "app-password";
}

describe("MAIL_TRANSPORT", () => {
  it("smtp sends through SMTP even when the service account is set", async () => {
    useServiceAccount();
    useSmtp();
    process.env.MAIL_TRANSPORT = "smtp";
    const gmailRequest = spyOn(JWT.prototype, "request");
    const smtpSend = mock(async () => ({}));
    const createTransport = spyOn(nodemailer, "createTransport").mockReturnValue({
      sendMail: smtpSend,
    } as never);

    const result = await mailer.sendMail(message);

    expect(result).toEqual({ sent: true });
    expect(createTransport).toHaveBeenCalledTimes(1);
    expect(smtpSend).toHaveBeenCalledTimes(1);
    expect(gmailRequest).not.toHaveBeenCalled();
    expect(mailer.isMailerConfigured()).toBe(true);
  });

  it("smtp without SMTP settings explains what is missing", async () => {
    useServiceAccount();
    process.env.MAIL_TRANSPORT = "smtp";
    const gmailRequest = spyOn(JWT.prototype, "request");

    const result = await mailer.sendMail(message);

    expect(result).toEqual({
      sent: false,
      reason: "MAIL_TRANSPORT=smtp but SMTP_HOST, SMTP_USER or SMTP_PASS is not set.",
    });
    expect(gmailRequest).not.toHaveBeenCalled();
    expect(mailer.isMailerConfigured()).toBe(false);
  });

  it("gmail never falls back to SMTP", async () => {
    useSmtp();
    process.env.MAIL_TRANSPORT = "gmail";
    const createTransport = spyOn(nodemailer, "createTransport");

    const result = await mailer.sendMail(message);

    expect(result.sent).toBe(false);
    expect(createTransport).not.toHaveBeenCalled();
  });
});

function inquiry(overrides: Partial<ContactInquiry> = {}): ContactInquiry {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Parent",
    email: "parent@example.com",
    subject: "Admission question",
    category: "admissions",
    message: "When does enrollment open?\nThank you.",
    status: "NEW",
    source: "contact-page",
    ipAddress: null,
    userAgent: null,
    createdAt: new Date("2026-10-07T03:00:00.000Z"),
    updatedAt: new Date("2026-10-07T03:00:00.000Z"),
    ...overrides,
  };
}

describe("ContactInquiryService.notifyNewInquiry", () => {
  it("skips when INQUIRY_NOTIFY_EMAILS is not set", async () => {
    delete process.env.INQUIRY_NOTIFY_EMAILS;
    const send = spyOn(mailer, "sendMail");

    const result = await ContactInquiryService.notifyNewInquiry(inquiry());

    expect(result).toEqual({ sent: false, reason: "INQUIRY_NOTIFY_EMAILS is not set." });
    expect(send).not.toHaveBeenCalled();
  });

  it("emails every recipient with the category label and a reply-to the sender", async () => {
    process.env.INQUIRY_NOTIFY_EMAILS = " admission@millennia21.id , info@millennia21.id ";
    process.env.FRONTEND_ORIGIN = "https://beta.millenniaws.sch.id";
    spyOn(ContactPageService, "getPublic").mockResolvedValue({
      content: defaultContactPageContent,
    } as Awaited<ReturnType<typeof ContactPageService.getPublic>>);
    const send = spyOn(mailer, "sendMail").mockResolvedValue({ sent: true });

    await ContactInquiryService.notifyNewInquiry(inquiry());

    const sent = send.mock.calls[0]?.[0];
    expect(sent?.to).toBe("admission@millennia21.id, info@millennia21.id");
    expect(sent?.replyTo).toBe("parent@example.com");
    expect(sent?.subject).toBe("Pesan baru dari Parent: Admission question");
    expect(sent?.text).toContain("Admissions & Tours");
    expect(sent?.html).toContain("https://beta.millenniaws.sch.id/admin/inquiries");
  });

  it("escapes visitor input in the HTML body", async () => {
    process.env.INQUIRY_NOTIFY_EMAILS = "admission@millennia21.id";
    spyOn(ContactPageService, "getPublic").mockRejectedValue(new Error("db down"));
    const send = spyOn(mailer, "sendMail").mockResolvedValue({ sent: true });

    await ContactInquiryService.notifyNewInquiry(
      inquiry({ name: "<script>alert(1)</script>", category: "admissions" }),
    );

    const sent = send.mock.calls[0]?.[0];
    expect(sent?.html).not.toContain("<script>");
    expect(sent?.html).toContain("&lt;script&gt;");
    // Falls back to the stored value when the category label cannot be read.
    expect(sent?.text).toContain("Kategori : admissions");
  });
});

describe("ContactInquiryService.submit", () => {
  it("saves the inquiry and triggers the notification without waiting for it", async () => {
    const saved = inquiry();
    const previousPrisma = globalThis.__mwsWebsitePrisma;
    globalThis.__mwsWebsitePrisma = {
      contactInquiry: { create: async () => saved },
    } as never;
    let release: () => void = () => undefined;
    const notify = spyOn(ContactInquiryService, "notifyNewInquiry").mockImplementation(
      () => new Promise((resolve) => (release = () => resolve({ sent: true }))),
    );

    try {
      const result = await ContactInquiryService.submit(
        {
          name: "Parent",
          email: "parent@example.com",
          subject: "Admission question",
          category: "admissions",
          message: "When does enrollment open?",
        },
        { ipAddress: "10.0.0.9" },
      );

      expect(result.id).toBe(saved.id);
      expect(notify).toHaveBeenCalledWith(saved);
    } finally {
      release();
      globalThis.__mwsWebsitePrisma = previousPrisma;
    }
  });
});
