import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { ResponseError } from "../error/response-error";
import { sessionCookieName, verifySession } from "../lib/session";
import type { SessionVariables } from "../types/hono-context";

export async function sessionAuthMiddleware(
  c: Context<{ Variables: SessionVariables }>,
  next: Next,
) {
  const token = getCookie(c, sessionCookieName());
  if (!token) {
    throw new ResponseError(401, "Not signed in.");
  }

  const session = await verifySession(token);
  if (!session) {
    throw new ResponseError(401, "Session expired or invalid.");
  }

  c.set("user", session.user);
  await next();
}
