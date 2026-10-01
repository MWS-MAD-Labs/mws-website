import { Link } from 'react-router-dom';
import type { DashboardRecentUpdate } from '@/admin/api/adminApi';
import StatusBadge from '@/admin/components/ui/StatusBadge';
import { formatRelativeTime } from './format';

const TYPE_LABELS: Record<DashboardRecentUpdate['type'], string> = {
  news: 'News',
  page: 'Page',
  academic: 'Academic',
  hero: 'Home',
};

export default function RecentUpdates({ updates }: { updates: DashboardRecentUpdate[] }) {
  return (
    <section aria-labelledby="recent-title" className="rounded-lg border border-[#E2E8F0] bg-white">
      <div className="border-b border-[#E2E8F0] px-4 py-3">
        <h2 id="recent-title" className="text-sm font-semibold text-[#1C2434]">
          Recently updated
        </h2>
      </div>

      {!updates.length ? (
        <p className="px-5 py-8 text-center text-sm text-[#64748B]">Nothing has been edited yet.</p>
      ) : (
        <ul className="divide-y divide-[#E2E8F0]">
          {updates.map((update) => (
            <li key={`${update.type}-${update.editPath}`}>
              <Link
                to={update.editPath}
                className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[#F1F5F9]"
              >
                <span className="w-16 shrink-0 text-xs font-medium text-[#64748B]">
                  {TYPE_LABELS[update.type]}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#1C2434]">
                  {update.title}
                </span>
                <StatusBadge status={update.status} />
                <span className="hidden w-24 shrink-0 text-right text-xs text-[#64748B] sm:block">
                  {formatRelativeTime(update.updatedAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
