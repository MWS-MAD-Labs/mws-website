import { Hono } from "hono";
import { ChatbotController } from "../../controllers/api/Chatbot";

export const publicChatbotRoute = new Hono();

publicChatbotRoute.get("/starters", ChatbotController.starters);
publicChatbotRoute.post("/messages", ChatbotController.reply);
