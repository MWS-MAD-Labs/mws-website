import type { Context } from "hono";
import type { SessionVariables } from "../../types/hono-context";

function userName(user: SessionVariables["user"]): string {
  return user.central.nick_name || user.fullName || user.email;
}

export class DashboardController {
  static async dashboard(c: Context<{ Variables: SessionVariables }>) {
    const user = c.var.user;

    return c.json({
      data: {
        message: `Halo, ${userName(user)}`,
        user,
      },
    });
  }
}
