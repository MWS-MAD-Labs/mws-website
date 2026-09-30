import { ExternalLink, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '@/admin/components/ui/Button';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';
import { NEWS_LIST_PATH } from '@/admin/features/news/newsUtils';

export default function NewsPageHeader() {
  return (
    <ContentPageHeader
      breadcrumbs={[{ label: 'Content' }, { label: 'News' }]}
      title="All News"
      description="Manage school news, drafts, featured stories, and publication dates."
      action={
        <Link to={`${NEWS_LIST_PATH}/new`} target="_blank" rel="opener" className="inline-flex">
          <Button className="inline-flex items-center gap-2" type="button">
            <Plus size={16} />
            Create News
            <ExternalLink size={14} />
          </Button>
        </Link>
      }
    />
  );
}
