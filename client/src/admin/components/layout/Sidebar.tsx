import { PanelLeftClose, PanelLeftOpen, SquareChartGantt } from 'lucide-react';
import { useState } from 'react';

import { SidebarMenu } from './SidebarMenu';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const APP_VERSION = 'V1.0.0'

  return (
    <aside
      className={[
        'sticky top-0 z-50 flex h-screen shrink-0 flex-col',
        'border-r border-[#333A48] bg-[#1C2434]',
        'transition-[width] duration-200 ease-in-out',
        collapsed ? 'w-16' : 'w-56',
      ].join(' ')}
      aria-label="Admin sidebar"
    >
      {/* Branding */}
      <div
        className={[
          'flex h-16 shrink-0 items-center gap-3 overflow-hidden',
          collapsed ? 'justify-center px-2' : 'px-4',
        ].join(' ')}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white">
          <SquareChartGantt size={24} strokeWidth={2} />
        </div>

        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-none text-white">CMS MWS</p>
            <p className="mt-1 truncate text-xs leading-none text-[#AEB7C4]">Website Content CMS</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="relative z-10 min-h-0 flex-1">
        <SidebarMenu collapsed={collapsed} />

        {/* Collapse toggle */}
        <button
          type="button"
          className={[
            'absolute right-0 top-1/2 z-50',
            'grid h-7 w-7 -translate-y-1/2 translate-x-1/2',
            'place-items-center rounded-full',
            'bg-[#1C2434] text-[#AEB7C4]',
            'transition-colors hover:bg-[#333A48] hover:text-white',
            'focus-visible:outline-2 focus-visible:outline-offset-2',
            'focus-visible:outline-white',
          ].join(' ')}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((current) => !current)}
        >
          {collapsed ? (
            <PanelLeftOpen size={15} strokeWidth={1.8} />
          ) : (
            <PanelLeftClose size={15} strokeWidth={1.8} />
          )}
        </button>
      </div>

      {/* App Version */}
      <div
        className={[
          'shrink-0 border-t border-[#333A48]',
          collapsed ? 'flex justify-center px-2 py-4' : 'px-4 py-4',
        ].join(' ')}
      >
        {collapsed ? (
          <span
            title={`CMS MWS ${APP_VERSION}`}
            className="text-[10px] font-medium tracking-wide text-[#AEB7C4]"
          >
            {APP_VERSION.replace('v', '')}
          </span>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[#AEB7C4]">Version</span>
            <span className="rounded border border-[#414B5C] bg-[#252F40] px-2 py-1 text-[10px] font-semibold tracking-wide text-[#C7CFD9]">
              {APP_VERSION}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
