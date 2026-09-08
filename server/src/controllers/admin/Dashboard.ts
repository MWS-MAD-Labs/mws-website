import type { Context } from "hono";
import type { SessionVariables } from "../../types/hono-context";

function userName(user: SessionVariables["user"]): string {
  return user.nick_name || user.full_name || user.email;
}

export class DashboardController {
  static async dashboard(c: Context<{ Variables: SessionVariables }>) {
    const user = c.var.user;
    console.log("CMS dashboard Central token user:", user);

    return c.json({
      data: {
        message: `Halo, ${userName(user)}`,
        user,
      },
    });
  }
}
