import { sign, verify } from "hono/jwt";
import { ResponseError } from "../error/response-error";
import { getPrisma } from "./prisma";
import type { CmsSessionUser } from "../types/cms-auth-types";

const SESSION_EXP_SECONDS = 60 * 60 * 8;

export type SessionPayload = {
  user: CmsSessionUser;
  jti: string;
  exp: number;
};

export type SessionRevocationStore = {
  isRevoked(jti: string): Promise<boolean>;
  revoke(jti: string, expiresAt: Date): Promise<void>;
};

// Revoked sessions live in the database so a logout survives restarts and
// applies to every backend container.
const databaseRevocationStore: SessionRevocationStore = {
  async isRevoked(jti) {
    const row = await getPrisma().cmsRevokedSession.findUnique({
      where: { jti },
      select: { jti: true },
    });
    return Boolean(row);
  },
  async revoke(jti, expiresAt) {
    const prisma = getPrisma();
    await prisma.cmsRevokedSession.upsert({
      where: { jti },
      create: { jti, expiresAt },
      update: { expiresAt },
    });
    await prisma.cmsRevokedSession.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  },
};

export function createMemoryRevocationStore(): SessionRevocationStore {
  const revoked = new Map<string, number>();

  return {
    async isRevoked(jti) {
      const expiresAt = revoked.get(jti);
      if (expiresAt === undefined) return false;
      if (expiresAt <= Date.now()) {
        revoked.delete(jti);
        return false;
      }
      return true;
    },
    async revoke(jti, expiresAt) {
      revoked.set(jti, expiresAt.getTime());
    },
  };
}

// Tests run without a database.
let revocationStore: SessionRevocationStore =
  process.env.NODE_ENV === "test" ? createMemoryRevocationStore() : databaseRevocationStore;

export function setSessionRevocationStoreForTest(store: SessionRevocationStore) {
  revocationStore = store;
}

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

export async function signSession(user: CmsSessionUser): Promise<string> {
  const payload: SessionPayload = {
    user,
    jti: crypto.randomUUID(),
    exp: Math.floor(Date.now() / 1000) + SESSION_EXP_SECONDS,
  };
  return sign(payload, jwtSecret(), "HS256");
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  let session: SessionPayload;
  try {
    session = (await verify(token, jwtSecret(), "HS256")) as unknown as SessionPayload;
  } catch {
    return null;
  }

  if (!session.jti) return session;

  // A failed lookup is not an invalid session: answering 401 here would send a
  // signed-in admin back to the login page in a loop.
  let revoked: boolean;
  try {
    revoked = await revocationStore.isRevoked(session.jti);
  } catch (error) {
    console.error("[AUTH] Session revocation lookup failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    throw new ResponseError(503, "Cannot verify the CMS session right now.");
  }

  return revoked ? null : session;
}

export async function revokeSession(token: string): Promise<void> {
  let payload: SessionPayload;
  try {
    payload = (await verify(token, jwtSecret(), "HS256")) as unknown as SessionPayload;
  } catch {
    // Logout stays idempotent even if the browser sends an expired token.
    return;
  }

  if (!payload.jti || !payload.exp) return;
  await revocationStore.revoke(payload.jti, new Date(payload.exp * 1000));
}
