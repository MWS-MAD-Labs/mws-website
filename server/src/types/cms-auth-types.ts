import type { CentralUser } from "./central-types";

export const CMS_ROLE_NAMES = ["SUPER_ADMIN", "ADMIN", "VIEWER"] as const;

export type CmsRoleName = (typeof CMS_ROLE_NAMES)[number];

export type CmsPermission =
  | "*"
  | "dashboard:read"
  | "content:manage"
  | "users:manage";

export type CmsSessionRole = {
  name: CmsRoleName;
  label: string | null;
  permissions: CmsPermission[];
};

export type CmsSessionUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: CmsSessionRole;
  central: Extract<CentralUser, { source: "employee" }>;
};

export function isCmsRoleName(value: string): value is CmsRoleName {
  return CMS_ROLE_NAMES.includes(value as CmsRoleName);
}
