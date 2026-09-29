import { ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import type { MenuItem } from '@/admin/config/navigation';
import { hasCmsPermission } from '@/admin/types/auth';
import { useAuth } from '@/admin/auth/useAuth';

type AuthUser = ReturnType<typeof useAuth>['user'];

export type SidebarFlyoutPosition = {
  top: number;
  left: number;
};

type SidebarFlyoutProps = {
  item: MenuItem;
  position: SidebarFlyoutPosition;
  onClose: () => void;
};

function isMenuItemVisible(item: MenuItem, user: AuthUser): boolean {
  if (!item.enabled) return false;

  if (item.requiredPermission && !hasCmsPermission(user, item.requiredPermission)) {
    return false;
  }

  if (!item.children?.length) return true;

  return item.children.some((child) => isMenuItemVisible(child, user));
}

export default function SidebarFlyout({ item, position, onClose }: SidebarFlyoutProps) {
  const { user } = useAuth();

  const visibleChildren = item.children?.filter((child) => isMenuItemVisible(child, user));

  if (!visibleChildren?.length) {
    return null;
  }

  return (
    <div
      className="fixed z-[1000] w-56 overflow-y-auto rounded-md border border-white/10 bg-[#1F1F1E] p-1.5 shadow-xl"
      style={{
        top: position.top,
        left: position.left,
        maxHeight: 'calc(100vh - ' + position.top + 'px - 8px)',
      }}
      onMouseLeave={onClose}
    >
      <div className="border-b border-white/10 px-3 py-2">
        <p className="text-xs font-semibold text-white">{item.label}</p>
      </div>

      <div className="mt-1 space-y-0.5">
        {visibleChildren.map((child) => (
          <SidebarFlyoutItem
            key={child.href ?? child.label}
            item={child}
            user={user}
            onClose={onClose}
          />
        ))}
      </div>
    </div>
  );
}

function SidebarFlyoutItem({
  item,
  user,
  onClose,
}: {
  item: MenuItem;
  user: AuthUser;
  onClose: () => void;
}) {
  const Icon = item.Icon;

  const visibleChildren = item.children?.filter((child) => isMenuItemVisible(child, user));

  if (visibleChildren?.length) {
    return (
      <div>
        <div className="flex h-9 items-center gap-2 rounded-md px-3 text-sm text-white">
          <Icon size={16} strokeWidth={1.8} />

          <span className="flex-1 truncate">{item.label}</span>

          <ChevronRight size={14} strokeWidth={1.8} className="text-white/50" />
        </div>

        <div className="ml-3 border-l border-white/10 pl-1">
          {visibleChildren.map((child) => (
            <SidebarFlyoutItem
              key={child.href ?? child.label}
              item={child}
              user={user}
              onClose={onClose}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!item.href) {
    return null;
  }

  return (
    <NavLink
      to={item.href}
      onClick={onClose}
      className={({ isActive }) =>
        [
          'flex h-9 items-center gap-2 rounded-md px-3 text-sm transition-colors',
          isActive
            ? 'bg-white/15 font-semibold text-white'
            : 'text-white/80 hover:bg-white/10 hover:text-white',
        ].join(' ')
      }
    >
      <Icon size={16} strokeWidth={1.8} />

      <span className="truncate">{item.label}</span>
    </NavLink>
  );
}
