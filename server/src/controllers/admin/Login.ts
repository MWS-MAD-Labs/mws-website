import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { ResponseError } from "../../error/response-error";
import { GoogleAuth } from "../../lib/google-auth";
import { sessionCookieName, verifySession } from "../../lib/session";
import { AuthService } from "../../services/auth-services";
import type { SessionVariables } from "../../types/hono-context";

const OAUTH_STATE_COOKIE = "mws_cms_google_oauth_state";

const RESPONSE_ERROR_CODES: Record<number, string> = {
  401: "google_auth_failed",
  403: "unauthorized",
  404: "not_registered",
};

function frontendOrigin(): string {
  return process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict" as const,
    path: "/",
  };
}

function oauthStateCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax" as const,
    path: "/auth/google",
  };
}

export class LoginController {
  static async startGoogleLogin(c: Context) {
    const state = crypto.randomUUID();

    setCookie(c, OAUTH_STATE_COOKIE, state, {
      ...oauthStateCookieOptions(),
      maxAge: 60 * 10,
    });

    return c.redirect(GoogleAuth.authUrl(state), 302);
  }

  static async loginWithGoogle(c: Context) {
    const { code } = await c.req.json<{ code?: string }>();
    if (!code) {
      throw new ResponseError(400, "Google auth code is required.");
    }

    const { token, user } = await AuthService.loginWithGoogle(code);

    setCookie(c, sessionCookieName(), token, {
      ...cookieOptions(),
      maxAge: 60 * 60 * 8,
    });

    return c.json({ data: user });
  }

  static async googleCallback(c: Context) {
    const code = c.req.query("code");
    const state = c.req.query("state");
    const expectedState = getCookie(c, OAUTH_STATE_COOKIE);

    deleteCookie(c, OAUTH_STATE_COOKIE, oauthStateCookieOptions());

    if (!code || !state || !expectedState || state !== expectedState) {
      return c.redirect(`${frontendOrigin()}/admin/login?error=google_state`, 302);
    }

    try {
      const { token, user } = await AuthService.loginWithGoogle(code);

      setCookie(c, sessionCookieName(), token, {
        ...cookieOptions(),
        maxAge: 60 * 60 * 8,
      });

      return c.redirect(`${frontendOrigin()}/admin`, 302);
    } catch (error) {
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
    const token = getCookie(c, sessionCookieName());
    const user = token ? (await verifySession(token))?.user : null;

    deleteCookie(c, sessionCookieName(), cookieOptions());
    console.log("CMS user logged out:", user?.email ?? "anonymous");

    return c.json({ data: "Logged out successfully" });
  }
}
