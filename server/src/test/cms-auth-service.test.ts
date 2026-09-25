import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import type { CmsRole, CmsUser, CmsUserInvitation } from "@prisma/client";
import { clearMadLabsUnitIdCacheForTest } from "../lib/admin-access";
import {
  CmsUserRepository,
  type CmsInvitationWithRelations,
  type CmsUserWithRole,
} from "../repositories/cms-user-repository";
import { CmsAuthService } from "../services/cms-auth-service";
import type { CentralUser } from "../types/central-types";
import { jsonResponse, testUser } from "./test-helpers";

const TEST_MAD_LABS_UNIT_ID = "unit-mad-lab";
const originalFetch = global.fetch;

function centralEmployee(
  overrides: Partial<Extract<CentralUser, { source: "employee" }>> = {},
): Extract<CentralUser, { source: "employee" }> {
  return {
    ...(testUser as Extract<CentralUser, { source: "employee" }>),
    unit: "MAD Lab",
    unit_id: TEST_MAD_LABS_UNIT_ID,
    unitId: TEST_MAD_LABS_UNIT_ID,
    ...overrides,
  };
}

function role(overrides: Partial<CmsRole> = {}): CmsRole {
  const now = new Date("2026-01-01T00:00:00.000Z");
  return {
    id: "role-super-admin",
    name: "SUPER_ADMIN",
    description: "Super Admin",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function cmsUser(overrides: Partial<CmsUser> = {}): CmsUser {
  const now = new Date("2026-01-01T00:00:00.000Z");
  return {
    id: "cms-user-1",
    centralUserId: testUser.id,
    email: testUser.email,
    name: testUser.full_name,
    unitId: TEST_MAD_LABS_UNIT_ID,
    cmsRoleId: "role-super-admin",
    isActive: true,
    lastCentralSyncedAt: null,
    deactivatedAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function cmsUserWithRole(
  userOverrides: Partial<CmsUser> = {},
  roleOverrides: Partial<CmsRole> = {},
): CmsUserWithRole {
  const userRole = role(roleOverrides);
  return {
    ...cmsUser({ cmsRoleId: userRole.id, ...userOverrides }),
    role: userRole,
  };
}

function invitation(
  overrides: Partial<CmsUserInvitation> = {},
  roleOverrides: Partial<CmsRole> = {},
): CmsInvitationWithRelations {
  const now = new Date("2026-01-01T00:00:00.000Z");
  const invitationRole = role({ id: "role-admin", name: "ADMIN", ...roleOverrides });
  return {
    id: "invitation-1",
    email: testUser.email,
    centralUserId: null,
    name: null,
    unitId: null,
    cmsRoleId: invitationRole.id,
    status: "PENDING",
    invitedById: null,
    acceptedUserId: null,
    expiresAt: null,
    acceptedAt: null,
    createdAt: now,
    updatedAt: now,
    role: invitationRole,
    invitedBy: null,
    acceptedUser: null,
    ...overrides,
  };
}

function mockCentralMadLabsDirectory(unitId = TEST_MAD_LABS_UNIT_ID) {
  global.fetch = (async () =>
    jsonResponse(200, {
      success: true,
      data: [
        {
          id: "emp-mad",
          employee_id: "15.26.905",
          full_name: "MAD Labs User",
          nick_name: "MAD",
          email: "mad@millennia21.id",
          photo_url: null,
          unit: "MAD Lab",
          unit_id: unitId,
          job_position: "Developer",
          job_level: "Staff",
          status: "ACTIVE",
          employment_type: "PROBATION",
        },
      ],
      paging: { current_page: 1, total_page: 1 },
    })) as unknown as typeof fetch;
}

afterEach(() => {
  mock.restore();
  clearMadLabsUnitIdCacheForTest();
  global.fetch = originalFetch;
  delete process.env.CMS_BOOTSTRAP_SUPER_ADMIN_EMAILS;
  delete process.env.CMS_BOOTSTRAP_SUPER_ADMIN_CENTRAL_IDS;
});

describe("CmsAuthService", () => {
  it("returns an existing active CMS user without creating or changing role", async () => {
    const existingUser = cmsUserWithRole({}, { name: "ADMIN", id: "role-admin" });
    const findSpy = spyOn(
      CmsUserRepository,
      "findByCentralUserId",
    ).mockResolvedValue(existingUser);
    const createSpy = spyOn(CmsUserRepository, "create");
    const updateSpy = spyOn(CmsUserRepository, "update");

    const user = await CmsAuthService.createSessionUserForCentralIdentity(
      centralEmployee(),
    );

    expect(user.id).toBe(existingUser.id);
    expect(user.centralUserId).toBe(testUser.id);
    expect(user.role.name).toBe("ADMIN");
    expect(findSpy).toHaveBeenCalledWith(testUser.id);
    expect(createSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("rejects an existing inactive CMS user", async () => {
    spyOn(CmsUserRepository, "findByCentralUserId").mockResolvedValue(
      cmsUserWithRole({ isActive: false }, { name: "ADMIN", id: "role-admin" }),
    );
    const createSpy = spyOn(CmsUserRepository, "create");

    await expect(
      CmsAuthService.createSessionUserForCentralIdentity(centralEmployee()),
    ).rejects.toThrow("This CMS account is inactive.");
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("rejects a new active MAD Labs Central user without invitation or bootstrap policy", async () => {
    mockCentralMadLabsDirectory();
    spyOn(CmsUserRepository, "findByCentralUserId").mockResolvedValue(null);
    spyOn(CmsUserRepository, "findByEmail").mockResolvedValue(null);
    spyOn(CmsUserRepository, "findPendingInvitationForIdentity").mockResolvedValue(
      null,
    );
    const roleSpy = spyOn(CmsUserRepository, "findRoleByName");
    const createSpy = spyOn(CmsUserRepository, "create");

    await expect(
      CmsAuthService.createSessionUserForCentralIdentity(centralEmployee()),
    ).rejects.toThrow("This account does not have CMS access.");

    expect(roleSpy).not.toHaveBeenCalled();
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("accepts a pending ADMIN invitation for a new active Central user", async () => {
    const pendingInvitation = invitation();
    const created = cmsUser({
      id: "cms-user-invited",
      cmsRoleId: pendingInvitation.cmsRoleId,
    });
    spyOn(CmsUserRepository, "findByCentralUserId").mockResolvedValue(null);
    spyOn(CmsUserRepository, "findByEmail").mockResolvedValue(null);
    spyOn(CmsUserRepository, "findPendingInvitationForIdentity").mockResolvedValue(
      pendingInvitation,
    );
    const createSpy = spyOn(CmsUserRepository, "create").mockResolvedValue(created);
    const updateInvitationSpy = spyOn(
      CmsUserRepository,
      "updateInvitation",
    ).mockResolvedValue({
      ...pendingInvitation,
      status: "ACCEPTED",
      acceptedUserId: created.id,
      acceptedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const user = await CmsAuthService.createSessionUserForCentralIdentity(
      centralEmployee(),
    );

    expect(createSpy).toHaveBeenCalledWith({
      centralUserId: testUser.id,
      email: testUser.email,
      name: testUser.full_name,
      unitId: TEST_MAD_LABS_UNIT_ID,
      cmsRoleId: pendingInvitation.cmsRoleId,
      isActive: true,
      lastCentralSyncedAt: expect.any(Date),
    });
    expect(updateInvitationSpy).toHaveBeenCalledWith(
      pendingInvitation.id,
      expect.objectContaining({
        status: "ACCEPTED",
        acceptedUserId: created.id,
      }),
    );
    expect(user.role.name).toBe("ADMIN");
  });

  it("bootstraps an explicitly allowed active MAD Labs Central user as SUPER_ADMIN", async () => {
    process.env.CMS_BOOTSTRAP_SUPER_ADMIN_EMAILS = testUser.email;
    mockCentralMadLabsDirectory();
    const superAdminRole = role();
    spyOn(CmsUserRepository, "findByCentralUserId").mockResolvedValue(null);
    spyOn(CmsUserRepository, "findByEmail").mockResolvedValue(null);
    spyOn(CmsUserRepository, "findPendingInvitationForIdentity").mockResolvedValue(
      null,
    );
    const roleSpy = spyOn(CmsUserRepository, "findRoleByName").mockResolvedValue(
      superAdminRole,
    );
    const createSpy = spyOn(CmsUserRepository, "create").mockResolvedValue(
      cmsUser({ cmsRoleId: superAdminRole.id }),
    );

    const user = await CmsAuthService.createSessionUserForCentralIdentity(
      centralEmployee(),
    );

    expect(roleSpy).toHaveBeenCalledWith("SUPER_ADMIN");
    expect(createSpy).toHaveBeenCalledWith({
      centralUserId: testUser.id,
      email: testUser.email,
      name: testUser.full_name,
      unitId: TEST_MAD_LABS_UNIT_ID,
      cmsRoleId: superAdminRole.id,
      isActive: true,
      lastCentralSyncedAt: expect.any(Date),
    });
    expect(user.role.name).toBe("SUPER_ADMIN");
    expect(user.role.permissions).toEqual(["*"]);
  });

  it("rejects a new active non-MAD-Labs Central user without creating CMS user", async () => {
    mockCentralMadLabsDirectory();
    spyOn(CmsUserRepository, "findByCentralUserId").mockResolvedValue(null);
    spyOn(CmsUserRepository, "findByEmail").mockResolvedValue(null);
    spyOn(CmsUserRepository, "findPendingInvitationForIdentity").mockResolvedValue(
      null,
    );
    const roleSpy = spyOn(CmsUserRepository, "findRoleByName");
    const createSpy = spyOn(CmsUserRepository, "create");

    await expect(
      CmsAuthService.createSessionUserForCentralIdentity(
        centralEmployee({
          unit: "Elementary",
          unit_id: "unit-elementary",
          unitId: "unit-elementary",
        }),
      ),
    ).rejects.toThrow("This account does not have CMS access.");
    expect(roleSpy).not.toHaveBeenCalled();
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("rejects an inactive Central employee without creating CMS user", async () => {
    const findSpy = spyOn(CmsUserRepository, "findByCentralUserId");
    const createSpy = spyOn(CmsUserRepository, "create");

    await expect(
      CmsAuthService.createSessionUserForCentralIdentity(
        centralEmployee({ status: "INACTIVE" }),
      ),
    ).rejects.toThrow("Only active employees can access CMS.");
    expect(findSpy).not.toHaveBeenCalled();
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("rejects a missing Central identity", async () => {
    const findSpy = spyOn(CmsUserRepository, "findByCentralUserId");
    const createSpy = spyOn(CmsUserRepository, "create");

    await expect(
      CmsAuthService.createSessionUserForCentralIdentity(null),
    ).rejects.toThrow("Central identity was not found.");
    expect(findSpy).not.toHaveBeenCalled();
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("fails clearly when SUPER_ADMIN role is unavailable for bootstrap", async () => {
    process.env.CMS_BOOTSTRAP_SUPER_ADMIN_EMAILS = testUser.email;
    mockCentralMadLabsDirectory();
    spyOn(CmsUserRepository, "findByCentralUserId").mockResolvedValue(null);
    spyOn(CmsUserRepository, "findByEmail").mockResolvedValue(null);
    spyOn(CmsUserRepository, "findPendingInvitationForIdentity").mockResolvedValue(
      null,
    );
    spyOn(CmsUserRepository, "findRoleByName").mockResolvedValue(null);
    const createSpy = spyOn(CmsUserRepository, "create");

    await expect(
      CmsAuthService.createSessionUserForCentralIdentity(centralEmployee()),
    ).rejects.toThrow("SUPER_ADMIN CMS role is not configured.");
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("keeps an existing ADMIN role for a MAD Labs user", async () => {
    mockCentralMadLabsDirectory();
    spyOn(CmsUserRepository, "findByCentralUserId").mockResolvedValue(
      cmsUserWithRole(
        { cmsRoleId: "role-admin" },
        { id: "role-admin", name: "ADMIN", description: "Admin" },
      ),
    );
    const roleSpy = spyOn(CmsUserRepository, "findRoleByName");
    const createSpy = spyOn(CmsUserRepository, "create");
    const updateSpy = spyOn(CmsUserRepository, "update");

    const user = await CmsAuthService.createSessionUserForCentralIdentity(
      centralEmployee(),
    );

    expect(user.role.name).toBe("ADMIN");
    expect(roleSpy).not.toHaveBeenCalled();
    expect(createSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
  });
});
