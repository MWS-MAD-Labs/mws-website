import type { Dispatch, SetStateAction } from 'react';

import type { AuditLogList } from '@/admin/api/adminApi';
import Button from '@/admin/components/ui/Button';

type AuditLogPaginationProps = {
  isLoading: boolean;
  page: number;
  pagination: AuditLogList['pagination'];
  itemCount: number;
  onPageChange: Dispatch<SetStateAction<number>>;
};

export default function AuditLogPagination({
  isLoading,
  page,
  pagination,
  itemCount,
  onPageChange,
}: AuditLogPaginationProps) {
  const { total, pageSize } = pagination;
  const firstRow = total === 0 ? 0 : (pagination.page - 1) * pageSize + 1;
  const lastRow = Math.min(total, firstRow + itemCount - 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] bg-[#F1F5F9]/40 px-5 py-4">
      <p className="text-sm text-[#64748B]">
        {total ? `Showing ${firstRow}–${lastRow} of ${total}` : 'No entries'} · Page{' '}
        {pagination.page} of {pagination.totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          disabled={isLoading || page <= 1}
          size="sm"
          type="button"
          variant="outline"
          onClick={() => onPageChange((value) => Math.max(1, value - 1))}
        >
          Previous
        </Button>
        <Button
          disabled={isLoading || page >= pagination.totalPages}
          size="sm"
          type="button"
          variant="outline"
          onClick={() => onPageChange((value) => value + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
