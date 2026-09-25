import { ResponseError } from "../error/response-error";
import { listActiveEmployees } from "../lib/central-client";
import { z } from "zod";
import { getUserUnitId, isMadLabsUser } from "../lib/admin-access";
import { getPrisma } from "../lib/prisma";
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
  email: string;
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

const invitePayloadSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  roleName: z.literal("ADMIN").optional().default("ADMIN"),
  expiresAt: z.coerce.date().nullable().optional(),
});

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
  const email = centralUser.email.trim().toLowerCase();
  const name = centralUser.full_name.trim();
  const unitId = getUserUnitId(centralUser)?.trim() || "";

  if (!centralUserId || !email || !name || !unitId) {
    throw new ResponseError(
      400,
      "Central identity is missing required CMS identity data.",
    );
  }

  return { centralUserId, email, name, unitId };
}

function centralUnitName(centralUser: ActiveCentralEmployee): string {
  if (typeof centralUser.unit === "string") return centralUser.unit;
  return centralUser.unit?.name ?? "";
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
    email: cmsUser.email,
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
  const data: {
    email?: string;
    name?: string;
    unitId?: string;
    lastCentralSyncedAt?: Date;
  } = {};

  if (cmsUser.email !== snapshot.email) data.email = snapshot.email;
  if (cmsUser.name !== snapshot.name) data.name = snapshot.name;
  if (cmsUser.unitId !== snapshot.unitId) data.unitId = snapshot.unitId;

  if (!data.email && !data.name && !data.unitId) {
    return cmsUser;
  }

  data.lastCentralSyncedAt = new Date();

  const updatedUser = await CmsUserRepository.update(cmsUser.id, data);
  return {
    ...updatedUser,
    role: cmsUser.role,
  };
}

function normalizedCsvEnv(name: string) {
  return new Set(
    (process.env[name] ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
}

function isBootstrapAllowed(snapshot: CentralIdentitySnapshot) {
  const allowedEmails = normalizedCsvEnv("CMS_BOOTSTRAP_SUPER_ADMIN_EMAILS");
  const allowedIds = normalizedCsvEnv("CMS_BOOTSTRAP_SUPER_ADMIN_CENTRAL_IDS");

  return (
    allowedEmails.has(snapshot.email.toLowerCase()) ||
    allowedIds.has(snapshot.centralUserId.toLowerCase())
  );
}

function userListItem(user: CmsUserWithRole, unitName?: string | null) {
  return {
    id: user.id,
    centralUserId: user.centralUserId,
    email: user.email,
    name: user.name,
    unitId: user.unitId,
    unit: unitName ?? "",
    isActive: user.isActive,
    lastCentralSyncedAt: user.lastCentralSyncedAt,
    deactivatedAt: user.deactivatedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    role: isCmsRoleName(user.role.name)
      ? {
          name: user.role.name,
          label: user.role.description ?? ROLE_LABELS[user.role.name],
        }
      : null,
  };
}

function invitationListItem(
  invitation: Awaited<ReturnType<typeof CmsUserRepository.listInvitations>>[number],
) {
  return {
    id: invitation.id,
    email: invitation.email,
    centralUserId: invitation.centralUserId,
    name: invitation.name,
    unitId: invitation.unitId,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
    acceptedAt: invitation.acceptedAt,
    createdAt: invitation.createdAt,
    updatedAt: invitation.updatedAt,
    role: isCmsRoleName(invitation.role.name)
      ? {
          name: invitation.role.name,
          label: invitation.role.description ?? ROLE_LABELS[invitation.role.name],
        }
      : null,
    invitedBy: invitation.invitedBy,
    acceptedUser: invitation.acceptedUser,
  };
}

async function writeAuditLog(input: {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: unknown;
  newValues?: unknown;
}) {
  await getPrisma()
    .auditLog.create({
      data: {
        cmsUserId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        oldValues: input.oldValues ?? undefined,
        newValues: input.newValues ?? undefined,
      },
    })
    .catch(() => undefined);
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
      if (
        syncedCmsUser.role.name === "SUPER_ADMIN" &&
        !(await isMadLabsUser(activeEmployee))
      ) {
        throw new ResponseError(
          403,
          "SUPER_ADMIN access requires active MAD Labs membership.",
        );
      }
      return sessionUserFromRecords(activeEmployee, syncedCmsUser);
    }

    const existingByEmail = await CmsUserRepository.findByEmail(snapshot.email);
    if (existingByEmail) {
      const syncedCmsUser = await syncCmsIdentitySnapshot(
        existingByEmail,
        snapshot,
      );
      if (
        syncedCmsUser.role.name === "SUPER_ADMIN" &&
        !(await isMadLabsUser(activeEmployee))
      ) {
        throw new ResponseError(
          403,
          "SUPER_ADMIN access requires active MAD Labs membership.",
        );
      }
      return sessionUserFromRecords(activeEmployee, syncedCmsUser);
    }

    const invitation =
      await CmsUserRepository.findPendingInvitationForIdentity(snapshot);
    if (invitation) {
      const createdCmsUser = await CmsUserRepository.create({
        centralUserId: snapshot.centralUserId,
        email: snapshot.email,
        name: snapshot.name,
        unitId: snapshot.unitId,
        cmsRoleId: invitation.cmsRoleId,
        isActive: true,
        lastCentralSyncedAt: new Date(),
      });
      await CmsUserRepository.updateInvitation(invitation.id, {
        status: "ACCEPTED",
        centralUserId: snapshot.centralUserId,
        name: snapshot.name,
        unitId: snapshot.unitId,
        acceptedUserId: createdCmsUser.id,
        acceptedAt: new Date(),
      });
      await writeAuditLog({
        action: "CMS_USER_ACCEPTED",
        entityType: "CmsUserInvitation",
        entityId: invitation.id,
        newValues: { centralUserId: snapshot.centralUserId },
      });

      return sessionUserFromRecords(activeEmployee, {
        ...createdCmsUser,
        role: invitation.role,
      });
    }

    if (isBootstrapAllowed(snapshot) && (await isMadLabsUser(activeEmployee))) {
      const superAdminRole =
        await CmsUserRepository.findRoleByName("SUPER_ADMIN");
      if (!superAdminRole) {
        throw new ResponseError(500, "SUPER_ADMIN CMS role is not configured.");
      }

      const createdCmsUser = await CmsUserRepository.create({
        centralUserId: snapshot.centralUserId,
        email: snapshot.email,
        name: snapshot.name,
        unitId: snapshot.unitId,
        cmsRoleId: superAdminRole.id,
        isActive: true,
        lastCentralSyncedAt: new Date(),
      });

      await writeAuditLog({
        actorId: createdCmsUser.id,
        action: "CMS_USER_BOOTSTRAPPED",
        entityType: "CmsUser",
        entityId: createdCmsUser.id,
        newValues: { role: "SUPER_ADMIN" },
      });

      return sessionUserFromRecords(activeEmployee, {
        ...createdCmsUser,
        role: superAdminRole,
      });
    }

    throw new ResponseError(403, "This account does not have CMS access.");
  }

  static async requireFreshSessionUser(
    sessionUser: CmsSessionUser,
    centralUser: CentralUser | null,
  ): Promise<CmsSessionUser> {
    const activeEmployee = assertActiveCentralEmployee(centralUser);
    const snapshot = centralIdentitySnapshot(activeEmployee);

    if (sessionUser.centralUserId !== snapshot.centralUserId) {
      throw new ResponseError(
        403,
        "Session identity does not match Central identity.",
      );
    }

    const cmsUser = await CmsUserRepository.findByCentralUserId(
      snapshot.centralUserId,
    );
    const syncedCmsUser = cmsUser
      ? await syncCmsIdentitySnapshot(cmsUser, snapshot)
      : null;
    if (
      syncedCmsUser?.role.name === "SUPER_ADMIN" &&
      !(await isMadLabsUser(activeEmployee))
    ) {
      throw new ResponseError(
        403,
        "SUPER_ADMIN access requires active MAD Labs membership.",
      );
    }

    return sessionUserFromRecords(activeEmployee, syncedCmsUser);
  }

  static async listUsers(query: Record<string, string | undefined> = {}) {
    const users = await CmsUserRepository.listUsers({
      search: query.search?.trim() || undefined,
      status:
        query.status === "active" || query.status === "inactive"
          ? query.status
          : undefined,
      roleName: query.role || undefined,
    });

    const invitations = await CmsUserRepository.listInvitations();
    const employees = await listActiveEmployees();

    const unitNameById = new Map(
      employees.map((employee) => [
        getUserUnitId(employee),
        centralUnitName(employee),
      ]),
    );

    return {
      users: users.map((user) =>
        userListItem(user, unitNameById.get(user.unitId)),
      ),
      invitations: invitations.map(invitationListItem),
    };
  }

  static listRoles() {
    return CMS_ROLE_NAMES.map((roleName) => ({
      name: roleName,
      label: ROLE_LABELS[roleName],
    }));
  }

  static async updateUserRole(
    userId: string,
    roleName: string | null,
    actorId?: string,
  ) {
    if (!roleName || !isCmsRoleName(roleName)) {
      throw new ResponseError(400, "A valid CMS role is required.");
    }

    const user = await CmsUserRepository.findById(userId);
    if (!user) throw new ResponseError(404, "CMS user not found.");

    if (user.role.name === "SUPER_ADMIN" && roleName !== "SUPER_ADMIN") {
      const remainingSuperAdmins =
        await CmsUserRepository.countActiveSuperAdmins(user.id);
      if (remainingSuperAdmins < 1) {
        throw new ResponseError(
          409,
          "At least one active SUPER_ADMIN is required.",
        );
      }
    }

    if (roleName === "SUPER_ADMIN") {
      throw new ResponseError(
        400,
        "SUPER_ADMIN cannot be assigned from this screen. Use bootstrap policy.",
      );
    }

    const role = await CmsUserRepository.findRoleByName(roleName);
    if (!role) throw new ResponseError(400, "CMS role is not configured.");

    await CmsUserRepository.update(user.id, { cmsRoleId: role.id });
    await writeAuditLog({
      actorId,
      action: "CMS_USER_ROLE_CHANGED",
      entityType: "CmsUser",
      entityId: user.id,
      oldValues: { role: user.role.name },
      newValues: { role: roleName },
    });

    const updated = await CmsUserRepository.findById(user.id);
    return updated ? userListItem(updated) : null;
  }

  static async updateUserStatus(
    userId: string,
    isActive: boolean,
    actorId?: string,
  ) {
    const user = await CmsUserRepository.findById(userId);
    if (!user) throw new ResponseError(404, "CMS user not found.");

    if (!isActive && user.role.name === "SUPER_ADMIN") {
      const remainingSuperAdmins =
        await CmsUserRepository.countActiveSuperAdmins(user.id);
      if (remainingSuperAdmins < 1) {
        throw new ResponseError(
          409,
          "At least one active SUPER_ADMIN is required.",
        );
      }
    }

    await CmsUserRepository.update(user.id, {
      isActive,
      deactivatedAt: isActive ? null : new Date(),
    });
    await writeAuditLog({
      actorId,
      action: isActive ? "CMS_USER_REACTIVATED" : "CMS_USER_DEACTIVATED",
      entityType: "CmsUser",
      entityId: user.id,
      oldValues: { isActive: user.isActive },
      newValues: { isActive },
    });

    const updated = await CmsUserRepository.findById(user.id);
    return updated ? userListItem(updated) : null;
  }

  static async inviteAdmin(payload: unknown, actorId?: string) {
    const parsed = zInvitePayload(payload);
    const role = await CmsUserRepository.findRoleByName(parsed.roleName);
    if (!role) throw new ResponseError(400, "CMS role is not configured.");

    const invitation = await CmsUserRepository.createInvitation({
      email: parsed.email,
      cmsRoleId: role.id,
      invitedById: actorId,
      expiresAt: parsed.expiresAt,
    });

    await writeAuditLog({
      actorId,
      action: "CMS_USER_INVITED",
      entityType: "CmsUserInvitation",
      entityId: invitation.id,
      newValues: { email: parsed.email, role: parsed.roleName },
    });

    return invitationListItem(invitation);
  }

  static async revokeInvitation(invitationId: string, actorId?: string) {
    const invitation = await CmsUserRepository.updateInvitation(invitationId, {
      status: "REVOKED",
    });
    await writeAuditLog({
      actorId,
      action: "CMS_USER_INVITATION_REVOKED",
      entityType: "CmsUserInvitation",
      entityId: invitation.id,
      newValues: { status: "REVOKED" },
    });

    return invitationListItem(invitation);
  }
}

function zInvitePayload(payload: unknown) {
  const parsed = invitePayloadSchema.safeParse(payload);

  if (!parsed.success) {
    throw new ResponseError(400, "Invalid CMS user invitation payload.");
  }

  return parsed.data;
}
