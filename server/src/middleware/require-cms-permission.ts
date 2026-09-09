import type { Context, Next } from "hono";
import { ResponseError } from "../error/response-error";
import type { CmsPermission, CmsRoleName } from "../types/cms-auth-types";
import type { SessionVariables } from "../types/hono-context";

export function hasCmsPermission(
  user: SessionVariables["user"],
  permission: CmsPermission,
): boolean {
  return (
    user.role.name === "SUPER_ADMIN" ||
    user.role.permissions.includes("*") ||
    user.role.permissions.includes(permission)
  );
}

export function requireCmsPermission(permission: CmsPermission) {
  return async (c: Context<{ Variables: SessionVariables }>, next: Next) => {
    if (!hasCmsPermission(c.var.user, permission)) {
      throw new ResponseError(403, "You are not allowed to perform this action.");
    }

    await next();
  };
}

export function requireCmsRole(roleName: CmsRoleName) {
  return async (c: Context<{ Variables: SessionVariables }>, next: Next) => {
    if (c.var.user.role.name !== roleName) {
      throw new ResponseError(403, "You are not allowed to perform this action.");
    }

    await next();
  };
}
