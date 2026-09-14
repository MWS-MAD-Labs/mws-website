import { ResponseError } from "../error/response-error";
import { getUserUnitId, isMadLabsUser } from "../lib/admin-access";
import {
  CmsUserRepository,
  type CmsUserWithRole,
} from "../repositories/cms-user-repository";
import type { CentralUser } from "../types/central-types";
import {
  CMS_ROLE_NAMES,
  type CmsPermission,
  type CmsRoleName,
  type CmsSessionUser,
  isCmsRoleName,
} from "../types/cms-auth-types";

type ActiveCentralEmployee = Extract<CentralUser, { source: "employee" }>;

type CentralIdentitySnapshot = {
  centralUserId: string;
  name: string;
  unitId: string;
};

const DEFAULT_ROLE_PERMISSIONS: Record<CmsRoleName, CmsPermission[]> = {
  SUPER_ADMIN: ["*"],
  ADMIN: ["dashboard:read", "content:manage"],
};

const ROLE_LABELS: Record<CmsRoleName, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
};

function permissionsForRole(roleName: CmsRoleName): CmsPermission[] {
  return [...DEFAULT_ROLE_PERMISSIONS[roleName]];
}

function assertActiveCentralEmployee(
  centralUser: CentralUser | null,
): ActiveCentralEmployee {
  if (!centralUser) {
    throw new ResponseError(404, "Central identity was not found.");
  }

  if (centralUser.source !== "employee") {
    throw new ResponseError(403, "Only active employees can access CMS.");
  }

  if (centralUser.status.toUpperCase() !== "ACTIVE") {
    throw new ResponseError(403, "Only active employees can access CMS.");
  }

  return centralUser;
}

function centralIdentitySnapshot(
  centralUser: ActiveCentralEmployee,
): CentralIdentitySnapshot {
  const centralUserId = centralUser.id.trim();
  const name = centralUser.full_name.trim();
  const unitId = getUserUnitId(centralUser)?.trim() || "";

  if (!centralUserId || !name || !unitId) {
    throw new ResponseError(
      400,
      "Central identity is missing required CMS identity data.",
    );
  }

  return { centralUserId, name, unitId };
}

function sessionUserFromRecords(
  centralUser: ActiveCentralEmployee,
  cmsUser: CmsUserWithRole | null,
): CmsSessionUser {
  if (!cmsUser) {
    throw new ResponseError(403, "This account does not have CMS access.");
  }

  if (!cmsUser.isActive) {
    throw new ResponseError(403, "This CMS account is inactive.");
  }

  if (!isCmsRoleName(cmsUser.role.name)) {
    throw new ResponseError(403, "This account does not have a valid CMS role.");
  }

  return {
    id: cmsUser.id,
    centralUserId: cmsUser.centralUserId,
    name: cmsUser.name,
    unitId: cmsUser.unitId,
    isActive: cmsUser.isActive,
    role: {
      name: cmsUser.role.name,
      label: cmsUser.role.description ?? ROLE_LABELS[cmsUser.role.name],
      permissions: permissionsForRole(cmsUser.role.name),
    },
    central: centralUser,
  };
}

async function syncCmsIdentitySnapshot(
  cmsUser: CmsUserWithRole,
  snapshot: CentralIdentitySnapshot,
): Promise<CmsUserWithRole> {
  const data: { name?: string; unitId?: string } = {};

  if (cmsUser.name !== snapshot.name) data.name = snapshot.name;
  if (cmsUser.unitId !== snapshot.unitId) data.unitId = snapshot.unitId;

  if (!data.name && !data.unitId) return cmsUser;

  const updatedUser = await CmsUserRepository.update(cmsUser.id, data);
  return {
    ...updatedUser,
    role: cmsUser.role,
  };
}

export class CmsAuthService {
  static async createSessionUserForCentralIdentity(
    centralUser: CentralUser | null,
  ): Promise<CmsSessionUser> {
    const activeEmployee = assertActiveCentralEmployee(centralUser);
    const snapshot = centralIdentitySnapshot(activeEmployee);
    const existingCmsUser = await CmsUserRepository.findByCentralUserId(
      snapshot.centralUserId,
    );

    if (existingCmsUser) {
      const syncedCmsUser = await syncCmsIdentitySnapshot(
        existingCmsUser,
        snapshot,
      );
      return sessionUserFromRecords(activeEmployee, syncedCmsUser);
    }

    if (!(await isMadLabsUser(activeEmployee))) {
      throw new ResponseError(403, "This account does not have CMS access.");
    }

    const superAdminRole = await CmsUserRepository.findRoleByName("SUPER_ADMIN");
    if (!superAdminRole) {
      throw new ResponseError(500, "SUPER_ADMIN CMS role is not configured.");
    }

    const createdCmsUser = await CmsUserRepository.create({
      centralUserId: snapshot.centralUserId,
      name: snapshot.name,
      unitId: snapshot.unitId,
      cmsRoleId: superAdminRole.id,
      isActive: true,
    });

    return sessionUserFromRecords(activeEmployee, {
      ...createdCmsUser,
      role: superAdminRole,
    });
  }

  static async requireFreshSessionUser(
    sessionUser: CmsSessionUser,
    centralUser: CentralUser | null,
  ): Promise<CmsSessionUser> {
    const activeEmployee = assertActiveCentralEmployee(centralUser);
    const snapshot = centralIdentitySnapshot(activeEmployee);

    if (sessionUser.centralUserId !== snapshot.centralUserId) {
      throw new ResponseError(403, "Session identity does not match Central identity.");
    }

    const cmsUser = await CmsUserRepository.findByCentralUserId(
      snapshot.centralUserId,
    );
    const syncedCmsUser = cmsUser
      ? await syncCmsIdentitySnapshot(cmsUser, snapshot)
      : null;

    return sessionUserFromRecords(activeEmployee, syncedCmsUser);
  }

  static async listUsers(): Promise<unknown[]> {
    throw new ResponseError(
      501,
      "CMS user administration has not been rebuilt for the new schema.",
    );
  }

  static listRoles() {
    return CMS_ROLE_NAMES.map((roleName) => ({
      name: roleName,
      label: ROLE_LABELS[roleName],
    }));
  }

  static async updateUserRole(
    _userId: string,
    _roleName: string | null,
  ): Promise<unknown> {
    throw new ResponseError(
      501,
      "CMS user role administration has not been rebuilt for the new schema.",
    );
  }
}
