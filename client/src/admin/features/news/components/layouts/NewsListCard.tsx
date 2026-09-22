import { Image, Pencil, Star, Trash2 } from 'lucide-react';
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
import type { NewsFilters, UpdateNewsFilter } from '@/admin/features/news/newsListModel';
import {
  NEWS_LIST_PATH,
  NEWS_STATUS_OPTIONS,
  formatNewsDate,
  getNewsStatusClasses,
} from '@/admin/features/news/newsUtils';

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
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <ListHeader
        filters={filters}
        total={result.pagination.total}
        onFilterChange={onFilterChange}
      />

      <FilterBar categories={categories} filters={filters} onFilterChange={onFilterChange} />

      <NewsRows
        deletingId={deletingId}
        isLoading={isLoading}
        posts={result.items}
        statusUpdatingId={statusUpdatingId}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
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
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-5 py-4">
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
    <div className="grid gap-3 border-b border-gray-200 bg-gray-50/60 px-5 py-4 md:grid-cols-[minmax(220px,1fr)_180px_220px]">
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

function NewsRows({
  deletingId,
  isLoading,
  posts,
  statusUpdatingId,
  onDelete,
  onStatusChange,
}: {
  deletingId: string | null;
  isLoading: boolean;
  posts: NewsPost[];
  statusUpdatingId: string | null;
  onDelete: (post: NewsPost) => void;
  onStatusChange: (post: NewsPost, status: NewsStatus) => void;
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
    <>
      {/* Mobile */}
      <div className="divide-y divide-gray-200 lg:hidden">
        {posts.map((post) => (
          <MobileNewsRow
            deletingId={deletingId}
            key={post.id}
            post={post}
            statusUpdatingId={statusUpdatingId}
            onDelete={() => onDelete(post)}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[900px] border-collapse">
          <TableHeader />

          <tbody className="divide-y divide-gray-200">
            {posts.map((post) => (
              <NewsTableRow
                deletingId={deletingId}
                key={post.id}
                post={post}
                statusUpdatingId={statusUpdatingId}
                onDelete={() => onDelete(post)}
                onStatusChange={onStatusChange}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function TableHeader() {
  return (
    <thead>
      <tr className="border-y border-[#e8e2e2] bg-[#faf8f7] text-left">
        <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6f6262]">
          Article
        </th>

        <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6f6262]">
          Category
        </th>

        <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6f6262]">
          Publication
        </th>

        <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6f6262]">
          Author
        </th>

        <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#6f6262]">
          Actions
        </th>
      </tr>
    </thead>
  );
}

function NewsTableRow({
  deletingId,
  post,
  statusUpdatingId,
  onDelete,
  onStatusChange,
}: {
  deletingId: string | null;
  post: NewsPost;
  statusUpdatingId: string | null;
  onDelete: () => void;
  onStatusChange: (post: NewsPost, status: NewsStatus) => void;
}) {
  const isStatusUpdating = statusUpdatingId === post.id;

  return (
    <tr className="transition-colors hover:bg-gray-50/50">
      {/* Article */}
      <td className="px-5 py-4 align-middle">
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
      </td>

      {/* Category */}
      <td className="px-5 py-4 align-middle">
        <span className="text-sm text-gray-600">{post.category?.name || 'Uncategorized'}</span>
      </td>

      {/* Publication */}
      <td className="px-5 py-4 align-middle">
        <div className="min-w-0 space-y-1">
          <Select
            aria-label={`Change publication status for ${post.title}`}
            className={`w-full text-xs font-medium ${getNewsStatusClasses(post.status)}`}
            disabled={isStatusUpdating}
            value={post.status}
            onChange={(event) => onStatusChange(post, event.target.value as NewsStatus)}
          >
            {NEWS_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <p className="truncate text-[11px] leading-4 text-gray-400">
            {post.publishedAt ? formatNewsDate(post.publishedAt) : 'Not published'}
          </p>
        </div>
      </td>

      {/* Author */}
      <td className="px-5 py-4 align-middle">
        <div className="min-w-0">
          <p className="truncate text-sm text-gray-600">
            {post.authorName || post.author?.name || '-'}
          </p>

          <p className="mt-1 text-xs text-gray-400">{post.viewCount} views</p>
        </div>
      </td>

      {/* Actions */}
      <td className="px-5 py-4 align-middle">
        <div className="flex items-center justify-end gap-1.5">
          <Button
            aria-label={`Delete ${post.title}`}
            className="h-50 w-50 rounded-md p-0"
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
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-gray-200 px-3 text-xs font-semibold text-gray-700 transition-colors hover:border-[#7e1518]/30 hover:bg-[#7e1518]/5 hover:text-[#7e1518]"
          >
            <Pencil size={14} />
          </Link>
        </div>
      </td>
    </tr>
  );
}

function MobileNewsRow({
  deletingId,
  post,
  statusUpdatingId,
  onDelete,
  onStatusChange,
}: {
  deletingId: string | null;
  post: NewsPost;
  statusUpdatingId: string | null;
  onDelete: () => void;
  onStatusChange: (post: NewsPost, status: NewsStatus) => void;
}) {
  const isStatusUpdating = statusUpdatingId === post.id;

  return (
    <article className="p-4">
      <div className="flex min-w-0 gap-3">
        <CoverThumbnail post={post} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
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
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                aria-label={`Delete ${post.title}`}
                className="h-8 w-8 rounded-md p-0"
                disabled={deletingId === post.id}
                size="sm"
                type="button"
                variant="danger"
                onClick={onDelete}
              >
                <Trash2 size={14} />
              </Button>

              <Link
                to={`${NEWS_LIST_PATH}/${post.id}/edit`}
                target="_blank"
                rel="opener"
                aria-label={`Edit ${post.title} in a new tab`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition-colors hover:border-[#7e1518]/30 hover:bg-[#7e1518]/5 hover:text-[#7e1518]"
              >
                <Pencil size={14} />
              </Link>
            </div>
          </div>

          {post.excerpt ? (
            <p className="mt-1 line-clamp-2 text-xs text-gray-400">{post.excerpt}</p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500">{post.category?.name || 'Uncategorized'}</span>

            <span className="text-gray-300">•</span>

            <span className="text-xs text-gray-500">
              {post.authorName || post.author?.name || '-'}
            </span>

            <span className="text-gray-300">•</span>

            <span className="text-xs text-gray-400">{post.viewCount} views</span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Select
              aria-label={`Change publication status for ${post.title}`}
              className={`flex-1 text-xs font-medium ${getNewsStatusClasses(post.status)}`}
              disabled={isStatusUpdating}
              value={post.status}
              onChange={(event) => onStatusChange(post, event.target.value as NewsStatus)}
            >
              {NEWS_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <span className="shrink-0 text-[11px] text-gray-400">
              {post.publishedAt ? formatNewsDate(post.publishedAt) : 'Not published'}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function CoverThumbnail({ post }: { post: NewsPost }) {
  if (!post.coverImage) {
    return (
      <div className="grid h-14 w-20 shrink-0 place-items-center rounded-md bg-gray-100 text-gray-400">
        <Image aria-hidden="true" size={20} />
      </div>
    );
  }

  return (
    <img
      className="h-14 w-20 shrink-0 rounded-md bg-gray-100 object-cover"
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
  if (result.pagination.totalPages <= 1) {
    return null;
  }

  const { page, totalPages } = result.pagination;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-gray-200 bg-gray-50/30 px-5 py-4">
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
