import type { Context } from "hono";
import { ResponseError } from "../../error/response-error";
import { CmsAuthService } from "../../services/cms-auth-service";
import type { SessionVariables } from "../../types/hono-context";

async function readJson<T = unknown>(c: Context): Promise<T> {
  try {
    return await c.req.json<T>();
  } catch {
    throw new ResponseError(400, "Invalid JSON body.");
  }
}

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
    const body = await readJson<{ roleName?: string | null }>(c);

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
    const body = await readJson<{ isActive?: boolean }>(c);

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

  static async deleteUser(c: Context<{ Variables: SessionVariables }>) {
    const userId = c.req.param("id");

    if (!userId) {
      throw new ResponseError(400, "User id is required.");
    }

    await CmsAuthService.deleteUser(userId, c.var.user.id);
    return c.json({ data: { id: userId } });
  }

  static async inviteAdmin(c: Context<{ Variables: SessionVariables }>) {
    const body = await readJson(c);
    const invitation = await CmsAuthService.inviteAdmin(body, {
      id: c.var.user.id,
      name: c.var.user.name,
    });
    return c.json({ data: invitation }, 201);
  }

  static async resendInvitation(c: Context<{ Variables: SessionVariables }>) {
    const invitationId = c.req.param("id");
    if (!invitationId) {
      throw new ResponseError(400, "Invitation id is required.");
    }

    const invitation = await CmsAuthService.resendInvitation(invitationId, {
      id: c.var.user.id,
      name: c.var.user.name,
    });
    return c.json({ data: invitation });
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
