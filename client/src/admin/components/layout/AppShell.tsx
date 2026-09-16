import { Bell } from "lucide-react";
import { useAuth } from "@/admin/auth/useAuth";
import Sidebar from "@/admin/components/layout/Sidebar";

type AppShellProps = {
  children: React.ReactNode;
  title: string;
};

export default function AppShell({
  children,
  title,
}: AppShellProps) {
  const { user } = useAuth();
  const photoUrl = user?.central.photo_url;
  const initials = (user?.name ?? "CMS")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-[#faf8f3]">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 flex items-center justify-between border-b border-[rgba(36,23,24,0.14)] bg-white px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="grid h-10 w-10 place-items-center rounded-full border border-[rgba(36,23,24,0.14)] text-[#625759] hover:bg-[#241718]/5"
              type="button"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>

            <div className="flex items-center gap-3">
              {photoUrl ? (
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={photoUrl}
                  alt={user?.name ?? "CMS user"}
                />
              ) : (
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[#241718] text-sm font-semibold text-white">
                  {initials}
                </div>
              )}

              <div className="hidden text-right sm:block">
                <p className="max-w-44 truncate text-sm font-semibold text-[#241718]">
                  {user?.name ?? "CMS User"}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
