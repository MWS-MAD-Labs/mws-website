import type { NewsCategory, NewsPost, NewsPostPayload, NewsStatus } from '@/admin/api/adminApi';

export type NewsForm = {
  authorName: string;
  categoryId: string;
  content: string;
  coverImage: string;
  coverImageAlt: string;
  excerpt: string;
  isFeatured: boolean;
  publishedAt: string;
  readTime: string;
  seoDescription: string;
  seoTitle: string;
  slug: string;
  status: NewsStatus;
  tagIds: string[];
  title: string;
};

export type UpdateNewsForm = <Key extends keyof NewsForm>(key: Key, value: NewsForm[Key]) => void;

export const NEWS_EDITOR_FORM_ID = 'news-editor-form';

export const NEWS_INPUT_CLASS =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#7e1518] focus:ring-2 focus:ring-[#7e1518]/10';

export function createEmptyNewsForm(): NewsForm {
  return {
    authorName: '',
    categoryId: '',
    content: '',
    coverImage: '',
    coverImageAlt: '',
    excerpt: '',
    isFeatured: false,
    publishedAt: '',
    readTime: '0',
    seoDescription: '',
    seoTitle: '',
    slug: '',
    status: 'DRAFT',
    tagIds: [],
    title: '',
  };
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function toggleTagId(tagIds: string[], tagId: string) {
  return tagIds.includes(tagId) ? tagIds.filter((id) => id !== tagId) : [...tagIds, tagId];
}

export function isCategorySelectable(category: NewsCategory, selectedCategoryId: string) {
  return category.isActive || category.id === selectedCategoryId;
}

export function newsFormFromPost(post: NewsPost): NewsForm {
  return {
    authorName: post.authorName ?? '',
    categoryId: post.categoryId ?? '',
    content: contentToText(post.content),
    coverImage: post.coverImage ?? '',
    coverImageAlt: post.coverImageAlt ?? '',
    excerpt: post.excerpt ?? '',
    isFeatured: post.isFeatured,
    publishedAt: dateToLocalInput(post.publishedAt),
    readTime: String(post.readTime),
    seoDescription: post.seoDescription ?? '',
    seoTitle: post.seoTitle ?? '',
    slug: post.slug,
    status: post.status,
    tagIds: post.tags.map((tag) => tag.id),
    title: post.title,
  };
}

export function newsPayloadFromForm(form: NewsForm): NewsPostPayload {
  return {
    authorName: optionalText(form.authorName),
    categoryId: form.categoryId || null,
    content: {
      format: 'plain_text',
      text: form.content.trim(),
    },
    coverImage: optionalText(form.coverImage),
    coverImageAlt: optionalText(form.coverImageAlt),
    excerpt: optionalText(form.excerpt),
    isFeatured: form.isFeatured,
    publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
    readTime: Number.parseInt(form.readTime, 10) || 0,
    seoDescription: optionalText(form.seoDescription),
    seoTitle: optionalText(form.seoTitle),
    slug: form.slug.trim(),
    status: form.status,
    tagIds: form.tagIds,
    title: form.title.trim(),
  };
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

function dateToLocalInput(value: string | null) {
  if (!value) return '';

  const date = new Date(value);
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 16);
}

function contentToText(content: unknown) {
  if (typeof content === 'string') return content;

  if (content && typeof content === 'object' && 'text' in content) {
    const text = (content as { text?: unknown }).text;
    if (typeof text === 'string') return text;
  }

  if (!content) return '';
  return JSON.stringify(content, null, 2);
}
