import type { NewsPostList } from '@/admin/api/adminApi';
import Button from '@/admin/components/ui/Button';

export default function NewsListPagination({
  isLoading,
  result,
  onPageChange,
}: {
  isLoading: boolean;
  result: NewsPostList;
  onPageChange: (page: number) => void;
}) {
  if (result.pagination.totalPages <= 1) {
    return null;
  }

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
