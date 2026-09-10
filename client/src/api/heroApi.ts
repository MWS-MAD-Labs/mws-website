import { apiRequest } from "@/lib/api";
import type { HeroSlideSource } from "@/features/hero/heroData";

export const heroApi = {
  async publicHero(): Promise<HeroSlideSource[]> {
    const response = await apiRequest<{ data: HeroSlideSource[] }>("/public/hero");
    return response?.data ?? [];
  },
};
