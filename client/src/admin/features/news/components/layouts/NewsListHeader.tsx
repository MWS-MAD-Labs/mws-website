import type { NewsFilters, UpdateNewsFilter } from '@/admin/features/news/newsListModel';

export default function NewsListHeader({
  filters,
  total,
  onFilterChange,
}: {
  filters: NewsFilters;
  total: number;
  onFilterChange: UpdateNewsFilter;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] px-5 py-4">
      <div>
        <h2 className="font-semibold text-[#1C2434]">News posts</h2>

        <p className="mt-0.5 text-sm text-[#64748B]">
          {total} {total === 1 ? 'post' : 'posts'}
        </p>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#1C2434]">
        <input
          className="h-4 w-4 accent-[#3C50E0]"
          type="checkbox"
          checked={filters.featuredOnly}
          onChange={(event) => onFilterChange('featuredOnly', event.target.checked)}
        />
        Featured only
      </label>
    </div>
  );
}
