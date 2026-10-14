import { Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { NewsPost } from '@/admin/api/adminApi';
import Button from '@/admin/components/ui/Button';
import { getNewsEditPath } from '@/admin/features/news/newsUtils';

export default function NewsRowActions({
  deletingId,
  iconSize = 15,
  post,
  onDelete,
}: {
  deletingId: string | null;
  iconSize?: number;
  post: NewsPost;
  onDelete: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center justify-end gap-1.5">
      <Link
        to={getNewsEditPath(post.id)}
        aria-label={`Edit ${post.title}`}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#E2E8F0] text-[#64748B] transition-colors hover:border-[#3C50E0]/30 hover:bg-[#3C50E0]/5 hover:text-[#3C50E0]"
      >
        <Pencil size={iconSize} />
      </Link>

      <Button
        aria-label={`Delete ${post.title}`}
        className="rounded-md"
        disabled={deletingId === post.id}
        iconOnly
        size="sm"
        type="button"
        variant="danger"
        onClick={onDelete}
      >
        <Trash2 size={iconSize} />
      </Button>
    </div>
  );
}
