import type { GooglePayload } from "../types/google-types";

type GoogleTokenResponse = {
  id_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleTokenPayload = {
  aud?: string;
  email?: string;
  name?: string;
  sub?: string;
  picture?: string;
  exp?: number;
};

type GoogleTokenInfoResponse = GoogleTokenPayload & {
  error?: string;
  error_description?: string;
};

function googleClientId(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured.");
  }
  return clientId;
}

function googleRedirectUri(): string {
  return process.env.GOOGLE_REDIRECT_URI || "";
}

async function exchangeCodeForIdToken(code: string): Promise<string | null> {
  const body = new URLSearchParams({
    code,
    client_id: googleClientId(),
    grant_type: "authorization_code",
  });

  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = googleRedirectUri();
  if (clientSecret) body.set("client_secret", clientSecret);
  if (redirectUri) body.set("redirect_uri", redirectUri);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    console.error("Google code exchange failed:", res.status, await res.text());
    return null;
  }

  const token = (await res.json()) as GoogleTokenResponse;
  return token.id_token || null;
}

async function verifyIdToken(idToken: string): Promise<GoogleTokenPayload | null> {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
  );

  if (!res.ok) {
    console.error("Google ID token validation failed:", res.status, await res.text());
    return null;
  }

  return (await res.json()) as GoogleTokenInfoResponse;
}

function payloadFromGoogleToken(payload: GoogleTokenPayload | null): GooglePayload | null {
  if (!payload?.email || !payload.sub) return null;
  if (payload.aud !== googleClientId()) return null;
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

  return {
    email: payload.email,
    name: payload.name || payload.email.split("@")[0] || payload.email,
    google_id: payload.sub,
    avatar_url: payload.picture,
  };
}

export class GoogleAuth {
  static authUrl(state: string): string {
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", googleClientId());
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    url.searchParams.set("prompt", "select_account");
    const redirectUri = googleRedirectUri();
    if (redirectUri) url.searchParams.set("redirect_uri", redirectUri);
    return url.toString();
  }

  static async verifyCode(code: string): Promise<GooglePayload | null> {
    try {
      const idToken = await exchangeCodeForIdToken(code);
      if (!idToken) return null;
      return payloadFromGoogleToken(await verifyIdToken(idToken));
    } catch (error) {
      console.error("Google code verification failed:", error);
      return null;
    }
  }
}
