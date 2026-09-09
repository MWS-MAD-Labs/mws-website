import { ResponseError } from "../error/response-error";
import { GoogleAuth } from "../lib/google-auth";
import { resolveCentralIdentity } from "../lib/central-client";
import { signSession } from "../lib/session";
import type { CmsSessionUser } from "../types/cms-auth-types";
import { CmsAuthService } from "./cms-auth-service";

export class AuthService {
  static async loginWithGoogle(
    code: string,
  ): Promise<{ token: string; user: CmsSessionUser }> {
    const payload = await GoogleAuth.verifyCode(code);
    if (!payload) {
      throw new ResponseError(401, "Google sign-in failed.");
    }

    const allowedDomain = process.env.ALLOWED_DOMAIN;
    if (allowedDomain && !payload.email.endsWith(`@${allowedDomain}`)) {
      throw new ResponseError(403, `Only @${allowedDomain} accounts can sign in.`);
    }

    const user = await resolveCentralIdentity(payload.email);
    if (!user) {
      throw new ResponseError(
        404,
        "This account isn't registered in the Central database yet.",
      );
    }

    const cmsUser = await CmsAuthService.createSessionUserForCentralIdentity(user);
    const token = await signSession(cmsUser);
    return { token, user: cmsUser };
  }
}
