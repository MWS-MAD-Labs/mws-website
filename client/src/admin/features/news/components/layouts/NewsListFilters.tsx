import type { NewsCategory, NewsStatus } from '@/admin/api/adminApi';
import SearchInput from '@/admin/components/ui/SearchInput';
import Select from '@/admin/components/ui/Select';
import type { NewsFilters, UpdateNewsFilter } from '@/admin/features/news/newsListModel';
import { NEWS_STATUS_OPTIONS } from '@/admin/features/news/newsUtils';

export default function NewsListFilters({
  categories,
  filters,
  onFilterChange,
}: {
  categories: NewsCategory[];
  filters: NewsFilters;
  onFilterChange: UpdateNewsFilter;
}) {
  return (
    <div className="grid gap-3 border-b border-[#E2E8F0] bg-[#F1F5F9] px-5 py-4 md:grid-cols-[minmax(220px,1fr)_180px_220px]">
      <SearchInput
        placeholder="Search title, slug, or excerpt..."
        value={filters.search}
        onChange={(event) => onFilterChange('search', event.target.value)}
      />

      <Select
        className="w-full"
        value={filters.status}
        onChange={(event) => onFilterChange('status', event.target.value as NewsStatus | '')}
      >
        <option value="">All statuses</option>

        {NEWS_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <Select
        className="w-full"
        value={filters.categoryId}
        onChange={(event) => onFilterChange('categoryId', event.target.value)}
      >
        <option value="">All categories</option>

        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
