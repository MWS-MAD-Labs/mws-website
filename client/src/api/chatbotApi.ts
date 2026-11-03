import { apiRequest } from '@/lib/api';

export type ChatAction = { label: string; href: string };

export type ChatReply = {
  language: 'en' | 'id';
  source: 'faq' | 'topic' | 'fallback';
  reply: string;
  actions: ChatAction[];
  suggestions: string[];
};

export const chatbotApi = {
  async send(message: string): Promise<ChatReply> {
    const response = await apiRequest<{ data: ChatReply }>('/api/chatbot/messages', {
      method: 'POST',
      body: { message },
    });
    return response!.data;
  },

  async starters(): Promise<string[]> {
    const response = await apiRequest<{ data: string[] }>('/api/chatbot/starters');
    return response?.data ?? [];
  },
};
