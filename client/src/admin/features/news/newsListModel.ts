import type { NewsPostFilters, NewsStatus } from '@/admin/api/adminApi';
import { NEWS_PAGE_SIZE } from '@/admin/features/news/newsUtils';

export type NewsFilters = {
  categoryId: string;
  featuredOnly: boolean;
  search: string;
  status: NewsStatus | '';
};

export type UpdateNewsFilter = <Key extends keyof NewsFilters>(
  key: Key,
  value: NewsFilters[Key],
) => void;

export function createInitialNewsFilters(): NewsFilters {
  return {
    categoryId: '',
    featuredOnly: false,
    search: '',
    status: '',
  };
}

export function buildNewsPostFilters(filters: NewsFilters, page: number): NewsPostFilters {
  return {
    page,
    pageSize: NEWS_PAGE_SIZE,
    search: filters.search || undefined,
    status: filters.status || undefined,
    categoryId: filters.categoryId || undefined,
    isFeatured: filters.featuredOnly ? true : undefined,
  };
}
