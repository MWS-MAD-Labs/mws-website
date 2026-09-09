import { ResponseError } from "../error/response-error";
import { isMadLabsUser } from "../lib/admin-access";
import { getPrisma } from "../lib/prisma";
import type { CentralUser } from "../types/central-types";
import {
  type CmsPermission,
  type CmsRoleName,
  type CmsSessionUser,
  isCmsRoleName,
} from "../types/cms-auth-types";

type CmsUserRecord = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  cmsRole: CmsRoleName | null;
  isActive: boolean;
  deletedAt: Date | null;
};

const DEFAULT_ROLE_PERMISSIONS: Record<CmsRoleName, CmsPermission[]> = {
  SUPER_ADMIN: ["*"],
  ADMIN: ["dashboard:read", "content:manage"],
  VIEWER: ["dashboard:read"],
};

const ROLE_LABELS: Record<CmsRoleName, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  VIEWER: "Viewer",
};

function permissionsForRole(roleName: CmsRoleName): CmsPermission[] {
  return [...DEFAULT_ROLE_PERMISSIONS[roleName]];
}

function assertActiveCentralEmployee(
  centralUser: CentralUser,
): Extract<CentralUser, { source: "employee" }> {
  if (centralUser.source !== "employee") {
    throw new ResponseError(403, "Only active employees can access CMS.");
  }

  if (centralUser.status.toUpperCase() !== "ACTIVE") {
    throw new ResponseError(403, "Only active employees can access CMS.");
  }

  return centralUser;
}

function sessionUserFromRecords(
  centralUser: Extract<CentralUser, { source: "employee" }>,
  cmsUser: CmsUserRecord | null,
): CmsSessionUser {
  if (!cmsUser || cmsUser.deletedAt) {
    throw new ResponseError(403, "This account does not have CMS access.");
  }

  if (!cmsUser.isActive) {
    throw new ResponseError(403, "This CMS account is inactive.");
  }

  if (!cmsUser.cmsRole) {
    throw new ResponseError(403, "This account does not have an active CMS role.");
  }

  if (!isCmsRoleName(cmsUser.cmsRole)) {
    throw new ResponseError(403, "This account does not have a valid CMS role.");
  }

  return {
    id: cmsUser.id,
    email: cmsUser.email,
    fullName: cmsUser.fullName,
    phone: cmsUser.phone,
    role: {
      name: cmsUser.cmsRole,
      label: ROLE_LABELS[cmsUser.cmsRole],
      permissions: permissionsForRole(cmsUser.cmsRole),
    },
    central: centralUser,
  };
}

export const cmsAuthRepository = {
  async findUserByEmail(email: string): Promise<CmsUserRecord | null> {
    const prisma = getPrisma();

    return prisma.user.findUnique({
      where: { email },
    });
  },

  async provisionUserFromCentralEmployee(
    employee: Extract<CentralUser, { source: "employee" }>,
    cmsRole: CmsRoleName | null,
  ): Promise<CmsUserRecord> {
    const prisma = getPrisma();

    return prisma.user.upsert({
      where: { email: employee.email },
      create: {
        email: employee.email,
        fullName: employee.full_name,
        phone: null,
        isActive: true,
        cmsRole,
      },
      update: {},
    });
  },

  async listUsers(): Promise<CmsUserRecord[]> {
    const prisma = getPrisma();

    return prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { fullName: "asc" },
    });
  },

  async updateUserRole(
    userId: string,
    cmsRole: CmsRoleName | null,
  ): Promise<CmsUserRecord> {
    const prisma = getPrisma();

    return prisma.user.update({
      where: { id: userId },
      data: { cmsRole },
    });
  },
};

export class CmsAuthService {
  static async createSessionUserForCentralIdentity(
    centralUser: CentralUser,
  ): Promise<CmsSessionUser> {
    const activeEmployee = assertActiveCentralEmployee(centralUser);
    const isMadLabs = await isMadLabsUser(activeEmployee);
    const cmsUser = await cmsAuthRepository.provisionUserFromCentralEmployee(
      activeEmployee,
      isMadLabs ? "SUPER_ADMIN" : null,
    );

    return this.authorizeCmsUser(activeEmployee, cmsUser, isMadLabs);
  }

  static async requireFreshSessionUser(
    sessionUser: CmsSessionUser,
    centralUser: CentralUser,
  ): Promise<CmsSessionUser> {
    const activeEmployee = assertActiveCentralEmployee(centralUser);
    const cmsUser = await cmsAuthRepository.findUserByEmail(sessionUser.email);

    return this.authorizeCmsUser(activeEmployee, cmsUser);
  }

  private static async authorizeCmsUser(
    activeEmployee: Extract<CentralUser, { source: "employee" }>,
    cmsUser: CmsUserRecord | null,
    knownMadLabs?: boolean,
  ): Promise<CmsSessionUser> {
    if (!cmsUser || cmsUser.deletedAt) {
      throw new ResponseError(403, "This account does not have CMS access.");
    }

    if (!cmsUser.isActive) {
      throw new ResponseError(403, "This CMS account is inactive.");
    }

    const isMadLabs = knownMadLabs ?? (await isMadLabsUser(activeEmployee));
    if (isMadLabs && cmsUser.cmsRole !== "SUPER_ADMIN") {
      const promotedUser = await cmsAuthRepository.updateUserRole(
        cmsUser.id,
        "SUPER_ADMIN",
      );
      return sessionUserFromRecords(activeEmployee, promotedUser);
    }

    if (!isMadLabs && cmsUser.cmsRole === "SUPER_ADMIN") {
      await cmsAuthRepository.updateUserRole(cmsUser.id, null);
      throw new ResponseError(403, "This account does not have an active CMS role.");
    }

    return sessionUserFromRecords(activeEmployee, cmsUser);
  }

  static async listUsers() {
    const users = await cmsAuthRepository.listUsers();

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      isActive: user.isActive,
      role: user.cmsRole
        ? {
            name: user.cmsRole,
            label: ROLE_LABELS[user.cmsRole],
          }
        : null,
    }));
  }

  static listRoles() {
    return (["ADMIN", "VIEWER"] as const).map((roleName) => ({
      name: roleName,
      label: ROLE_LABELS[roleName],
    }));
  }

  static async updateUserRole(userId: string, roleName: string | null) {
    if (roleName === "SUPER_ADMIN") {
      throw new ResponseError(400, "SUPER_ADMIN is assigned from MAD Labs unit_id.");
    }

    if (roleName !== null && roleName !== "ADMIN" && roleName !== "VIEWER") {
      throw new ResponseError(400, "Unknown CMS role.");
    }

    const updatedUser = await cmsAuthRepository.updateUserRole(userId, roleName);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      phone: updatedUser.phone,
      isActive: updatedUser.isActive,
      role: updatedUser.cmsRole
        ? {
            name: updatedUser.cmsRole,
            label: ROLE_LABELS[updatedUser.cmsRole],
          }
        : null,
    };
  }
}
