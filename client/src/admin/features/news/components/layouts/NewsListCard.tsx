import type {
  NewsCategory,
  NewsPost,
  NewsPostList,
  NewsStatus,
} from '@/admin/api/adminApi';
import type { NewsFilters, UpdateNewsFilter } from '@/admin/features/news/newsListModel';
import NewsListFilters from './NewsListFilters';
import NewsListHeader from './NewsListHeader';
import NewsListPagination from './NewsListPagination';
import NewsListRows from './NewsListRows';

export default function NewsListCard({
  categories,
  deletingId,
  filters,
  isLoading,
  result,
  statusUpdatingId,
  onDelete,
  onFilterChange,
  onPageChange,
  onStatusChange,
}: {
  categories: NewsCategory[];
  deletingId: string | null;
  filters: NewsFilters;
  isLoading: boolean;
  result: NewsPostList;
  statusUpdatingId: string | null;
  onDelete: (post: NewsPost) => void;
  onFilterChange: UpdateNewsFilter;
  onPageChange: (page: number) => void;
  onStatusChange: (post: NewsPost, status: NewsStatus) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      <NewsListHeader
        filters={filters}
        total={result.pagination.total}
        onFilterChange={onFilterChange}
      />

      <NewsListFilters categories={categories} filters={filters} onFilterChange={onFilterChange} />

      <NewsListRows
        deletingId={deletingId}
        isLoading={isLoading}
        posts={result.items}
        statusUpdatingId={statusUpdatingId}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
      />

      <NewsListPagination isLoading={isLoading} result={result} onPageChange={onPageChange} />
    </div>
  );
}
