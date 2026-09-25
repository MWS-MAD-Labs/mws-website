import type { CmsRole, CmsUser, CmsUserInvitation, Prisma } from "@prisma/client";
import { getPrisma } from "../lib/prisma";

export type CmsUserWithRole = CmsUser & {
  role: CmsRole;
};

export type CmsInvitationWithRelations = CmsUserInvitation & {
  role: CmsRole;
  invitedBy: Pick<CmsUser, "id" | "name" | "email"> | null;
  acceptedUser: Pick<CmsUser, "id" | "name" | "email"> | null;
};

export type CreateCmsUserInput = {
  centralUserId: string;
  email?: string | null;
  name: string;
  unitId: string;
  cmsRoleId: string;
  isActive?: boolean;
  lastCentralSyncedAt?: Date | null;
};

export type UpdateCmsUserInput = Partial<
  Pick<
    CmsUser,
    | "email"
    | "name"
    | "unitId"
    | "cmsRoleId"
    | "isActive"
    | "lastCentralSyncedAt"
    | "deactivatedAt"
  >
>;

const userInclude = { role: true } as const;

const invitationInclude = {
  role: true,
  invitedBy: { select: { id: true, name: true, email: true } },
  acceptedUser: { select: { id: true, name: true, email: true } },
} as const;

export const CmsUserRepository = {
  async findByCentralUserId(
    centralUserId: string,
  ): Promise<CmsUserWithRole | null> {
    const prisma = getPrisma();

    return prisma.cmsUser.findUnique({
      where: { centralUserId },
      include: userInclude,
    });
  },

  async findByEmail(email: string): Promise<CmsUserWithRole | null> {
    const prisma = getPrisma();

    return prisma.cmsUser.findUnique({
      where: { email },
      include: userInclude,
    });
  },

  async findById(id: string): Promise<CmsUserWithRole | null> {
    const prisma = getPrisma();

    return prisma.cmsUser.findUnique({
      where: { id },
      include: userInclude,
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

  async listUsers(filters: {
    search?: string;
    status?: "active" | "inactive";
    roleName?: string;
  } = {}): Promise<CmsUserWithRole[]> {
    const prisma = getPrisma();
    const where: Prisma.CmsUserWhereInput = {};

    if (filters.status === "active") where.isActive = true;
    if (filters.status === "inactive") where.isActive = false;
    if (filters.roleName) where.role = { name: filters.roleName };
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { centralUserId: { contains: filters.search, mode: "insensitive" } },
        { unitId: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return prisma.cmsUser.findMany({
      where,
      include: userInclude,
      orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    });
  },

  async countActiveSuperAdmins(exceptUserId?: string): Promise<number> {
    const prisma = getPrisma();

    return prisma.cmsUser.count({
      where: {
        isActive: true,
        ...(exceptUserId ? { id: { not: exceptUserId } } : {}),
        role: { name: "SUPER_ADMIN" },
      },
    });
  },

  async findPendingInvitationForIdentity(input: {
    email: string;
    centralUserId: string;
    now?: Date;
  }): Promise<CmsInvitationWithRelations | null> {
    const prisma = getPrisma();
    const now = input.now ?? new Date();

    return prisma.cmsUserInvitation.findFirst({
      where: {
        status: "PENDING",
        OR: [{ email: input.email }, { centralUserId: input.centralUserId }],
        AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }],
      },
      include: invitationInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  async listInvitations(): Promise<CmsInvitationWithRelations[]> {
    const prisma = getPrisma();

    return prisma.cmsUserInvitation.findMany({
      include: invitationInclude,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });
  },

  async createInvitation(data: {
    email: string;
    centralUserId?: string | null;
    name?: string | null;
    unitId?: string | null;
    cmsRoleId: string;
    invitedById?: string | null;
    expiresAt?: Date | null;
  }): Promise<CmsInvitationWithRelations> {
    const prisma = getPrisma();

    return prisma.cmsUserInvitation.create({
      data,
      include: invitationInclude,
    });
  },

  async updateInvitation(
    id: string,
    data: Partial<
      Pick<
        CmsUserInvitation,
        | "status"
        | "centralUserId"
        | "name"
        | "unitId"
        | "acceptedUserId"
        | "acceptedAt"
      >
    >,
  ): Promise<CmsInvitationWithRelations> {
    const prisma = getPrisma();

    return prisma.cmsUserInvitation.update({
      where: { id },
      data,
      include: invitationInclude,
    });
  },
};
