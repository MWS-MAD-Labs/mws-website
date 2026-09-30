export type ContentStatus =
  | 'PUBLISHED'
  | 'DRAFT'
  | 'SCHEDULED'
  | 'ARCHIVED'
  | 'HIDDEN'
  | 'UNSAVED'
  | 'CHANGES';

const STATUS_STYLES: Record<ContentStatus, { label: string; className: string }> = {
  PUBLISHED: { label: 'Live', className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  DRAFT: { label: 'Draft', className: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  SCHEDULED: { label: 'Scheduled', className: 'bg-sky-50 text-sky-700 ring-sky-600/20' },
  ARCHIVED: { label: 'Archived', className: 'bg-gray-100 text-gray-600 ring-gray-500/20' },
  HIDDEN: { label: 'Hidden', className: 'bg-gray-100 text-gray-600 ring-gray-500/20' },
  UNSAVED: { label: 'Unsaved changes', className: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  CHANGES: {
    label: 'Unpublished changes',
    className: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  },
};

/**
 * One vocabulary for content state across the CMS, so "Live", "Draft" and
 * "Scheduled" look and read the same on every page.
 */
export default function StatusBadge({
  status,
  label,
}: {
  status: ContentStatus;
  label?: string;
}) {
  const style = STATUS_STYLES[status];

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${style.className}`}
    >
      {label ?? style.label}
    </span>
  );
}
