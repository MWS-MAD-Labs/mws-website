import { afterEach, describe, expect, it } from "bun:test";
import { GoogleAuth } from "../lib/google-auth";
import { jsonResponse } from "./test-helpers";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_SECRET;
  delete process.env.GOOGLE_REDIRECT_URI;
});

describe("GoogleAuth.verifyCode", () => {
  it("builds the Google auth URL with the configured callback", () => {
    process.env.GOOGLE_CLIENT_ID = "client-id.test";
    process.env.GOOGLE_REDIRECT_URI = "http://localhost:5173/auth/google/callback";

    const url = new URL(GoogleAuth.authUrl("state-123"));

    expect(url.origin + url.pathname).toBe(
      "https://accounts.google.com/o/oauth2/v2/auth",
    );
    expect(url.searchParams.get("client_id")).toBe("client-id.test");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "http://localhost:5173/auth/google/callback",
    );
    expect(url.searchParams.get("state")).toBe("state-123");
  });

  it("exchanges a Google code and validates the returned ID token", async () => {
    process.env.GOOGLE_CLIENT_ID = "client-id.test";
    process.env.GOOGLE_CLIENT_SECRET = "client-secret.test";
    process.env.GOOGLE_REDIRECT_URI = "http://localhost:5173/auth/google/callback";
    const calls: string[] = [];

    global.fetch = (async (
      input: string | URL | Request,
      init?: RequestInit,
    ) => {
      const url = String(input);
      calls.push(url);
      if (url === "https://oauth2.googleapis.com/token") {
        expect(init?.method).toBe("POST");
        const body = String(init?.body);
        expect(body).toContain("client_id=client-id.test");
        expect(body).toContain("client_secret=client-secret.test");
        expect(body).toContain(
          "redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fauth%2Fgoogle%2Fcallback",
        );
        return jsonResponse(200, { id_token: "google-id-token" });
      }

      expect(url).toContain("https://oauth2.googleapis.com/tokeninfo");
      return jsonResponse(200, {
        aud: "client-id.test",
        email: "employee@millennia21.id",
        name: "Test Employee",
        sub: "google-sub-1",
        picture: "https://example.test/avatar.png",
        exp: Math.floor(Date.now() / 1000) + 60,
      });
    }) as unknown as typeof fetch;

    const payload = await GoogleAuth.verifyCode("google-code");

    expect(calls).toHaveLength(2);
    expect(payload).toEqual({
      email: "employee@millennia21.id",
      name: "Test Employee",
      google_id: "google-sub-1",
      avatar_url: "https://example.test/avatar.png",
    });
  });

  it("returns null when Google token validation has the wrong audience", async () => {
    process.env.GOOGLE_CLIENT_ID = "client-id.test";

    global.fetch = (async (input: string | URL | Request) => {
      const url = String(input);
      if (url === "https://oauth2.googleapis.com/token") {
        return jsonResponse(200, { id_token: "google-id-token" });
      }

      return jsonResponse(200, {
        aud: "different-client.test",
        email: "employee@millennia21.id",
        sub: "google-sub-1",
      });
    }) as unknown as typeof fetch;

    await expect(GoogleAuth.verifyCode("google-code")).resolves.toBeNull();
  });
});
