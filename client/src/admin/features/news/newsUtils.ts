import type { NewsPostList, NewsStatus } from '@/admin/api/adminApi';

export const NEWS_LIST_PATH = '/admin/news';
export const NEWS_LIST_RETURN_KEY = 'mws:admin-news:return-to-list';
export const NEWS_PAGE_SIZE = 10;

export const EMPTY_NEWS_RESULT: NewsPostList = {
  items: [],
  pagination: {
    page: 1,
    pageSize: NEWS_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  },
};

export const NEWS_STATUS_OPTIONS: Array<{ label: string; value: NewsStatus }> = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Archived', value: 'ARCHIVED' },
];

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export function formatNewsDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : 'Not published';
}

export function getNewsStatusClasses(status: NewsStatus) {
  if (status === 'PUBLISHED') {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
  }

  if (status === 'ARCHIVED') {
    return 'bg-gray-100 text-gray-600 ring-gray-500/20';
  }

  return 'bg-amber-50 text-amber-700 ring-amber-600/20';
}

export function getNewsStatusLabel(status: NewsStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function notifyNewsListReturn() {
  try {
    window.localStorage.setItem(NEWS_LIST_RETURN_KEY, `${Date.now()}`);
  } catch {
    // The editor can still navigate back when browser storage is unavailable.
  }
}
