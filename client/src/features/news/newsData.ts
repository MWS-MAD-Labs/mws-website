import { apiRequest, publicAssetUrl } from '@/lib/api';

export type PublicNewsCategory = {
  id: string;
  name: string;
  slug: string;
  count?: number;
};

export type PublicNewsContent = {
  format: string;
  text: string;
};

export type PublicNewsListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  coverImageAlt: string | null;
  publishedAt: string;
  readTime: number;
  authorName: string;
  category: Omit<PublicNewsCategory, 'count'> | null;
};

export type PublicNewsList = {
  items: PublicNewsListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type PublicNewsDetail = PublicNewsListItem & {
  content: PublicNewsContent;

  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;

  media: Array<{
    id: string;
    mediaType: 'DOCUMENT' | 'IMAGE' | 'VIDEO';
    url: string;
    alt: string | null;
    caption: string | null;
    sortOrder: number;
  }>;

  seo: {
    title: string;
    description: string | null;
  };

  relatedNews: PublicNewsListItem[];
};

type NewsFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
};

export const newsApi = {
  async list(filters: NewsFilters = {}, signal?: AbortSignal) {
    const query = new URLSearchParams();

    if (filters.page) {
      query.set('page', String(filters.page));
    }

    if (filters.pageSize) {
      query.set('pageSize', String(filters.pageSize));
    }

    if (filters.search?.trim()) {
      query.set('search', filters.search.trim());
    }

    if (filters.category) {
      query.set('category', filters.category);
    }

    const suffix = query.size ? `?${query.toString()}` : '';

    const response = await apiRequest<{
      data: PublicNewsList;
    }>(`/api/news${suffix}`, {
      signal,
    });

    return response!.data;
  },

  async categories(signal?: AbortSignal) {
    const response = await apiRequest<{
      data: PublicNewsCategory[];
    }>('/api/news/categories', {
      signal,
    });

    return response?.data ?? [];
  },

  async detail(slug: string, signal?: AbortSignal) {
    const response = await apiRequest<{
      data: PublicNewsDetail;
    }>(`/api/news/${encodeURIComponent(slug)}`, {
      signal,
    });

    return response!.data;
  },
};

export function publicNewsImage(path: string | null, fallback: string) {
  return publicAssetUrl(path, fallback);
}

export function formatNewsDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

export function readTimeLabel(minutes: number) {
  return `${Math.max(1, minutes)} min read`;
}

export function newsContentParagraphs(content: unknown): string[] {
  if (typeof content === 'string') {
    return splitParagraphs(content);
  }

  if (!content || typeof content !== 'object') {
    return [];
  }

  const value = content as {
    text?: unknown;
    blocks?: unknown;
  };

  if (typeof value.text === 'string') {
    return splitParagraphs(value.text);
  }

  if (!Array.isArray(value.blocks)) {
    return [];
  }

  return value.blocks.flatMap((block) => {
    if (!block || typeof block !== 'object') {
      return [];
    }

    const text = (block as { text?: unknown }).text;

    return typeof text === 'string' ? splitParagraphs(text) : [];
  });
}

function splitParagraphs(value: string) {
  return value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
