import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/admin/auth/useAuth";
import menuSections, { type MenuItem, type MenuSection } from "@/admin/config/navigation";
import { hasCmsPermission } from "@/admin/types/auth";

type AuthUser = ReturnType<typeof useAuth>["user"];

function isMenuItemVisible(item: MenuItem, user: AuthUser): boolean {
  if (!item.enabled) return false;
  if (item.requiredPermission && !hasCmsPermission(user, item.requiredPermission)) {
    return false;
  }
  if (!item.children?.length) return true;

  return item.children.some((child) => isMenuItemVisible(child, user));
}

function hasActiveChild(item: MenuItem, pathname: string): boolean {
  return Boolean(
    item.children?.some(
      (child) => child.href === pathname || hasActiveChild(child, pathname),
    ),
  );
}

function visibleSection(section: MenuSection, user: AuthUser) {
  const items = section.items.filter((item) => isMenuItemVisible(item, user));
  return items.length ? { ...section, items } : null;
}

export function SidebarMenu({ collapsed = false }: { collapsed?: boolean }) {
  const location = useLocation();
  const { user } = useAuth();
  const visibleMenuSections = menuSections
    .map((section) => visibleSection(section, user))
    .filter(Boolean) as MenuSection[];

  const [openMenus, setOpenMenus] = useState<string[]>(
    visibleMenuSections
      .flatMap((section) => section.items)
      .filter((item) => hasActiveChild(item, location.pathname))
      .map((item) => item.label),
  );

  const toggleMenu = (label: string) => {
    setOpenMenus((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label],
    );
  };

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-5">
      <div className="space-y-5">
        {visibleMenuSections.map((section) => (
          <div key={section.label}>
            {!collapsed ? (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-black/35">
                {section.label}
              </p>
            ) : null}

            <div className="space-y-1">
              {section.items.map((item) => (
                <SidebarMenuItem
                  collapsed={collapsed}
                  item={item}
                  key={item.href ?? item.label}
                  level={0}
                  openMenus={openMenus}
                  toggleMenu={toggleMenu}
                  user={user}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}

function SidebarMenuItem({
  collapsed,
  item,
  level,
  openMenus,
  toggleMenu,
  user,
}: {
  collapsed: boolean;
  item: MenuItem;
  level: number;
  openMenus: string[];
  toggleMenu: (label: string) => void;
  user: AuthUser;
}) {
  const Icon = item.Icon;
  const visibleChildren = item.children?.filter((child) =>
    isMenuItemVisible(child, user),
  );
  const hasChildren = Boolean(visibleChildren?.length);
  const isOpen = openMenus.includes(item.label);
  const leftPadding = collapsed
    ? "px-0 justify-center"
    : level === 0
      ? "px-3"
      : level === 1
        ? "pl-8 pr-3"
        : "pl-11 pr-3";

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          title={collapsed ? item.label : undefined}
          onClick={() => toggleMenu(item.label)}
          className={[
            "flex h-9 w-full items-center gap-2 rounded-md text-sm font-medium text-black/60 transition-colors hover:bg-black/5 hover:text-black",
            leftPadding,
          ].join(" ")}
        >
          <Icon size={level === 0 ? 17 : 16} strokeWidth={1.8} />

          {!collapsed ? (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown
                size={15}
                strokeWidth={1.8}
                className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </>
          ) : null}
        </button>

        {!collapsed && isOpen ? (
          <div className="mt-1 space-y-1">
            {visibleChildren?.map((child) => (
              <SidebarMenuItem
                collapsed={collapsed}
                item={child}
                key={child.href ?? child.label}
                level={level + 1}
                openMenus={openMenus}
                toggleMenu={toggleMenu}
                user={user}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (!item.href) return null;

  return (
    <NavLink
      to={item.href}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        [
          "flex h-9 items-center gap-2 rounded-md text-sm transition-colors",
          level === 0 ? "font-medium" : "",
          leftPadding,
          isActive
            ? "bg-black/8 font-medium text-black"
            : "text-black/60 hover:bg-black/5 hover:text-black",
        ].join(" ")
      }
    >
      <Icon size={level === 0 ? 17 : 16} strokeWidth={1.8} />
      {!collapsed ? <span>{item.label}</span> : null}
    </NavLink>
  );
}
