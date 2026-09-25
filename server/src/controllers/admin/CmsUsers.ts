import type { Context } from "hono";
import { ResponseError } from "../../error/response-error";
import { CmsAuthService } from "../../services/cms-auth-service";
import type { SessionVariables } from "../../types/hono-context";

export class CmsUsersController {
  static async listUsers(c: Context<{ Variables: SessionVariables }>) {
    const query = {
      search: c.req.query("search"),
      status: c.req.query("status"),
      role: c.req.query("role"),
    };
    const [usersData, roles] = await Promise.all([
      CmsAuthService.listUsers(query),
      CmsAuthService.listRoles(),
    ]);

    return c.json({ data: { ...usersData, roles } });
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

    const user = await CmsAuthService.updateUserRole(
      userId,
      body.roleName ?? null,
      c.var.user.id,
    );

    return c.json({ data: user });
  }

  static async updateUserStatus(c: Context<{ Variables: SessionVariables }>) {
    const userId = c.req.param("id");
    const body = await c.req.json<{ isActive?: boolean }>();

    if (!userId) {
      throw new ResponseError(400, "User id is required.");
    }

    if (typeof body.isActive !== "boolean") {
      throw new ResponseError(400, "isActive is required.");
    }

    const user = await CmsAuthService.updateUserStatus(
      userId,
      body.isActive,
      c.var.user.id,
    );

    return c.json({ data: user });
  }

  static async inviteAdmin(c: Context<{ Variables: SessionVariables }>) {
    const body = await c.req.json();
    const invitation = await CmsAuthService.inviteAdmin(body, c.var.user.id);
    return c.json({ data: invitation }, 201);
  }

  static async revokeInvitation(c: Context<{ Variables: SessionVariables }>) {
    const invitationId = c.req.param("id");
    if (!invitationId) {
      throw new ResponseError(400, "Invitation id is required.");
    }

    const invitation = await CmsAuthService.revokeInvitation(
      invitationId,
      c.var.user.id,
    );
    return c.json({ data: invitation });
  }
}
