import { useEffect, useMemo, useState, type FocusEvent, type MouseEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

import { useAuth } from '@/admin/auth/useAuth';
import menuSections, { type MenuItem, type MenuSection } from '@/admin/config/navigation';
import { hasCmsPermission } from '@/admin/types/auth';
import SidebarFlyout, { type SidebarFlyoutPosition } from '@/admin/components/ui/SidebarFlyout';

type AuthUser = ReturnType<typeof useAuth>['user'];

type FlyoutState = {
  label: string;
  position: SidebarFlyoutPosition;
} | null;

function isMenuItemVisible(item: MenuItem, user: AuthUser): boolean {
  if (!item.enabled) return false;

  if (item.requiredPermission && !hasCmsPermission(user, item.requiredPermission)) {
    return false;
  }

  if (!item.children?.length) {
    return true;
  }

  return item.children.some((child) => isMenuItemVisible(child, user));
}

function menuHrefs(items: MenuItem[]): string[] {
  return items.flatMap((item) => [
    ...(item.href ? [item.href] : []),
    ...menuHrefs(item.children ?? []),
  ]);
}

const allMenuHrefs = menuHrefs(menuSections.flatMap((section) => section.items));

/**
 * The menu entry a page belongs to: the longest href that is the path itself or
 * a parent of it. `/admin/news/123/edit` highlights Posts, and `/admin` (the
 * dashboard) only matches itself instead of every CMS page.
 */
function activeMenuHref(pathname: string): string | undefined {
  return allMenuHrefs
    .filter((href) => pathname === href || (href !== '/admin' && pathname.startsWith(`${href}/`)))
    .sort((a, b) => b.length - a.length)[0];
}

function hasActiveChild(item: MenuItem, pathname: string): boolean {
  const activeHref = activeMenuHref(pathname);
  return Boolean(
    item.children?.some((child) => child.href === activeHref || hasActiveChild(child, pathname)),
  );
}

function visibleSection(section: MenuSection, user: AuthUser) {
  const items = section.items.filter((item) => isMenuItemVisible(item, user));

  return items.length
    ? {
        ...section,
        items,
      }
    : null;
}

export function SidebarMenu({ collapsed = false }: { collapsed?: boolean }) {
  const location = useLocation();
  const { user } = useAuth();

  const activeParentLabels = useMemo(
    () =>
      menuSections
        .flatMap((section) => section.items)
        .filter((item) => hasActiveChild(item, location.pathname))
        .map((item) => item.label),
    [location.pathname],
  );

  const [openMenus, setOpenMenus] = useState<string[]>(activeParentLabels);

  const [flyout, setFlyout] = useState<FlyoutState>(null);

  const visibleMenuSections = menuSections
    .map((section) => visibleSection(section, user))
    .filter(Boolean) as MenuSection[];

  useEffect(() => {
    if (!activeParentLabels.length) return;

    queueMicrotask(() => {
      setOpenMenus((current) => Array.from(new Set([...current, ...activeParentLabels])));
    });
  }, [activeParentLabels]);

  useEffect(() => {
    if (!collapsed) {
      queueMicrotask(() => setFlyout(null));
    }
  }, [collapsed]);

  useEffect(() => {
    queueMicrotask(() => setFlyout(null));
  }, [location.pathname]);

  const toggleMenu = (label: string) => {
    setOpenMenus((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label],
    );
  };

  const openFlyout = (
    event: MouseEvent<HTMLButtonElement> | FocusEvent<HTMLButtonElement>,
    label: string,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();

    setFlyout({
      label,
      position: {
        top: rect.top,
        left: rect.right + 8,
      },
    });
  };

  const closeFlyout = () => {
    setFlyout(null);
  };

  const flyoutItem = flyout
    ? visibleMenuSections
        .flatMap((section) => section.items)
        .find((item) => item.label === flyout.label)
    : null;

  return (
    <div className="relative z-10 h-full">
      <nav className="h-full overflow-y-auto px-3 py-5">
        <div className="space-y-1">
          {visibleMenuSections.map((section) =>
            section.items.map((item) => (
              <SidebarMenuItem
                key={item.href ?? item.label}
                collapsed={collapsed}
                item={item}
                level={0}
                openMenus={openMenus}
                toggleMenu={toggleMenu}
                user={user}
                openFlyout={openFlyout}
              />
            )),
          )}
        </div>
      </nav>

      {collapsed && flyout && flyoutItem ? (
        <SidebarFlyout item={flyoutItem} position={flyout.position} onClose={closeFlyout} />
      ) : null}
    </div>
  );
}

function SidebarMenuItem({
  collapsed,
  item,
  level,
  openMenus,
  toggleMenu,
  user,
  openFlyout,
}: {
  collapsed: boolean;
  item: MenuItem;
  level: number;
  openMenus: string[];
  toggleMenu: (label: string) => void;
  user: AuthUser;
  openFlyout: (
    event: MouseEvent<HTMLButtonElement> | FocusEvent<HTMLButtonElement>,
    label: string,
  ) => void;
}) {
  const location = useLocation();
  const Icon = item.Icon;

  const visibleChildren = item.children?.filter((child) => isMenuItemVisible(child, user));

  const hasChildren = Boolean(visibleChildren?.length);

  const isOpen = openMenus.includes(item.label);

  const isActiveParent =
    item.href === activeMenuHref(location.pathname) || hasActiveChild(item, location.pathname);

  const leftPadding = collapsed
    ? 'px-0 justify-center'
    : level === 0
      ? 'px-3'
      : level === 1
        ? 'pl-8 pr-3'
        : 'pl-11 pr-3';

  /*
   * Parent menu with children
   */
  if (hasChildren) {
    return (
      <div className="relative">
        <div
          className={[
            'flex h-9 w-full items-center rounded-md',
            'text-sm font-medium',
            'transition-colors',
            isActiveParent
              ? 'bg-[#333A48] text-white'
              : 'text-[#AEB7C4] hover:bg-[#333A48] hover:text-white',
          ].join(' ')}
        >
          {/* Parent navigation */}
          {item.href ? (
            <NavLink
              to={item.href}
              title={collapsed ? item.label : undefined}
              className={[
                'flex h-full min-w-0 flex-1 items-center gap-2',
                collapsed ? 'justify-center' : 'justify-start',
                leftPadding,
              ].join(' ')}
            >
              <Icon size={level === 0 ? 17 : 16} strokeWidth={1.8} />

              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </NavLink>
          ) : (
            <button
              type="button"
              title={collapsed ? item.label : undefined}
              onClick={() => {
                if (!collapsed) {
                  toggleMenu(item.label);
                }
              }}
              className={[
                'flex h-full min-w-0 flex-1 items-center gap-2',
                collapsed ? 'justify-center' : 'justify-start',
                leftPadding,
              ].join(' ')}
            >
              <Icon size={level === 0 ? 17 : 16} strokeWidth={1.8} />

              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </button>
          )}

          {/* Expanded sidebar toggle */}
          {!collapsed ? (
            <button
              type="button"
              aria-label={isOpen ? `Collapse ${item.label}` : `Expand ${item.label}`}
              onClick={() => toggleMenu(item.label)}
              className="flex h-full w-8 shrink-0 items-center justify-center rounded-r-md text-[#AEB7C4] transition-colors hover:bg-[#333A48] hover:text-white"
            >
              <ChevronDown
                size={15}
                strokeWidth={1.8}
                className={['transition-transform duration-200', isOpen ? 'rotate-180' : ''].join(
                  ' ',
                )}
              />
            </button>
          ) : (
            <button
              type="button"
              aria-label={`Open ${item.label} menu`}
              onMouseEnter={(event) => openFlyout(event, item.label)}
              onClick={(event) => openFlyout(event, item.label)}
              onFocus={(event) => openFlyout(event, item.label)}
              className="absolute inset-0 z-10 rounded-md focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <span className="sr-only">Open {item.label} menu</span>
            </button>
          )}
        </div>

        {/* Expanded sidebar submenu */}
        {!collapsed && isOpen ? (
          <div className="mt-1 space-y-1">
            {visibleChildren?.map((child) => (
              <SidebarMenuItem
                key={child.href ?? child.label}
                collapsed={false}
                item={child}
                level={level + 1}
                openMenus={openMenus}
                toggleMenu={toggleMenu}
                user={user}
                openFlyout={openFlyout}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  /*
   * Leaf menu item
   */
  if (!item.href) {
    return null;
  }

  return (
    <NavLink
      to={item.href}
      end
      title={collapsed ? item.label : undefined}
      className={() =>
        [
          'flex h-9 items-center gap-2 rounded-md',
          'text-sm transition-colors',
          level === 0 ? 'font-medium' : '',
          leftPadding,
          item.href === activeMenuHref(location.pathname)
            ? 'bg-[#333A48] font-semibold text-white'
            : 'text-[#AEB7C4] hover:bg-[#333A48] hover:text-white',
        ].join(' ')
      }
    >
      <Icon size={level === 0 ? 17 : 16} strokeWidth={1.8} />

      {!collapsed ? <span className="truncate">{item.label}</span> : null}
    </NavLink>
  );
}
