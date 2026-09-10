import type { Context } from "hono";
import type { SessionVariables } from "../../types/hono-context";

export class MeController {
  static async me(c: Context<{ Variables: SessionVariables }>) {
    return c.json({ data: c.var.user });
  }
}
