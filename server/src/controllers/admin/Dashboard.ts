import type { Context } from "hono";
import { toJsonSafe } from "../../lib/json-response";
import { hasCmsPermission } from "../../middleware/require-cms-permission";
import { AnalyticsService, parseRange } from "../../services/analytics-service";
import { DashboardService } from "../../services/dashboard-service";
import type { SessionVariables } from "../../types/hono-context";

function userName(user: SessionVariables["user"]): string {
  return user.central.nick_name || user.name || user.central.email;
}

export class DashboardController {
  static async dashboard(c: Context<{ Variables: SessionVariables }>) {
    const user = c.var.user;
    const content = await DashboardService.contentSummary({
      includeUsers: hasCmsPermission(user, "users:manage"),
    });

    return c.json({
      data: toJsonSafe({
        message: `Halo, ${userName(user)}`,
        user,
        content,
      }),
    });
  }

  static async analytics(c: Context<{ Variables: SessionVariables }>) {
    const overview = await AnalyticsService.overview(parseRange(c.req.query("days")));
    return c.json({ data: toJsonSafe(overview) });
  }
}
