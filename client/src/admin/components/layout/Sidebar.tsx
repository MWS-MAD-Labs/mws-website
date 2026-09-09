import { SquareChartGantt } from "lucide-react";
import { SidebarMenu } from "./SidebarMenu";

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-[rgba(36,23,24,0.14)] bg-white">
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
            Management Web Service
          </p>
        </div>
      </div>
      <SidebarMenu />
    </aside>
  );
}
