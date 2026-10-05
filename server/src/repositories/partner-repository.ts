import { getPrisma } from "../lib/prisma";
import type {
  CreatePartnerInput,
  UpdatePartnerInput,
} from "../validation/schemas/partner-schema";

const prisma = getPrisma();

export class PartnerRepository {
  async findAll() {
    return prisma.partner.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string) {
    return prisma.partner.findUnique({
      where: { id },
    });
  }

  async create(data: CreatePartnerInput) {
    return prisma.partner.create({
      data,
    });
  }

  async update(id: string, data: UpdatePartnerInput) {
    return prisma.partner.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.partner.delete({
      where: { id },
    });
  }
}
