import { afterEach, beforeAll, describe, expect, it, mock, spyOn } from "bun:test";
import { AuthService } from "../services/auth-services";
import { GoogleAuth } from "../lib/google-auth";
import * as centralClient from "../lib/central-client";
import { verifySession } from "../lib/session";
import { testUser } from "./test-helpers";
import type { GooglePayload } from "../types/google-types";

const googlePayload: GooglePayload = {
  email: "employee@millennia21.id",
  name: "Test Employee",
  google_id: "google-sub-1",
};

beforeAll(() => {
  process.env.JWT_SECRET = "test-jwt-secret-for-bun-test";
});

afterEach(() => {
  mock.restore();
  process.env.ALLOWED_DOMAIN = "millennia21.id";
});

describe("AuthService.loginWithGoogle", () => {
  it("rejects when Google cannot verify the auth code", async () => {
    spyOn(GoogleAuth, "verifyCode").mockResolvedValue(null);

    await expect(AuthService.loginWithGoogle("bad-code")).rejects.toThrow(
      "Google sign-in failed.",
    );
  });

  it("rejects an email outside ALLOWED_DOMAIN before calling Central", async () => {
    process.env.ALLOWED_DOMAIN = "millennia21.id";
    spyOn(GoogleAuth, "verifyCode").mockResolvedValue({
      ...googlePayload,
      email: "someone@gmail.com",
    });
    const centralSpy = spyOn(centralClient, "resolveCentralIdentity");

    await expect(AuthService.loginWithGoogle("code")).rejects.toThrow(
      "Only @millennia21.id accounts can sign in.",
    );
    expect(centralSpy).not.toHaveBeenCalled();
  });

  it("rejects when Central has no matching identity", async () => {
    spyOn(GoogleAuth, "verifyCode").mockResolvedValue(googlePayload);
    spyOn(centralClient, "resolveCentralIdentity").mockResolvedValue(null);

    await expect(AuthService.loginWithGoogle("code")).rejects.toThrow(
      "This account isn't registered in the Central database yet.",
    );
  });

  it("signs a usable session token for a Central identity", async () => {
    spyOn(GoogleAuth, "verifyCode").mockResolvedValue(googlePayload);
    spyOn(centralClient, "resolveCentralIdentity").mockResolvedValue(testUser);

    const { token, user } = await AuthService.loginWithGoogle("code");
    expect(user).toEqual(testUser);
    expect((await verifySession(token))?.user).toEqual(testUser);
  });
});
