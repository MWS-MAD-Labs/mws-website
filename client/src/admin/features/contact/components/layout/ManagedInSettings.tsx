import { ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

/** Read-only values that are edited in Settings, with a link to that page. */
export default function ManagedInSettings({
  children,
  label,
  settingsPath,
}: {
  children: ReactNode;
  label: string;
  settingsPath: string;
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#1C2434]">{label}</p>
          <p className="mt-0.5 text-xs text-[#64748B]">
            Managed in Settings so the whole website stays in sync.
          </p>
        </div>
        <Link
          to={settingsPath}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-[#3C50E0] hover:underline"
        >
          Edit in Settings
          <ExternalLink size={14} />
        </Link>
      </div>
      <div className="text-sm text-[#1C2434]">{children}</div>
    </div>
  );
}
