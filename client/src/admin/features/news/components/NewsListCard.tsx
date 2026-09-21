import { ExternalLink, Image, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  adminApi,
  type NewsCategory,
  type NewsPost,
  type NewsPostList,
  type NewsStatus,
} from '@/admin/api/adminApi';
import Button from '@/admin/components/ui/Button';
import SearchInput from '@/admin/components/ui/SearchInput';
import Select from '@/admin/components/ui/Select';
import {
  NEWS_LIST_PATH,
  NEWS_STATUS_OPTIONS,
  formatNewsDate,
  getNewsStatusClasses,
  getNewsStatusLabel,
} from '@/admin/features/news/newsUtils';
import type { NewsFilters, UpdateNewsFilter } from '@/admin/features/news/newsListModel';

export function NewsPageHeader() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm text-gray-500">Content / News</p>
        <h1 className="mt-1 text-xl font-semibold text-gray-900">All News</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage school news, drafts, featured stories, and publication dates.
        </p>
      </div>

      <Link to={`${NEWS_LIST_PATH}/new`} target="_blank" rel="opener" className="inline-flex">
        <Button className="inline-flex items-center gap-2" type="button">
          <Plus size={16} />
          Create News
          <ExternalLink size={14} />
        </Button>
      </Link>
    </div>
  );
}

export function NewsMessageBanner({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      {message}
    </div>
  );
}

export default function NewsListCard({
  categories,
  deletingId,
  filters,
  isLoading,
  result,
  onDelete,
  onFilterChange,
  onPageChange,
}: {
  categories: NewsCategory[];
  deletingId: string | null;
  filters: NewsFilters;
  isLoading: boolean;
  result: NewsPostList;
  onDelete: (post: NewsPost) => void;
  onFilterChange: UpdateNewsFilter;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <ListHeader
        filters={filters}
        total={result.pagination.total}
        onFilterChange={onFilterChange}
      />
      <FilterBar categories={categories} filters={filters} onFilterChange={onFilterChange} />
      <TableHeader />
      <NewsRows
        deletingId={deletingId}
        isLoading={isLoading}
        posts={result.items}
        onDelete={onDelete}
      />
      <Pagination isLoading={isLoading} result={result} onPageChange={onPageChange} />
    </div>
  );
}

function ListHeader({
  filters,
  total,
  onFilterChange,
}: {
  filters: NewsFilters;
  total: number;
  onFilterChange: UpdateNewsFilter;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
      <div>
        <h2 className="font-semibold text-gray-900">News posts</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          {total} {total === 1 ? 'post' : 'posts'}
        </p>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
        <input
          className="h-4 w-4 accent-[#7e1518]"
          type="checkbox"
          checked={filters.featuredOnly}
          onChange={(event) => onFilterChange('featuredOnly', event.target.checked)}
        />
        Featured only
      </label>
    </div>
  );
}

function FilterBar({
  categories,
  filters,
  onFilterChange,
}: {
  categories: NewsCategory[];
  filters: NewsFilters;
  onFilterChange: UpdateNewsFilter;
}) {
  return (
    <div className="grid gap-3 border-b border-gray-200 bg-gray-50/70 px-5 py-4 md:grid-cols-[minmax(220px,1fr)_180px_220px]">
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

function TableHeader() {
  return (
    <div className="hidden grid-cols-[minmax(320px,1.5fr)_140px_150px_120px_120px] gap-4 border-b border-gray-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 lg:grid">
      <span>Article</span>
      <span>Category</span>
      <span>Publication</span>
      <span>Author</span>
      <span className="text-right">Actions</span>
    </div>
  );
}

function NewsRows({
  deletingId,
  isLoading,
  posts,
  onDelete,
}: {
  deletingId: string | null;
  isLoading: boolean;
  posts: NewsPost[];
  onDelete: (post: NewsPost) => void;
}) {
  if (isLoading) {
    return <div className="p-10 text-center text-sm text-gray-500">Loading news...</div>;
  }

  if (!posts.length) {
    return (
      <div className="p-10 text-center">
        <p className="font-medium text-gray-700">No news posts found.</p>
        <p className="mt-1 text-sm text-gray-500">Adjust the filters or create a new story.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {posts.map((post) => (
        <NewsRow
          deletingId={deletingId}
          key={post.id}
          post={post}
          onDelete={() => onDelete(post)}
        />
      ))}
    </div>
  );
}

function NewsRow({
  deletingId,
  post,
  onDelete,
}: {
  deletingId: string | null;
  post: NewsPost;
  onDelete: () => void;
}) {
  return (
    <article className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(320px,1.5fr)_140px_150px_120px_120px] lg:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <CoverThumbnail post={post} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-gray-900">{post.title}</h3>
            {post.isFeatured ? (
              <Star
                aria-label="Featured"
                className="shrink-0 fill-amber-400 text-amber-400"
                size={14}
              />
            ) : null}
          </div>
          <p className="mt-1 truncate text-xs text-gray-500">/{post.slug}</p>
          {post.excerpt ? (
            <p className="mt-1 line-clamp-1 text-xs text-gray-400">{post.excerpt}</p>
          ) : null}
        </div>
      </div>

      <p className="text-sm text-gray-600">
        <span className="mr-2 text-xs text-gray-400 lg:hidden">Category:</span>
        {post.category?.name || 'Uncategorized'}
      </p>

      <div>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getNewsStatusClasses(post.status)}`}
        >
          {getNewsStatusLabel(post.status)}
        </span>
        <p className="mt-1.5 text-xs text-gray-500">{formatNewsDate(post.publishedAt)}</p>
      </div>

      <div className="min-w-0 text-sm text-gray-600">
        <p className="truncate">{post.authorName || post.author?.name || '-'}</p>
        <p className="mt-1 text-xs text-gray-400">{post.viewCount} views</p>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          aria-label={`Delete ${post.title}`}
          className="grid h-9 w-9 place-items-center p-0"
          disabled={deletingId === post.id}
          size="sm"
          type="button"
          variant="danger"
          onClick={onDelete}
        >
          <Trash2 size={15} />
        </Button>
        <Link
          to={`${NEWS_LIST_PATH}/${post.id}/edit`}
          target="_blank"
          rel="opener"
          aria-label={`Edit ${post.title} in a new tab`}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs font-bold text-gray-700 transition-colors hover:border-[#7e1518]/30 hover:bg-[#7e1518]/5 hover:text-[#7e1518]"
        >
          <Pencil size={14} />
          Edit
        </Link>
      </div>
    </article>
  );
}

function CoverThumbnail({ post }: { post: NewsPost }) {
  if (!post.coverImage) {
    return (
      <div className="grid h-14 w-20 shrink-0 place-items-center rounded-lg bg-gray-100 text-gray-400">
        <Image aria-hidden="true" size={20} />
      </div>
    );
  }

  return (
    <img
      className="h-14 w-20 shrink-0 rounded-lg bg-gray-100 object-cover"
      src={adminApi.publicAssetUrl(post.coverImage)}
      alt={post.coverImageAlt || ''}
    />
  );
}

function Pagination({
  isLoading,
  result,
  onPageChange,
}: {
  isLoading: boolean;
  result: NewsPostList;
  onPageChange: (page: number) => void;
}) {
  if (result.pagination.totalPages <= 1) return null;

  const { page, totalPages } = result.pagination;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-5 py-4">
      <p className="text-sm text-gray-500">
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
