import type { CentralUser } from "../types/central-types";
import { getUserUnitId } from "../lib/admin-access";

type ActiveEmployee = Extract<CentralUser, { source: "employee" }>;

export type ExistingCmsUser = {
  id: string;
  centralUserId: string;
  email: string | null;
  isActive: boolean;
  roleName: string;
};

export type MadLabsSeedIdentity = {
  centralUserId: string;
  email: string;
  name: string;
  unitId: string;
};

export type MadLabsSeedAction =
  | { type: "create"; identity: MadLabsSeedIdentity }
  | { type: "promote"; identity: MadLabsSeedIdentity; userId: string; fromRole: string }
  | { type: "unchanged"; identity: MadLabsSeedIdentity; userId: string }
  | { type: "skip"; identity: Partial<MadLabsSeedIdentity>; reason: string };

function identityOf(employee: ActiveEmployee): Partial<MadLabsSeedIdentity> {
  return {
    centralUserId: employee.id?.trim() || undefined,
    email: employee.email?.trim().toLowerCase() || undefined,
    name: employee.full_name?.trim() || undefined,
    unitId: getUserUnitId(employee)?.trim() || undefined,
  };
}

function isComplete(
  identity: Partial<MadLabsSeedIdentity>,
): identity is MadLabsSeedIdentity {
  return Boolean(
    identity.centralUserId && identity.email && identity.name && identity.unitId,
  );
}

/**
 * Decides what the MAD Labs seed should do for each active Central employee in
 * the MAD Labs unit. Membership uses the same unit id that `isMadLabsUser`
 * checks at login, so every seeded SUPER_ADMIN can actually sign in.
 *
 * A deactivated CMS account is never reactivated here: deactivation is a
 * deliberate decision made in CMS Users.
 */
export function planMadLabsSuperAdmins(input: {
  employees: ActiveEmployee[];
  madLabsUnitId: string;
  existingUsers: ExistingCmsUser[];
}): MadLabsSeedAction[] {
  const byCentralId = new Map(input.existingUsers.map((user) => [user.centralUserId, user]));
  const byEmail = new Map(
    input.existingUsers
      .filter((user) => user.email)
      .map((user) => [user.email!.toLowerCase(), user]),
  );

  return input.employees
    .filter((employee) => employee.status?.toUpperCase() === "ACTIVE")
    .filter((employee) => getUserUnitId(employee) === input.madLabsUnitId)
    .map((employee): MadLabsSeedAction => {
      const identity = identityOf(employee);

      if (!isComplete(identity)) {
        return {
          type: "skip",
          identity,
          reason: "Central record is missing id, email, name, or unit.",
        };
      }

      const existing =
        byCentralId.get(identity.centralUserId) ?? byEmail.get(identity.email);

      if (!existing) return { type: "create", identity };

      if (!existing.isActive) {
        return {
          type: "skip",
          identity,
          reason: "CMS account is deactivated; reactivate it in CMS Users if intended.",
        };
      }

      if (existing.roleName === "SUPER_ADMIN") {
        return { type: "unchanged", identity, userId: existing.id };
      }

      return {
        type: "promote",
        identity,
        userId: existing.id,
        fromRole: existing.roleName,
      };
    });
}
