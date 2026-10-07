import type { ContactInquiry, Prisma } from "@prisma/client";
import { getPrisma } from "../lib/prisma";

export type ContactInquiryFilters = {
  page: number;
  pageSize: number;
  status?: string;
  search?: string;
};

function inquiryWhere(
  filters: Pick<ContactInquiryFilters, "status" | "search">,
): Prisma.ContactInquiryWhereInput {
  const where: Prisma.ContactInquiryWhereInput = {};

  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
      { subject: { contains: filters.search, mode: "insensitive" } },
      { message: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return where;
}

export class ContactInquiryRepository {
  static async list(
    filters: ContactInquiryFilters,
  ): Promise<{ items: ContactInquiry[]; total: number }> {
    const prisma = getPrisma();
    const where = inquiryWhere(filters);

    const [items, total] = await Promise.all([
      prisma.contactInquiry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      prisma.contactInquiry.count({ where }),
    ]);

    return { items, total };
  }

  /** Counts per status for the current search, so filter tabs stay accurate. */
  static async countByStatus(search?: string): Promise<Record<string, number>> {
    const groups = await getPrisma().contactInquiry.groupBy({
      by: ["status"],
      where: inquiryWhere({ search }),
      _count: { _all: true },
    });

    return Object.fromEntries(
      groups.map((group) => [group.status, group._count._all]),
    );
  }

  static async findById(id: string): Promise<ContactInquiry | null> {
    return getPrisma().contactInquiry.findUnique({ where: { id } });
  }

  static async updateStatus(id: string, status: string): Promise<ContactInquiry> {
    return getPrisma().contactInquiry.update({
      where: { id },
      data: { status },
    });
  }
}
