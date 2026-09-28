import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { ResponseError } from "../../error/response-error";
import { GoogleAuth } from "../../lib/google-auth";
import { sessionCookieName } from "../../lib/session";
import { AuthService } from "../../services/auth-services";
import type { SessionVariables } from "../../types/hono-context";

const OAUTH_STATE_COOKIE = "mws_cms_google_oauth_state";

const RESPONSE_ERROR_CODES: Record<number, string> = {
  401: "google_auth_failed",
  403: "unauthorized",
  404: "not_registered",
};

function frontendOrigin(): string {
  return process.env.FRONTEND_ORIGIN ?? "http://localhost:7001";
}

function useSecureCookies(): boolean {
  const configured = process.env.COOKIE_SECURE ?? process.env.SESSION_COOKIE_SECURE;
  if (configured) return configured === "true";
  return frontendOrigin().startsWith("https://");
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: useSecureCookies(),
    sameSite: "Strict" as const,
    path: "/",
  };
}

function oauthStateCookieOptions() {
  return {
    httpOnly: true,
    secure: useSecureCookies(),
    sameSite: "Lax" as const,
    path: "/auth/google",
  };
}

export class LoginController {
  static async startGoogleLogin(c: Context) {
    const state = crypto.randomUUID();
    const authUrl = GoogleAuth.authUrl(state);
    console.info("[AUTH] Google login start", {
      frontendOrigin: frontendOrigin(),
      googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || "",
      authOrigin: new URL(authUrl).origin,
      secureCookies: useSecureCookies(),
    });

    setCookie(c, OAUTH_STATE_COOKIE, state, {
      ...oauthStateCookieOptions(),
      maxAge: 60 * 10,
    });

    return c.redirect(authUrl, 302);
  }

  static async loginWithGoogle(c: Context) {
    const { code } = await c.req.json<{ code?: string }>();
    if (!code) {
      throw new ResponseError(400, "Google auth code is required.");
    }

    const { token, user } = await AuthService.loginWithGoogle(code);
    console.info("[AUTH] Google token exchange success");

    setCookie(c, sessionCookieName(), token, {
      ...cookieOptions(),
      maxAge: 60 * 60 * 8,
    });

    console.info("[AUTH] Session created");
    console.info("[AUTH] Login success");
    return c.json({ data: user });
  }

  static async googleCallback(c: Context) {
    const code = c.req.query("code");
    const state = c.req.query("state");
    const expectedState = getCookie(c, OAUTH_STATE_COOKIE);
    console.info("[AUTH] OAuth callback received", {
      hasCode: Boolean(code),
      hasState: Boolean(state),
      hasExpectedState: Boolean(expectedState),
      frontendOrigin: frontendOrigin(),
    });

    deleteCookie(c, OAUTH_STATE_COOKIE, oauthStateCookieOptions());

    if (!code || !state || !expectedState || state !== expectedState) {
      console.warn("[AUTH] OAuth state invalid", {
        hasCode: Boolean(code),
        hasState: Boolean(state),
        hasExpectedState: Boolean(expectedState),
        stateMatches: Boolean(state && expectedState && state === expectedState),
      });
      console.warn("[AUTH] Login failed");
      return c.redirect(`${frontendOrigin()}/admin/login?error=google_state`, 302);
    }
    console.info("[AUTH] OAuth state valid");

    try {
      const { token } = await AuthService.loginWithGoogle(code);

      setCookie(c, sessionCookieName(), token, {
        ...cookieOptions(),
        maxAge: 60 * 60 * 8,
      });
      console.info("[AUTH] Session created");
      console.info("[AUTH] Login success");

      return c.redirect(`${frontendOrigin()}/admin`, 302);
    } catch (error) {
      console.warn("[AUTH] Login failed");
      console.error("CMS Google callback failed:", error);
      const errorCode =
        error instanceof ResponseError
          ? RESPONSE_ERROR_CODES[error.status]
          : undefined;

      return c.redirect(
        `${frontendOrigin()}/admin/login?error=${errorCode ?? "login_failed"}`,
        302,
      );
    }
  }

  static async me(c: Context<{ Variables: SessionVariables }>) {
    return c.json({ data: c.var.user });
  }

  static async logout(c: Context) {
    console.info("[AUTH] Logout");
    deleteCookie(c, sessionCookieName(), cookieOptions());

    return c.json({ data: "Logged out successfully" });
  }
}
