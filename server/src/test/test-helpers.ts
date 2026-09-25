import type { CentralUser } from "../types/central-types";
import type { CmsRoleName, CmsSessionUser } from "../types/cms-auth-types";

export const testUser: CentralUser = {
  source: "employee",
  id: "emp-1",
  employee_id: "E001",
  full_name: "Test Employee",
  nick_name: null,
  email: "employee@millennia21.id",
  photo_url: null,
  unit: "MAD Lab",
  unit_id: "unit-mad-lab",
  unitId: "unit-mad-lab",
  job_position: null,
  job_level: null,
  status: "ACTIVE",
  employment_type: null,
};

export function cmsSessionUser(
  roleName: CmsRoleName = "SUPER_ADMIN",
): CmsSessionUser {
  return {
    id: "cms-user-1",
    centralUserId: testUser.id,
    email: testUser.email,
    name: testUser.full_name,
    unitId: testUser.unitId || testUser.unit_id || "unit-mad-lab",
    isActive: true,
    role: {
      name: roleName,
      label: roleName,
      permissions:
        roleName === "SUPER_ADMIN"
          ? ["*"]
          : ["dashboard:read", "content:manage"],
    },
    central: testUser as Extract<CentralUser, { source: "employee" }>,
  };
}

export function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
