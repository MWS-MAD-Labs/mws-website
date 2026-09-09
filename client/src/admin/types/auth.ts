export type EmployeeIdentity = {
  source: "employee";
  id: string;
  employee_id: string;
  full_name: string;
  nick_name: string | null;
  email: string;
  photo_url: string | null;
  unit: string | null;
  unit_id?: string | null;
  unitId?: string | null;
  job_position: string | null;
  job_position_id?: string | null;
  jobPositionId?: string | null;
  job_level: string | null;
  job_level_id?: string | null;
  jobLevelId?: string | null;
  status: string;
  employment_type: string | null;
};

export type CmsRoleName = "SUPER_ADMIN" | "ADMIN" | "VIEWER";

export type CmsPermission =
  | "*"
  | "dashboard:read"
  | "content:manage"
  | "users:manage";

export type CmsRole = {
  name: CmsRoleName;
  label: string | null;
  permissions: CmsPermission[];
};

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: CmsRole;
  central: EmployeeIdentity;
};

export function hasCmsPermission(
  user: AuthUser | null,
  permission: CmsPermission,
): boolean {
  return Boolean(
    user &&
      (user.role.name === "SUPER_ADMIN" ||
        user.role.permissions.includes("*") ||
        user.role.permissions.includes(permission)),
  );
}
