import { useEffect, useMemo, useState, type FormEvent } from "react";
import { UserPlus } from "lucide-react";
import {
  adminApi,
  type CmsInvitationListItem,
  type CmsRoleListItem,
  type CmsUserListItem,
} from "@/admin/api/adminApi";
import AppShell from "@/admin/components/layout/AppShell";
import Button from "@/admin/components/ui/Button";
import Field from "@/admin/components/ui/Field";
import Modal from "@/admin/components/ui/Modal";
import Panel from "@/admin/components/ui/Panel";
import Select from "@/admin/components/ui/Select";
import StatusMessage from "@/admin/components/ui/StatusMessage";
import type { CmsRoleName } from "@/admin/types/auth";

type CmsUsersState = {
  users: CmsUserListItem[];
  invitations: CmsInvitationListItem[];
  roles: CmsRoleListItem[];
};

const inputClass =
  "rounded-lg border border-[rgba(36,23,24,0.14)] px-3 py-2 text-sm outline-none focus:border-[#7e1518]";

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function CmsUsersPage() {
  const [data, setData] = useState<CmsUsersState>({
    users: [],
    invitations: [],
    roles: [],
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  async function loadUsers() {
    const usersData = await adminApi.users();
    setData(usersData);
  }

  useEffect(() => {
    let cancelled = false;

    adminApi
      .users()
      .then((usersData) => {
        if (!cancelled) setData(usersData);
      })
      .catch((error) => {
        if (!cancelled) {
          setMessage(
            error instanceof Error ? error.message : "CMS users could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const adminRoles = useMemo(
    () => data.roles.filter((role) => role.name === "ADMIN"),
    [data.roles],
  );

  async function updateRole(user: CmsUserListItem, roleName: string) {
    if (!roleName || user.role?.name === roleName) return;
    const confirmed = window.confirm(`Change ${user.name}'s role to ${roleName}?`);
    if (!confirmed) return;

    setSavingUserId(user.id);
    setMessage(null);

    try {
      const updatedUser = await adminApi.updateUserRole(
        user.id,
        roleName as CmsRoleName,
      );
      setData((current) => ({
        ...current,
        users: current.users.map((item) =>
          item.id === updatedUser.id ? updatedUser : item,
        ),
      }));
      setMessage("CMS user role updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Role could not be updated.");
    } finally {
      setSavingUserId(null);
    }
  }

  async function updateStatus(user: CmsUserListItem) {
    const nextStatus = !user.isActive;
    const confirmed = window.confirm(
      `${nextStatus ? "Reactivate" : "Deactivate"} ${user.name}?`,
    );
    if (!confirmed) return;

    setSavingUserId(user.id);
    setMessage(null);

    try {
      const updatedUser = await adminApi.updateUserStatus(user.id, nextStatus);
      setData((current) => ({
        ...current,
        users: current.users.map((item) =>
          item.id === updatedUser.id ? updatedUser : item,
        ),
      }));
      setMessage(`CMS user ${nextStatus ? "reactivated" : "deactivated"}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Status could not be updated.");
    } finally {
      setSavingUserId(null);
    }
  }

  async function inviteAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsInviting(true);
    setMessage(null);

    try {
      await adminApi.inviteCmsAdmin(inviteEmail);
      await loadUsers();
      setInviteEmail("");
      setInviteOpen(false);
      setMessage("Admin invitation created.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Admin invitation could not be created.",
      );
    } finally {
      setIsInviting(false);
    }
  }

  async function revokeInvitation(invitation: CmsInvitationListItem) {
    const confirmed = window.confirm(`Revoke invitation for ${invitation.email}?`);
    if (!confirmed) return;

    try {
      await adminApi.revokeCmsInvitation(invitation.id);
      await loadUsers();
      setMessage("Invitation revoked.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Invitation could not be revoked.");
    }
  }

  return (
    <AppShell title="CMS Users">
      <section className="space-y-5 p-6">
        {message ? <StatusMessage>{message}</StatusMessage> : null}

        <Panel
          title="CMS Users"
          description="Manage approved CMS accounts and content access."
          action={
            <Button onClick={() => setInviteOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Admin
            </Button>
          }
        >
          {isLoading ? <p className="text-sm text-[#625759]">Loading CMS users...</p> : null}

          {!isLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse text-left text-sm">
                <thead className="border-b border-[rgba(36,23,24,0.14)] text-xs uppercase text-[#625759]">
                  <tr>
                    <th className="px-3 py-3 font-semibold">User</th>
                    <th className="px-3 py-3 font-semibold">Unit</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-3 py-3 font-semibold">Last Sync</th>
                    <th className="px-3 py-3 font-semibold">Role</th>
                    <th className="px-3 py-3 font-semibold">access</th>
                    <th className="px-3 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((user) => {
                    console.log('USER DATA:', user);

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-[rgba(36,23,24,0.08)] last:border-b-0"
                      >
                        <td className="px-3 py-3">
                          <p className="font-medium text-[#241718]">{user.name}</p>
                          <p className="text-xs text-[#625759]">{user.email ?? '-'}</p>
                        </td>

                        <td className="px-3 py-3 text-[#625759]">{user.unit}</td>

                        <td className="px-3 py-3">
                          <span className={user.isActive ? 'text-emerald-700' : 'text-[#7e1518]'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-[#625759]">
                          {formatDate(user.lastCentralSyncedAt)}
                        </td>

                        <td className="px-3 py-3">
                          <Select
                            value={user.role?.name ?? ''}
                            disabled={savingUserId === user.id || user.role?.name === 'SUPER_ADMIN'}
                            onChange={(event) => void updateRole(user, event.currentTarget.value)}
                          >
                            {user.role?.name === 'SUPER_ADMIN' ? (
                              <option value="SUPER_ADMIN">Super Admin</option>
                            ) : null}

                            {adminRoles.map((role) => (
                              <option key={role.name} value={role.name}>
                                {role.label ?? role.name}
                              </option>
                            ))}
                          </Select>
                        </td>

                        <td></td>

                        <td className="px-3 py-3">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={savingUserId === user.id}
                            onClick={() => void updateStatus(user)}
                          >
                            {user.isActive ? 'Deactivate' : 'Reactivate'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {!data.users.length ? (
                <p className="px-3 py-6 text-sm text-[#625759]">No CMS users found.</p>
              ) : null}
            </div>
          ) : null}
        </Panel>

        <Panel title="Pending Invitations">
          <div className="space-y-3">
            {data.invitations
              .filter((invitation) => invitation.status === 'PENDING')
              .map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(36,23,24,0.08)] pb-3 last:border-b-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-[#241718]">{invitation.email}</p>
                    <p className="text-sm text-[#625759]">
                      {invitation.role?.label ?? invitation.role?.name ?? 'Admin'} · Invited{' '}
                      {formatDate(invitation.createdAt)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void revokeInvitation(invitation)}
                  >
                    Revoke
                  </Button>
                </div>
              ))}
            {!data.invitations.some((invitation) => invitation.status === 'PENDING') ? (
              <p className="text-sm text-[#625759]">No pending invitations.</p>
            ) : null}
          </div>
        </Panel>
      </section>

      <Modal open={inviteOpen} title="Invite Admin" onClose={() => setInviteOpen(false)}>
        <form className="space-y-4" onSubmit={inviteAdmin}>
          <Field label="Email Address">
            <input
              className={inputClass}
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.currentTarget.value)}
              required
            />
          </Field>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button disabled={isInviting} type="submit">
              {isInviting ? 'Inviting...' : 'Invite Admin'}
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
