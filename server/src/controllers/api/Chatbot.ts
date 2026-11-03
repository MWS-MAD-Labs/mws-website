import type { Context } from "hono";
import { ResponseError } from "../../error/response-error";
import { ChatbotService } from "../../services/chatbot/chatbot-service";

async function readJson(c: Context) {
  try {
    return await c.req.json();
  } catch {
    throw new ResponseError(400, "Invalid JSON body.");
  }
}

function clientIp(c: Context) {
  return (
    c.req.header("cf-connecting-ip") ||
    c.req.header("x-real-ip") ||
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
    null
  );
}

export class ChatbotController {
  static async reply(c: Context) {
    const body = await readJson(c);
    const reply = await ChatbotService.reply(body, { ipAddress: clientIp(c) });
    return c.json({ data: reply });
  }

  static async starters(c: Context) {
    return c.json({ data: await ChatbotService.starters() });
  }
}
