import type { HeroSlide, Prisma } from "@prisma/client";
import { getPrisma } from "../lib/prisma";

export type HeroSlideCreateData = Prisma.HeroSlideUncheckedCreateInput;
export type HeroSlideUpdateData = Prisma.HeroSlideUncheckedUpdateInput;

const heroOrder = [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }];

export class HeroSlideRepository {
  static async listAll(): Promise<HeroSlide[]> {
    return getPrisma().heroSlide.findMany({ orderBy: heroOrder });
  }

  static async listActive(): Promise<HeroSlide[]> {
    return getPrisma().heroSlide.findMany({
      where: { isActive: true },
      orderBy: heroOrder,
    });
  }

  static async findById(id: string): Promise<HeroSlide | null> {
    return getPrisma().heroSlide.findUnique({ where: { id } });
  }

  static async create(data: HeroSlideCreateData): Promise<HeroSlide> {
    return getPrisma().heroSlide.create({ data });
  }

  static async update(id: string, data: HeroSlideUpdateData): Promise<HeroSlide> {
    return getPrisma().heroSlide.update({ where: { id }, data });
  }

  static async delete(id: string): Promise<HeroSlide> {
    return getPrisma().heroSlide.delete({ where: { id } });
  }
}
