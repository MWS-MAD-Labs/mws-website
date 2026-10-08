import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import type { CmsRole } from "@prisma/client";
import * as mailer from "../lib/mailer";
import {
  CmsUserRepository,
  type CmsInvitationWithRelations,
} from "../repositories/cms-user-repository";
import { cmsInvitationEmail } from "../services/cms-invitation-email";
import { CmsAuthService } from "../services/cms-auth-service";

const originalFrontendOrigin = process.env.FRONTEND_ORIGIN;
const MAIL_ENV_KEYS = [
  "GOOGLE_SA_CLIENT_EMAIL",
  "GOOGLE_SA_PRIVATE_KEY",
  "MAIL_SENDER",
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASS",
];
const originalMailEnv = Object.fromEntries(MAIL_ENV_KEYS.map((key) => [key, process.env[key]]));

// Bun loads server/.env into tests; never let these tests use real credentials.
beforeEach(() => {
  for (const key of MAIL_ENV_KEYS) delete process.env[key];
  mailer.resetMailerForTest();
});

afterEach(() => {
  mock.restore();
  process.env.FRONTEND_ORIGIN = originalFrontendOrigin;
  for (const key of MAIL_ENV_KEYS) {
    if (originalMailEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalMailEnv[key];
  }
  mailer.resetMailerForTest();
});

const now = new Date("2026-01-01T00:00:00.000Z");
const adminRole: CmsRole = {
  id: "role-admin",
  name: "ADMIN",
  description: "Admin",
  createdAt: now,
  updatedAt: now,
};

function invitation(): CmsInvitationWithRelations {
  return {
    id: "00000000-0000-4000-8000-000000000010",
    email: "teacher@millennia21.id",
    centralUserId: null,
    name: null,
    unitId: null,
    cmsRoleId: adminRole.id,
    status: "PENDING",
    invitedById: "cms-user-1",
    acceptedUserId: null,
    expiresAt: null,
    acceptedAt: null,
    createdAt: now,
    updatedAt: now,
    role: adminRole,
    invitedBy: null,
    acceptedUser: null,
  };
}

describe("cmsInvitationEmail", () => {
  it("links to the CMS login on the configured frontend and escapes names", () => {
    process.env.FRONTEND_ORIGIN = "https://beta.millenniaws.sch.id/";

    const message = cmsInvitationEmail({
      email: "teacher@millennia21.id",
      roleLabel: "Admin",
      inviterName: "<b>Asror</b>",
    });

    expect(message.to).toBe("teacher@millennia21.id");
    expect(message.text).toContain("https://beta.millenniaws.sch.id/admin/login");
    expect(message.html).toContain('href="https://beta.millenniaws.sch.id/admin/login"');
    expect(message.html).toContain("&lt;b&gt;Asror&lt;/b&gt;");
    expect(message.html).not.toContain("<b>Asror</b>");
  });
});

describe("sendMail", () => {
  it("skips sending when no email transport is configured", async () => {
    const result = await mailer.sendMail({
      to: "teacher@millennia21.id",
      subject: "x",
      text: "x",
      html: "x",
    });

    expect(result).toEqual({ sent: false, reason: "Email is not configured." });
  });
});

describe("CmsAuthService.inviteAdmin", () => {
  it("creates the invitation and reports the email result", async () => {
    spyOn(CmsUserRepository, "findRoleByName").mockResolvedValue(adminRole);
    const createSpy = spyOn(CmsUserRepository, "createInvitation").mockResolvedValue(
      invitation(),
    );
    const sendSpy = spyOn(mailer, "sendMail").mockResolvedValue({ sent: true });

    const result = await CmsAuthService.inviteAdmin(
      { email: "Teacher@Millennia21.id" },
      { id: "cms-user-1", name: "Asror" },
    );

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({ email: "teacher@millennia21.id", invitedById: "cms-user-1" }),
    );
    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({ to: "teacher@millennia21.id" }),
    );
    expect(result.notification).toEqual({ sent: true });
    expect(result.loginUrl).toEndWith("/admin/login");
  });

  it("resends the email for a pending invitation", async () => {
    spyOn(CmsUserRepository, "findInvitationById").mockResolvedValue(invitation());
    const sendSpy = spyOn(mailer, "sendMail").mockResolvedValue({ sent: true });

    const result = await CmsAuthService.resendInvitation(invitation().id, {
      id: "cms-user-1",
      name: "Asror",
    });

    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({ to: "teacher@millennia21.id" }),
    );
    expect(result.notification).toEqual({ sent: true });
  });

  it("refuses to resend revoked or expired invitations", async () => {
    const sendSpy = spyOn(mailer, "sendMail");
    const findSpy = spyOn(CmsUserRepository, "findInvitationById");

    findSpy.mockResolvedValue({ ...invitation(), status: "REVOKED" });
    await expect(CmsAuthService.resendInvitation(invitation().id)).rejects.toThrow(
      "Only pending invitations can be resent.",
    );

    findSpy.mockResolvedValue({ ...invitation(), expiresAt: new Date("2020-01-01") });
    await expect(CmsAuthService.resendInvitation(invitation().id)).rejects.toThrow(
      "This invitation has expired.",
    );

    await expect(CmsAuthService.resendInvitation("not-a-uuid")).rejects.toThrow(
      "Invitation not found.",
    );
    expect(sendSpy).not.toHaveBeenCalled();
  });

  it("keeps the invitation when the email fails", async () => {
    spyOn(CmsUserRepository, "findRoleByName").mockResolvedValue(adminRole);
    spyOn(CmsUserRepository, "createInvitation").mockResolvedValue(invitation());
    spyOn(mailer, "sendMail").mockResolvedValue({ sent: false, reason: "SMTP down" });

    const result = await CmsAuthService.inviteAdmin(
      { email: "teacher@millennia21.id" },
      { id: "cms-user-1" },
    );

    expect(result.status).toBe("PENDING");
    expect(result.notification).toEqual({ sent: false, reason: "SMTP down" });
  });
});
