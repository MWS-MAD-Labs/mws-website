import type { Context } from "hono";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { AnalyticsService } from "../../services/analytics-service";

// Generous per-client ceiling so one script cannot flood the table. The address
// is only used as the limiter key and is never stored.
const limiter = new RateLimiterMemory({ points: 120, duration: 60 });

function clientKey(c: Context) {
  return (
    c.req.header("cf-connecting-ip") ||
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
    c.req.header("x-real-ip") ||
    "unknown"
  );
}

export class PublicAnalyticsController {
  static async pageView(c: Context) {
    try {
      await limiter.consume(clientKey(c));
    } catch {
      return c.body(null, 204);
    }

    const body = await c.req.json().catch(() => null);
    await AnalyticsService.recordPageView(body, c.req.header("user-agent"));
    return c.body(null, 204);
  }
}
