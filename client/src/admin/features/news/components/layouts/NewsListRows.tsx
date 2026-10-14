import type { NewsPost, NewsStatus } from '@/admin/api/adminApi';
import NewsAuthorStats from './NewsAuthorStats';
import NewsListPostSummary, { CoverThumbnail, NewsPostTitle } from './NewsListPostSummary';
import NewsListPublicationControl from './NewsListPublicationControl';
import NewsRowActions from './NewsRowActions';

export default function NewsListRows({
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
    return <div className="p-10 text-center text-sm text-[#64748B]">Loading news...</div>;
  }

  if (!posts.length) {
    return (
      <div className="p-10 text-center">
        <p className="font-medium text-[#1C2434]">No news posts found.</p>

        <p className="mt-1 text-sm text-[#64748B]">Adjust the filters or create a new story.</p>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-[#E2E8F0] lg:hidden">
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

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[900px] border-collapse">
          <TableHeader />

          <tbody className="divide-y divide-[#E2E8F0]">
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
      <tr className="border-y border-[#E2E8F0] bg-[#F1F5F9] text-left">
        <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
          Article
        </th>

        <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
          Category
        </th>

        <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
          Publication
        </th>

        <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
          Author
        </th>

        <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
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
    <tr className="transition-colors hover:bg-[#F1F5F9]/50">
      <td className="px-5 py-4 align-middle">
        <NewsListPostSummary post={post} />
      </td>

      <td className="px-5 py-4 align-middle">
        <span className="text-sm text-[#64748B]">{post.category?.name || 'Uncategorized'}</span>
      </td>

      <td className="px-5 py-4 align-middle">
        <NewsListPublicationControl
          isUpdating={isStatusUpdating}
          post={post}
          onStatusChange={onStatusChange}
        />
      </td>

      <td className="px-5 py-4 align-middle">
        <NewsAuthorStats post={post} />
      </td>

      <td className="px-5 py-4 align-middle">
        <NewsRowActions deletingId={deletingId} post={post} onDelete={onDelete} />
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
              <NewsPostTitle post={post} />
              <p className="mt-1 truncate text-xs text-[#64748B]">/{post.slug}</p>
            </div>

            <NewsRowActions deletingId={deletingId} iconSize={14} post={post} onDelete={onDelete} />
          </div>

          {post.excerpt ? (
            <p className="mt-1 line-clamp-2 text-xs text-[#64748B]">{post.excerpt}</p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#64748B]">{post.category?.name || 'Uncategorized'}</span>
            <span className="text-[#64748B]">•</span>
            <span className="text-xs text-[#64748B]">
              {post.authorName || post.author?.name || '-'}
            </span>
            <span className="text-[#64748B]">•</span>
            <span className="text-xs text-[#64748B]">{post.viewCount} views</span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <NewsListPublicationControl
              compact
              isUpdating={isStatusUpdating}
              post={post}
              onStatusChange={onStatusChange}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
