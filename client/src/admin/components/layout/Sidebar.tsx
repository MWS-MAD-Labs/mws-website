import { PanelLeftClose, PanelLeftOpen, SquareChartGantt } from 'lucide-react';
import { useState } from 'react';
import { SidebarMenu } from './SidebarMenu';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={[
        'sticky top-0 z-50 flex h-screen shrink-0 flex-col border-r border-[#333A48] bg-[#1C2434] transition-[width]',
        collapsed ? 'w-16' : 'w-56',
      ].join(' ')}
    >
      {/* Branding */}
      <div className="flex h-16 shrink-0 items-center gap-3 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white">
          <SquareChartGantt size={24} strokeWidth={2} />
        </div>

        {!collapsed ? (
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-none text-white">CMS MWS</p>

            <p className="mt-1 text-xs leading-none text-[#AEB7C4]">Website Content CMS</p>
          </div>
        ) : null}
      </div>
      <div className="relative z-10 min-h-0 flex-1">
        <SidebarMenu collapsed={collapsed} />

        <button
          type="button"
          className="absolute right-0 top-1/2 z-50 grid h-7 w-7 -translate-y-1/2 translate-x-1/2 place-items-center rounded-full bg-[#1C2434] text-[#AEB7C4] hover:bg-[#333A48] hover:text-white"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed((current) => !current)}
        >
          {collapsed ? (
            <PanelLeftOpen size={15} strokeWidth={1.8} />
          ) : (
            <PanelLeftClose size={15} strokeWidth={1.8} />
          )}
        </button>
      </div>
    </aside>
  );
}
