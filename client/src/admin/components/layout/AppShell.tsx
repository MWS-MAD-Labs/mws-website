import { Bell, ChevronDown, LogOut, User} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/admin/auth/useAuth';
import Sidebar from '@/admin/components/layout/Sidebar';

type AppShellProps = {
  children: React.ReactNode;
  title: string;
};

export default function AppShell({ children, title }: AppShellProps) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const photoUrl = user?.central.photo_url;

  const initials = (user?.name ?? 'CMS')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#1F1F1E] px-6">
          <div>
            <h1 className="text-xl font-bold text-white">{title}</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
              type="button"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((current) => !current)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-white/10"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                {/* Avatar */}
                {photoUrl ? (
                  <img
                    className="h-9 w-9 rounded-full object-cover"
                    src={photoUrl}
                    alt={user?.name ?? 'CMS user'}
                  />
                ) : (
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-sm font-semibold text-white">
                    {initials}
                  </div>
                )}

                {/* Name */}
                <div className="hidden sm:block">
                  <p className="max-w-44 truncate text-sm font-semibold text-white">
                    {user?.name ?? 'CMS User'}
                  </p>
                </div>

                <ChevronDown
                  size={16}
                  className={[
                    'text-white/60 transition-transform',
                    profileOpen ? 'rotate-180' : '',
                  ].join(' ')}
                />
              </button>

              {/* Dropdown */}
              {profileOpen ? (
                <div
                  className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden border border-white/10 bg-[#151515] shadow-xl"
                  role="menu"
                >
                  {/* User Info */}
                  <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
                    {photoUrl ? (
                      <img
                        className="h-16 w-16 shrink-0 object-cover"
                        src={photoUrl}
                        alt={user?.name ?? 'CMS user'}
                      />
                    ) : (
                      <div className="grid h-16 w-16 shrink-0 place-items-center bg-white/15 text-white">
                        <User size={30} strokeWidth={1.5} />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {user?.name ?? 'CMS User'}
                      </p>

                      <p className="mt-1 truncate text-xs text-white/50">
                        {user?.role.label ?? user?.role.name ?? 'CMS User'}
                      </p>
                    </div>
                  </div>

                  {/* Menu */}
                  <div className="py-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <User size={16} strokeWidth={1.8} />
                      <span>Profile</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-white/10 py-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => void logout()}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <LogOut size={16} strokeWidth={1.8} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
