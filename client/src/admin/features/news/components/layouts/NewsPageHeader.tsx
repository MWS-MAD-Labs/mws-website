import { ExternalLink, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '@/admin/components/ui/Button';
import { NEWS_LIST_PATH } from '@/admin/features/news/newsUtils';

export default function NewsPageHeader() {
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
