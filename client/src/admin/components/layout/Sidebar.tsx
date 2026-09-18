import { SquareChartGantt } from "lucide-react";
import { SidebarMenu } from "./SidebarMenu";
import { useAuth } from "@/admin/auth/useAuth";
import Button from "../ui/Button";

export default function Sidebar() {
  const { logout, user } = useAuth();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-[rgba(36,23,24,0.14)] bg-white">
      {/* Branding */}
      <div className="flex h-16 items-center gap-3 border-b border-black/5 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-md text-black">
          <SquareChartGantt size={20} strokeWidth={2} />
        </div>

        <div>
          <p className="text-sm font-semibold leading-none text-black">
            CMS MWS
          </p>

          <p className="mt-1 text-xs leading-none text-muted-foreground">
            Website Content CMS
          </p>
        </div>
      </div>
      <SidebarMenu />

      <div className="mt-auto border-t border-black/5 p-4">
        {user && (
          <div className="mb-3 rounded-md bg-[#faf8f3] px-3 py-2">
            <p className="truncate text-sm font-semibold text-[#241718]">
              {user.name}
            </p>
            <p className="mt-0.5 truncate text-xs text-[#625759]">
              {user.role.label ?? user.role.name}
            </p>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => void logout()}
        >
          Logout
        </Button>
      </div>
    </aside>
  );
}
