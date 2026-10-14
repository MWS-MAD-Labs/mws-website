import type { NewsPost, NewsStatus } from '@/admin/api/adminApi';
import Select from '@/admin/components/ui/Select';
import {
  NEWS_STATUS_OPTIONS,
  getNewsPublicationClasses,
  isNewsScheduled,
  newsPublicationLabel,
  newsStatusOptionLabel,
} from '@/admin/features/news/newsUtils';

export default function NewsListPublicationControl({
  compact = false,
  isUpdating,
  post,
  onStatusChange,
}: {
  compact?: boolean;
  isUpdating: boolean;
  post: NewsPost;
  onStatusChange: (post: NewsPost, status: NewsStatus) => void;
}) {
  const labelClass = isNewsScheduled(post) ? 'font-medium text-[#3C50E0]' : 'text-[#64748B]';
  const publicationTitle = isNewsScheduled(post)
    ? 'Not on the website yet. It appears automatically at this time.'
    : undefined;

  return (
    <div className={compact ? 'flex min-w-0 flex-1 items-center gap-2' : 'min-w-0 space-y-1'}>
      <Select
        aria-label={`Change publication status for ${post.title}`}
        className={`${compact ? 'flex-1' : 'w-full'} text-xs font-medium ${getNewsPublicationClasses(post)}`}
        disabled={isUpdating}
        value={post.status}
        onChange={(event) => onStatusChange(post, event.target.value as NewsStatus)}
      >
        {NEWS_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {newsStatusOptionLabel(post, option)}
          </option>
        ))}
      </Select>

      {compact ? (
        <span className={`shrink-0 text-[11px] ${labelClass}`}>{newsPublicationLabel(post)}</span>
      ) : (
        <p className={`truncate text-[11px] leading-4 ${labelClass}`} title={publicationTitle}>
          {newsPublicationLabel(post)}
        </p>
      )}
    </div>
  );
}
