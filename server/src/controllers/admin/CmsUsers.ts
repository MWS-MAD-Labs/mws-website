import type { Context } from "hono";
import { ResponseError } from "../../error/response-error";
import { CmsAuthService } from "../../services/cms-auth-service";
import type { SessionVariables } from "../../types/hono-context";

export class CmsUsersController {
  static async listUsers(c: Context<{ Variables: SessionVariables }>) {
    const [users, roles] = await Promise.all([
      CmsAuthService.listUsers(),
      CmsAuthService.listRoles(),
    ]);

    return c.json({ data: { users, roles } });
  }

  static async updateUserRole(c: Context<{ Variables: SessionVariables }>) {
    const userId = c.req.param("id");
    const body = await c.req.json<{ roleName?: string | null }>();

    if (!userId) {
      throw new ResponseError(400, "User id is required.");
    }

    if (!("roleName" in body)) {
      throw new ResponseError(400, "roleName is required.");
    }

    const user = await CmsAuthService.updateUserRole(userId, body.roleName ?? null);

    return c.json({ data: user });
  }
}
