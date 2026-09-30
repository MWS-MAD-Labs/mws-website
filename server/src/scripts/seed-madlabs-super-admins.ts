import { listActiveEmployees } from "../lib/central-client";
import { getUserUnitId, madLabsUnitId } from "../lib/admin-access";
import { getPrisma } from "../lib/prisma";
import {
  planMadLabsSuperAdmins,
  type MadLabsSeedAction,
} from "../services/madlabs-super-admin-seed";

/**
 * Makes every active MAD Labs employee in Central a CMS SUPER_ADMIN.
 *
 *   bun run db:seed:madlabs-super-admins            # dry run, prints the plan
 *   bun run db:seed:madlabs-super-admins --apply    # writes the changes
 *
 * Needs DATABASE_URL, CENTRAL_API_BASE_URL and CENTRAL_API_TOKEN. Safe to run
 * again: existing SUPER_ADMINs are left alone and deactivated accounts are
 * never reactivated.
 */

const prisma = getPrisma();
const shouldApply = process.argv.includes("--apply");

function describe(action: MadLabsSeedAction) {
  const who = `${action.identity.name ?? "?"} <${action.identity.email ?? "?"}>`;

  switch (action.type) {
    case "create":
      return `CREATE   ${who} as SUPER_ADMIN`;
    case "promote":
      return `PROMOTE  ${who} ${action.fromRole} -> SUPER_ADMIN`;
    case "unchanged":
      return `OK       ${who} is already SUPER_ADMIN`;
    case "skip":
      return `SKIP     ${who}: ${action.reason}`;
  }
}

async function seedMadLabsSuperAdmins() {
  const superAdminRole = await prisma.cmsRole.findUnique({
    where: { name: "SUPER_ADMIN" },
  });
  if (!superAdminRole) {
    throw new Error("SUPER_ADMIN role is missing. Run `bun run db:seed:cms-roles` first.");
  }

  const unitId = await madLabsUnitId();
  if (!unitId) {
    throw new Error('No active Central employee is in a "MAD Lab" / "MAD Labs" unit.');
  }

  const employees = await listActiveEmployees();
  const madLabsEmployees = employees.filter(
    (employee) => getUserUnitId(employee) === unitId,
  );

  const existingUsers = await prisma.cmsUser.findMany({
    where: {
      OR: [
        { centralUserId: { in: madLabsEmployees.map((employee) => employee.id) } },
        {
          email: {
            in: madLabsEmployees.map((employee) => employee.email.trim().toLowerCase()),
          },
        },
      ],
    },
    include: { role: true },
  });

  const actions = planMadLabsSuperAdmins({
    employees: madLabsEmployees,
    madLabsUnitId: unitId,
    existingUsers: existingUsers.map((user) => ({
      id: user.id,
      centralUserId: user.centralUserId,
      email: user.email,
      isActive: user.isActive,
      roleName: user.role.name,
    })),
  });

  console.info(`[seed] MAD Labs unit ${unitId}: ${actions.length} active employee(s).`);
  actions.forEach((action) => console.info(`[seed] ${describe(action)}`));

  const writes = actions.filter(
    (action) => action.type === "create" || action.type === "promote",
  );

  if (!shouldApply) {
    console.info(
      `[seed] Dry run: ${writes.length} change(s) planned. Re-run with --apply to write them.`,
    );
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const action of writes) {
      if (action.type === "create") {
        const user = await tx.cmsUser.create({
          data: {
            ...action.identity,
            cmsRoleId: superAdminRole.id,
            isActive: true,
            lastCentralSyncedAt: new Date(),
          },
        });
        await tx.auditLog.create({
          data: {
            action: "CMS_USER_SEEDED",
            entityType: "CmsUser",
            entityId: user.id,
            newValues: { role: "SUPER_ADMIN", source: "madlabs-seed" },
          },
        });
      } else if (action.type === "promote") {
        await tx.cmsUser.update({
          where: { id: action.userId },
          data: { cmsRoleId: superAdminRole.id },
        });
        await tx.auditLog.create({
          data: {
            action: "CMS_USER_ROLE_CHANGED",
            entityType: "CmsUser",
            entityId: action.userId,
            oldValues: { role: action.fromRole },
            newValues: { role: "SUPER_ADMIN", source: "madlabs-seed" },
          },
        });
      }
    }
  });

  console.info(`[seed] Applied ${writes.length} change(s).`);
}

seedMadLabsSuperAdmins()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("[seed] Failed to seed MAD Labs super admins.", error);
    await prisma.$disconnect().catch(() => undefined);
    process.exit(1);
  });
