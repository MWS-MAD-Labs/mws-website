import { getPrisma } from "../lib/prisma";
import type {
  CreatePopupPromotedInput,
  UpdatePopupPromotedInput,
} from "../validation/schemas/popup-promoted-schema";

const prisma = getPrisma();

const popupOrder = [
  { sortOrder: "asc" as const },
  { updatedAt: "desc" as const },
];

export class PopupPromotedRepository {
  async findAll() {
    return prisma.popupPromoted.findMany({
      orderBy: popupOrder,
    });
  }

  async findActive(now = new Date()) {
    return prisma.popupPromoted.findFirst({
      where: {
        isActive: true,
        AND: [
          { OR: [{ activeFrom: null }, { activeFrom: { lte: now } }] },
          { OR: [{ activeUntil: null }, { activeUntil: { gte: now } }] },
        ],
      },
      orderBy: popupOrder,
    });
  }

  async findById(id: string) {
    return prisma.popupPromoted.findUnique({
      where: { id },
    });
  }

  async create(data: CreatePopupPromotedInput) {
    return prisma.popupPromoted.create({
      data,
    });
  }

  async update(id: string, data: UpdatePopupPromotedInput) {
    return prisma.popupPromoted.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.popupPromoted.delete({
      where: { id },
    });
  }
}
