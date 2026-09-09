import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import menuItems from "@/admin/config/navigation";

export function SidebarMenu() {
  const location = useLocation();

  const [openMenus, setOpenMenus] = useState<string[]>(
    menuItems
      .filter((item) =>
        item.children?.some((child) => child.href === location.pathname),
      )
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
      <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-black/35">
        Menu
      </p>

      <div className="space-y-1">
        {menuItems
          .filter((item) => item.enabled)
          .map((item) => {
            const Icon = item.Icon;
            const hasChildren = Boolean(item.children?.length);
            const isOpen = openMenus.includes(item.label);

            // Parent menu
            if (hasChildren) {
              return (
                <div key={item.label}>
                  <button
                    type="button"
                    onClick={() => toggleMenu(item.label)}
                    className="flex h-9 w-full items-center gap-2 rounded-md px-3 text-sm font-medium text-black/60 transition-colors hover:bg-black/5 hover:text-black"
                  >
                    <Icon size={17} strokeWidth={1.8} />

                    <span className="flex-1 text-left">
                      {item.label}
                    </span>

                    <ChevronDown
                      size={15}
                      strokeWidth={1.8}
                      className={`transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="mt-1 space-y-1 pl-5">
                      {item.children
                        ?.filter((child) => child.enabled)
                        .map((child) => {
                          const ChildIcon = child.Icon;

                          return (
                            <NavLink
                              key={child.href}
                              to={child.href!}
                              className={({ isActive }) =>
                                [
                                  "flex h-9 items-center gap-2 rounded-md px-3 text-sm transition-colors",
                                  isActive
                                    ? "bg-black/8 font-medium text-black"
                                    : "text-black/55 hover:bg-black/5 hover:text-black",
                                ].join(" ")
                              }
                            >
                              <ChildIcon
                                size={16}
                                strokeWidth={1.7}
                              />

                              <span>{child.label}</span>
                            </NavLink>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            }

            // Normal menu
            return (
              <NavLink
                key={item.href}
                to={item.href!}
                className={({ isActive }) =>
                  [
                    "flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-black/8 text-black"
                      : "text-black/60 hover:bg-black/5 hover:text-black",
                  ].join(" ")
                }
              >
                <Icon size={17} strokeWidth={1.8} />

                <span>{item.label}</span>
              </NavLink>
            );
          })}
      </div>
    </nav>
  );
}
