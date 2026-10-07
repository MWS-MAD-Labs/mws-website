import type {
  ContactInquiry,
  ContactInquiryList,
  ContactInquiryStatus,
} from '@/admin/api/adminApi';
import Button from '@/admin/components/ui/Button';
import SearchInput from '@/admin/components/ui/SearchInput';
import {
  INQUIRY_STATUS_OPTIONS,
  formatInquiryDate,
  getInquiryStatusClasses,
  getInquiryStatusLabel,
} from '@/admin/features/inquiries/inquiryUtils';

type InquiryListCardProps = {
  isLoading: boolean;
  loadError: string | null;
  result: ContactInquiryList;
  search: string;
  status: ContactInquiryStatus | '';
  onOpen: (inquiry: ContactInquiry) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (status: ContactInquiryStatus | '') => void;
};

export function InquiryStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${getInquiryStatusClasses(status)}`}
    >
      {getInquiryStatusLabel(status)}
    </span>
  );
}

export default function InquiryListCard({
  isLoading,
  loadError,
  result,
  search,
  status,
  onOpen,
  onPageChange,
  onRetry,
  onSearchChange,
  onStatusChange,
}: InquiryListCardProps) {
  const counts = result.statusCounts;
  const allCount = Object.values(counts).reduce((sum, count) => sum + (count ?? 0), 0);
  const tabs: Array<{ value: ContactInquiryStatus | ''; label: string; count: number }> = [
    { value: '', label: 'All', count: allCount },
    ...INQUIRY_STATUS_OPTIONS.map((option) => ({
      value: option.value,
      label: option.label,
      count: counts[option.value] ?? 0,
    })),
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] px-5 py-4">
        <div>
          <h2 className="font-semibold text-[#1C2434]">Inquiries</h2>
          <p className="mt-0.5 text-sm text-[#64748B]">
            {result.pagination.total} {result.pagination.total === 1 ? 'message' : 'messages'}
          </p>
        </div>
      </div>

      <div className="grid gap-3 border-b border-[#E2E8F0] bg-[#F1F5F9] px-5 py-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
          {tabs.map((tab) => {
            const isActive = status === tab.value;
            return (
              <button
                key={tab.value || 'all'}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onStatusChange(tab.value)}
                className={[
                  'inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-[#3C50E0] bg-[#3C50E0] text-white'
                    : 'border-[#E2E8F0] bg-white text-[#1C2434] hover:border-[#3C50E0]/40',
                ].join(' ')}
              >
                {tab.label}
                <span
                  className={[
                    'rounded px-1.5 text-xs tabular-nums',
                    isActive ? 'bg-white/20' : 'bg-[#F1F5F9] text-[#64748B]',
                  ].join(' ')}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <SearchInput
          aria-label="Search inquiries"
          placeholder="Search name, email, subject, or message..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <InquiryRows
        isLoading={isLoading}
        loadError={loadError}
        hasFilters={Boolean(status || search.trim())}
        items={result.items}
        onOpen={onOpen}
        onRetry={onRetry}
      />

      <Pagination isLoading={isLoading} result={result} onPageChange={onPageChange} />
    </div>
  );
}

function InquiryRows({
  hasFilters,
  isLoading,
  items,
  loadError,
  onOpen,
  onRetry,
}: {
  hasFilters: boolean;
  isLoading: boolean;
  items: ContactInquiry[];
  loadError: string | null;
  onOpen: (inquiry: ContactInquiry) => void;
  onRetry: () => void;
}) {
  if (isLoading) {
    return <div className="p-10 text-center text-sm text-[#64748B]">Loading inquiries...</div>;
  }

  if (loadError) {
    return (
      <div className="grid justify-items-center gap-3 p-10 text-center">
        <p className="font-medium text-[#1C2434]">Inquiries could not be loaded.</p>
        <p className="text-sm text-[#64748B]">{loadError}</p>
        <Button size="sm" type="button" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="p-10 text-center">
        <p className="font-medium text-[#1C2434]">
          {hasFilters ? 'No inquiries match these filters.' : 'No inquiries yet.'}
        </p>
        <p className="mt-1 text-sm text-[#64748B]">
          {hasFilters
            ? 'Clear the search or pick another status.'
            : 'Messages sent from the public Contact form will appear here.'}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile */}
      <div className="divide-y divide-[#E2E8F0] lg:hidden">
        {items.map((inquiry) => (
          <button
            key={inquiry.id}
            type="button"
            onClick={() => onOpen(inquiry)}
            className="block w-full cursor-pointer p-4 text-left hover:bg-[#F1F5F9]/50"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p
                  className={`truncate text-sm text-[#1C2434] ${inquiry.status === 'NEW' ? 'font-semibold' : 'font-medium'}`}
                >
                  {inquiry.subject}
                </p>
                <p className="mt-0.5 truncate text-xs text-[#64748B]">
                  {inquiry.name} · {inquiry.email}
                </p>
              </div>
              <InquiryStatusBadge status={inquiry.status} />
            </div>
            <p className="mt-2 line-clamp-2 text-xs text-[#64748B]">{inquiry.message}</p>
            <p className="mt-2 text-[11px] text-[#64748B]">{formatInquiryDate(inquiry.createdAt)}</p>
          </button>
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="border-y border-[#E2E8F0] bg-[#F1F5F9] text-left">
              {['From', 'Subject', 'Category', 'Received', 'Status'].map((label) => (
                <th
                  key={label}
                  className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {items.map((inquiry) => (
              <tr
                key={inquiry.id}
                tabIndex={0}
                onClick={() => onOpen(inquiry)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOpen(inquiry);
                  }
                }}
                aria-label={`Open inquiry from ${inquiry.name}: ${inquiry.subject}`}
                className="cursor-pointer transition-colors hover:bg-[#F1F5F9]/50 focus:bg-[#F1F5F9] focus:outline-none"
              >
                <td className="px-5 py-4 align-top">
                  <p
                    className={`truncate text-sm text-[#1C2434] ${inquiry.status === 'NEW' ? 'font-semibold' : 'font-medium'}`}
                  >
                    {inquiry.name}
                  </p>
                  <p className="mt-1 truncate text-xs text-[#64748B]">{inquiry.email}</p>
                </td>
                <td className="max-w-[360px] px-5 py-4 align-top">
                  <p
                    className={`truncate text-sm text-[#1C2434] ${inquiry.status === 'NEW' ? 'font-semibold' : ''}`}
                  >
                    {inquiry.subject}
                  </p>
                  <p className="mt-1 line-clamp-1 text-xs text-[#64748B]">{inquiry.message}</p>
                </td>
                <td className="px-5 py-4 align-top text-sm text-[#64748B]">
                  {inquiry.category || '-'}
                </td>
                <td className="whitespace-nowrap px-5 py-4 align-top text-sm text-[#64748B]">
                  {formatInquiryDate(inquiry.createdAt)}
                </td>
                <td className="px-5 py-4 align-top">
                  <InquiryStatusBadge status={inquiry.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Pagination({
  isLoading,
  result,
  onPageChange,
}: {
  isLoading: boolean;
  result: ContactInquiryList;
  onPageChange: (page: number) => void;
}) {
  if (result.pagination.totalPages <= 1) return null;

  const { page, totalPages } = result.pagination;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-[#E2E8F0] bg-[#F1F5F9]/30 px-5 py-4">
      <p className="text-sm text-[#64748B]">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          disabled={isLoading || page <= 1}
          size="sm"
          type="button"
          variant="outline"
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          Previous
        </Button>
        <Button
          disabled={isLoading || page >= totalPages}
          size="sm"
          type="button"
          variant="outline"
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
