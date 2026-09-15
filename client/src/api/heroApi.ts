import { apiRequest } from "@/lib/api";
import type { ResolvedHeroSlide } from "@/features/hero/heroData";

export const heroApi = {
  async publicHero(): Promise<ResolvedHeroSlide[]> {
    const response =
      await apiRequest<{ data: ResolvedHeroSlide[] }>("/api/hero-slides");
    return response?.data ?? [];
  },
};
