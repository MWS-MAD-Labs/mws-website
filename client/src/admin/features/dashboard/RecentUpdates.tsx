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
    <section aria-labelledby="recent-title" className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 id="recent-title" className="text-base font-semibold text-[#241718]">
          Recently updated
        </h2>
        <p className="mt-0.5 text-sm text-gray-500">Pick up where you or your team left off.</p>
      </div>

      {!updates.length ? (
        <p className="px-5 py-8 text-center text-sm text-gray-500">Nothing has been edited yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {updates.map((update) => (
            <li key={`${update.type}-${update.editPath}`}>
              <Link
                to={update.editPath}
                className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-50"
              >
                <span className="w-16 shrink-0 text-xs font-medium text-gray-400">
                  {TYPE_LABELS[update.type]}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
                  {update.title}
                </span>
                <StatusBadge status={update.status} />
                <span className="hidden w-24 shrink-0 text-right text-xs text-gray-400 sm:block">
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
