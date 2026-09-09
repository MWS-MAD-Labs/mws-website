import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import {
  CmsAuthService,
  cmsAuthRepository,
} from "../services/cms-auth-service";
import { clearMadLabsUnitIdCacheForTest } from "../lib/admin-access";
import { cmsSessionUser, jsonResponse, testUser } from "./test-helpers";
import type { CentralUser } from "../types/central-types";
import type { CmsRoleName } from "../types/cms-auth-types";

const TEST_MAD_LABS_UNIT_ID = "cmsr1gmkh000akz7bzjgdv6dq";
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

function cmsUser(overrides: Partial<ReturnType<typeof baseCmsUser>> = {}) {
  return {
    ...baseCmsUser(),
    ...overrides,
  };
}

function baseCmsUser() {
  return {
    id: "cms-user-1",
    email: testUser.email,
    fullName: testUser.full_name,
    phone: null,
    cmsRole: null as CmsRoleName | null,
    isActive: true,
    deletedAt: null,
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
});

describe("CmsAuthService", () => {
  it("promotes an active MAD Labs employee to SUPER_ADMIN", async () => {
    mockCentralMadLabsDirectory();
    spyOn(cmsAuthRepository, "provisionUserFromCentralEmployee").mockResolvedValue(
      cmsUser({ cmsRole: "SUPER_ADMIN" }),
    );

    const user = await CmsAuthService.createSessionUserForCentralIdentity(
      centralEmployee(),
    );

    expect(user.role.name).toBe("SUPER_ADMIN");
    expect(user.role.permissions).toContain("*");
    expect(cmsAuthRepository.provisionUserFromCentralEmployee).toHaveBeenCalledWith(
      expect.objectContaining({ email: testUser.email }),
      "SUPER_ADMIN",
    );
  });

  it("allows a non-MAD Labs employee with CMS ADMIN role", async () => {
    mockCentralMadLabsDirectory();
    spyOn(cmsAuthRepository, "provisionUserFromCentralEmployee").mockResolvedValue(
      cmsUser({ cmsRole: "ADMIN" }),
    );

    const user = await CmsAuthService.createSessionUserForCentralIdentity(
      centralEmployee({
        unit: "Elementary",
        unit_id: "unit-elementary",
        unitId: "unit-elementary",
      }),
    );

    expect(user.role.name).toBe("ADMIN");
    expect(user.role.permissions).toContain("content:manage");
  });

  it("allows a non-MAD Labs employee with CMS VIEWER role", async () => {
    mockCentralMadLabsDirectory();
    spyOn(cmsAuthRepository, "provisionUserFromCentralEmployee").mockResolvedValue(
      cmsUser({ cmsRole: "VIEWER" }),
    );

    const user = await CmsAuthService.createSessionUserForCentralIdentity(
      centralEmployee({
        unit: "Elementary",
        unit_id: "unit-elementary",
        unitId: "unit-elementary",
      }),
    );

    expect(user.role.name).toBe("VIEWER");
    expect(user.role.permissions).toEqual(["dashboard:read"]);
  });

  it("rejects a non-MAD Labs employee with no CMS role", async () => {
    mockCentralMadLabsDirectory();
    spyOn(cmsAuthRepository, "provisionUserFromCentralEmployee").mockResolvedValue(
      cmsUser(),
    );

    await expect(
      CmsAuthService.createSessionUserForCentralIdentity(
        centralEmployee({
          unit: "Elementary",
          unit_id: "unit-elementary",
          unitId: "unit-elementary",
        }),
      ),
    ).rejects.toThrow("This account does not have an active CMS role.");
    expect(cmsAuthRepository.provisionUserFromCentralEmployee).toHaveBeenCalledWith(
      expect.objectContaining({ email: testUser.email }),
      null,
    );
  });

  it("auto-provisions a MAD Labs employee when no CMS User existed", async () => {
    mockCentralMadLabsDirectory();
    spyOn(cmsAuthRepository, "provisionUserFromCentralEmployee").mockResolvedValue(
      cmsUser({ cmsRole: "SUPER_ADMIN" }),
    );

    const user = await CmsAuthService.createSessionUserForCentralIdentity(
      centralEmployee(),
    );

    expect(user.role.name).toBe("SUPER_ADMIN");
  });

  it("rejects an inactive CMS User", async () => {
    mockCentralMadLabsDirectory();
    spyOn(cmsAuthRepository, "provisionUserFromCentralEmployee").mockResolvedValue(
      cmsUser({ isActive: false, cmsRole: "ADMIN" }),
    );

    await expect(
      CmsAuthService.createSessionUserForCentralIdentity(
        centralEmployee({
          unit: "Elementary",
          unit_id: "unit-elementary",
          unitId: "unit-elementary",
        }),
      ),
    ).rejects.toThrow("This CMS account is inactive.");
  });

  it("rejects an inactive Central employee", async () => {
    await expect(
      CmsAuthService.createSessionUserForCentralIdentity(
        centralEmployee({ status: "INACTIVE" }),
      ),
    ).rejects.toThrow("Only active employees can access CMS.");
  });

  it("rejects a Central student", async () => {
    const student: CentralUser = {
      source: "student",
      id: "student-1",
      nis: "S001",
      nisn: null,
      full_name: "Student User",
      nick_name: null,
      email: "student@millennia21.id",
      status: "ACTIVE",
      current_grade: "10",
      current_class: "A",
    };

    await expect(
      CmsAuthService.createSessionUserForCentralIdentity(student),
    ).rejects.toThrow("Only active employees can access CMS.");
  });

  it("updates role to ADMIN or VIEWER from the SUPER_ADMIN route", async () => {
    spyOn(cmsAuthRepository, "updateUserRole").mockResolvedValue(
      cmsUser({ cmsRole: "ADMIN" }),
    );

    const user = await CmsAuthService.updateUserRole(
      cmsSessionUser("SUPER_ADMIN").id,
      "ADMIN",
    );

    expect(user.role?.name).toBe("ADMIN");
    expect(cmsAuthRepository.updateUserRole).toHaveBeenCalledWith(
      "cms-user-1",
      "ADMIN",
    );
  });

  it("does not allow manual SUPER_ADMIN assignment", async () => {
    await expect(
      CmsAuthService.updateUserRole("cms-user-2", "SUPER_ADMIN"),
    ).rejects.toThrow("SUPER_ADMIN is assigned from MAD Labs unit_id.");
  });

  it("removes SUPER_ADMIN when the Central user is no longer in MAD Labs", async () => {
    mockCentralMadLabsDirectory();
    spyOn(cmsAuthRepository, "provisionUserFromCentralEmployee").mockResolvedValue(
      cmsUser({ cmsRole: "SUPER_ADMIN" }),
    );
    spyOn(cmsAuthRepository, "updateUserRole").mockResolvedValue(cmsUser());

    await expect(
      CmsAuthService.createSessionUserForCentralIdentity(
        centralEmployee({
          unit: "Elementary",
          unit_id: "unit-elementary",
          unitId: "unit-elementary",
        }),
      ),
    ).rejects.toThrow("This account does not have an active CMS role.");
    expect(cmsAuthRepository.updateUserRole).toHaveBeenCalledWith(
      "cms-user-1",
      null,
    );
  });
});
