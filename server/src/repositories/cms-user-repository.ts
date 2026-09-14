import type { CmsRole, CmsUser } from "@prisma/client";
import { getPrisma } from "../lib/prisma";

export type CmsUserWithRole = CmsUser & {
  role: CmsRole;
};

export type CreateCmsUserInput = {
  centralUserId: string;
  name: string;
  unitId: string;
  cmsRoleId: string;
  isActive?: boolean;
};

export type UpdateCmsUserInput = Partial<
  Pick<CmsUser, "name" | "unitId" | "cmsRoleId" | "isActive">
>;

export const CmsUserRepository = {
  async findByCentralUserId(
    centralUserId: string,
  ): Promise<CmsUserWithRole | null> {
    const prisma = getPrisma();

    return prisma.cmsUser.findUnique({
      where: { centralUserId },
      include: { role: true },
    });
  },

  async findRoleByName(name: string): Promise<CmsRole | null> {
    const prisma = getPrisma();

    return prisma.cmsRole.findUnique({
      where: { name },
    });
  },

  async create(data: CreateCmsUserInput): Promise<CmsUser> {
    const prisma = getPrisma();

    return prisma.cmsUser.create({
      data,
    });
  },

  async update(id: string, data: UpdateCmsUserInput): Promise<CmsUser> {
    const prisma = getPrisma();

    return prisma.cmsUser.update({
      where: { id },
      data,
    });
  },
};
