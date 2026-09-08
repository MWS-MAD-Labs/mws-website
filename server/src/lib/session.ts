import { sign, verify } from "hono/jwt";
import type { CentralUser } from "../types/central-types";

const SESSION_EXP_SECONDS = 60 * 60 * 8;

export type SessionPayload = {
  user: CentralUser;
  exp: number;
};

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }
  return secret;
}

export function sessionCookieName(): string {
  return process.env.SESSION_COOKIE_NAME || "mws_cms_session";
}

export async function signSession(user: CentralUser): Promise<string> {
  const payload: SessionPayload = {
    user,
    exp: Math.floor(Date.now() / 1000) + SESSION_EXP_SECONDS,
  };
  return sign(payload, jwtSecret(), "HS256");
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const payload = await verify(token, jwtSecret(), "HS256");
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
