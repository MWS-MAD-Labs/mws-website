import {
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  SquareChartGantt,
} from "lucide-react";
import { useState } from "react";
import { SidebarMenu } from "./SidebarMenu";
import { useAuth } from "@/admin/auth/useAuth";
import Button from "../ui/Button";

export default function Sidebar() {
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={[
        "sticky top-0 flex h-screen shrink-0 flex-col border-r border-[rgba(36,23,24,0.14)] bg-white transition-[width]",
        collapsed ? "w-20" : "w-64",
      ].join(" ")}
    >
      {/* Branding */}
      <div className="flex h-16 items-center gap-3 border-b border-black/5 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-md text-black">
          <SquareChartGantt size={20} strokeWidth={2} />
        </div>

        {!collapsed ? (
        <div>
          <p className="text-sm font-semibold leading-none text-black">
            CMS MWS
          </p>

          <p className="mt-1 text-xs leading-none text-muted-foreground">
            Website Content CMS
          </p>
        </div>
        ) : null}

        <button
          type="button"
          className="ml-auto grid h-8 w-8 place-items-center rounded-md text-black/60 hover:bg-black/5 hover:text-black"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((current) => !current)}
        >
          {collapsed ? (
            <PanelLeftOpen size={17} strokeWidth={1.8} />
          ) : (
            <PanelLeftClose size={17} strokeWidth={1.8} />
          )}
        </button>
      </div>
      <SidebarMenu collapsed={collapsed} />

      <div className="mt-auto border-t border-black/5 p-4">
        {user && !collapsed ? (
          <div className="mb-3 rounded-md bg-[#faf8f3] px-3 py-2">
            <p className="truncate text-sm font-semibold text-[#241718]">
              {user.name}
            </p>
            <p className="mt-0.5 truncate text-xs text-[#625759]">
              {user.role.label ?? user.role.name}
            </p>
          </div>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          className={collapsed ? "w-full px-2" : "w-full"}
          title="Logout"
          onClick={() => void logout()}
        >
          {collapsed ? <LogOut className="h-4 w-4" /> : "Logout"}
        </Button>
      </div>
    </aside>
  );
}
