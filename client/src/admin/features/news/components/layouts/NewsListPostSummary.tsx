import { Image, Star } from 'lucide-react';
import { adminApi, type NewsPost } from '@/admin/api/adminApi';

export default function NewsListPostSummary({ post }: { post: NewsPost }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <CoverThumbnail post={post} />

      <div className="min-w-0">
        <NewsPostTitle post={post} />
        <p className="mt-1 truncate text-xs text-[#64748B]">/{post.slug}</p>

        {post.excerpt ? (
          <p className="mt-1 line-clamp-1 text-xs text-[#64748B]">{post.excerpt}</p>
        ) : null}
      </div>
    </div>
  );
}

export function NewsPostTitle({ post }: { post: NewsPost }) {
  return (
    <div className="flex items-center gap-2">
      <h3 className="truncate text-sm font-semibold text-[#1C2434]">{post.title}</h3>

      {post.isFeatured ? (
        <Star aria-label="Featured" className="shrink-0 fill-[#F59E0B] text-[#F59E0B]" size={14} />
      ) : null}
    </div>
  );
}

export function CoverThumbnail({ post }: { post: NewsPost }) {
  if (!post.coverImage) {
    return (
      <div className="grid h-14 w-20 shrink-0 place-items-center rounded-md bg-[#F1F5F9] text-[#64748B]">
        <Image aria-hidden="true" size={20} />
      </div>
    );
  }

  return (
    <img
      className="h-14 w-20 shrink-0 rounded-md bg-[#F1F5F9] object-cover"
      src={adminApi.publicAssetUrl(post.coverImage)}
      alt={post.coverImageAlt || ''}
    />
  );
}
