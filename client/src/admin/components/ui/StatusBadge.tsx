export type ContentStatus =
  | 'PUBLISHED'
  | 'DRAFT'
  | 'SCHEDULED'
  | 'ARCHIVED'
  | 'HIDDEN'
  | 'UNSAVED'
  | 'CHANGES';

const STATUS_STYLES: Record<ContentStatus, { label: string; className: string }> = {
  PUBLISHED: { label: 'Live', className: 'bg-[#10B981]/10 text-[#047857] ring-[#10B981]/20' },
  DRAFT: { label: 'Draft', className: 'bg-[#F59E0B]/10 text-[#D97706] ring-[#F59E0B]/20' },
  SCHEDULED: { label: 'Scheduled', className: 'bg-[#F59E0B]/10 text-[#D97706] ring-[#F59E0B]/20' },
  ARCHIVED: { label: 'Archived', className: 'bg-[#64748B]/10 text-[#64748B] ring-[#64748B]/20' },
  HIDDEN: { label: 'Hidden', className: 'bg-[#64748B]/10 text-[#64748B] ring-[#64748B]/20' },
  UNSAVED: { label: 'Unsaved changes', className: 'bg-[#F59E0B]/10 text-[#D97706] ring-[#F59E0B]/20' },
  CHANGES: {
    label: 'Unpublished changes',
    className: 'bg-[#F59E0B]/10 text-[#D97706] ring-[#F59E0B]/20',
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
