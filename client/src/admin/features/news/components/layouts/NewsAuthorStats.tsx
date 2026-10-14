import type { NewsPost } from '@/admin/api/adminApi';

export default function NewsAuthorStats({ post }: { post: NewsPost }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm text-[#64748B]">
        {post.authorName || post.author?.name || '-'}
      </p>

      <p className="mt-1 text-xs text-[#64748B]">{post.viewCount} views</p>
    </div>
  );
}
