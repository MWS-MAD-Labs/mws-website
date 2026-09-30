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

const NEWS_STATUSES: NewsStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

/** `?status=DRAFT` preselects the status filter, e.g. from a dashboard link. */
export function createInitialNewsFilters(search = ''): NewsFilters {
  const status = new URLSearchParams(search).get('status')?.toUpperCase() as NewsStatus | undefined;

  return {
    categoryId: '',
    featuredOnly: false,
    search: '',
    status: status && NEWS_STATUSES.includes(status) ? status : '',
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
