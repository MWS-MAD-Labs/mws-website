import { useEffect, useState } from "react";
import {
  adminApi,
  type CmsRoleListItem,
  type CmsUserListItem,
} from "@/admin/api/adminApi";
import AppShell from "@/admin/components/layout/AppShell";
import type { CmsRoleName } from "@/admin/types/auth";

type CmsUsersState = {
  users: CmsUserListItem[];
  roles: CmsRoleListItem[];
};

export default function CmsUsersPage() {
  const [data, setData] = useState<CmsUsersState>({ users: [], roles: [] });
  const [error, setError] = useState("");
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    adminApi
      .users()
      .then((usersData) => {
        if (!cancelled) setData(usersData);
      })
      .catch((usersError) => {
        console.error("CMS users request failed:", usersError);
        console.log(usersError)
        if (!cancelled) setError("CMS users could not be loaded.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const updateRole = async (userId: string, roleName: string) => {
    setSavingUserId(userId);
    setError("");

    try {
      const updatedUser = await adminApi.updateUserRole(
        userId,
        roleName ? (roleName as CmsRoleName) : null,
      );

      setData((current) => ({
        ...current,
        users: current.users.map((user) =>
          user.id === updatedUser.id ? updatedUser : user,
        ),
      }));
    } catch (roleError) {
      console.error("CMS role update failed:", roleError);
      setError("Role could not be updated.");
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <AppShell
      eyebrow="MWS CMS"
      title="CMS Users"
      action={
        <span className="rounded-md border border-[rgba(36,23,24,0.14)] px-3 py-2 text-xs font-semibold text-[#625759]">
          Roles from CMS DB
        </span>
      }
    >
      <section className="flex-1 p-6">
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-[#7e1518]/20 bg-[#7e1518]/10 px-4 py-3 text-sm text-[#7e1518]"
          >
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-[rgba(36,23,24,0.14)] bg-white shadow-sm">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="border-b border-[rgba(36,23,24,0.14)] bg-[#faf8f3] text-xs uppercase text-[#625759]">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Role</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[rgba(36,23,24,0.08)] last:border-b-0"
                >
                  <td className="px-4 py-3 font-medium text-[#241718]">
                    {user.fullName}
                  </td>
                  <td className="px-4 py-3 text-[#625759]">{user.email}</td>
                  <td className="px-4 py-3 text-[#625759]">
                    {user.isActive ? "Active" : "Inactive"}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role?.name ?? ""}
                      disabled={savingUserId === user.id}
                      onChange={(event) =>
                        void updateRole(user.id, event.currentTarget.value)
                      }
                      className="h-9 w-full rounded-md border border-[rgba(36,23,24,0.18)] bg-white px-3 text-sm text-[#241718] outline-none focus:border-[#7e1518]"
                    >
                      <option value="">No CMS access</option>
                      {data.roles.map((role) => (
                        <option key={role.name} value={role.name}>
                          {role.label ?? role.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!data.users.length && (
            <div className="px-4 py-6 text-sm text-[#625759]">
              No CMS users found.
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
