import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '@/admin/components/ui/Button';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';

export default function NewsPageHeader() {
  const navigate = useNavigate();

  return (
    <ContentPageHeader
      breadcrumbs={[{ label: 'Content' }, { label: 'News' }]}
      title="All News"
      description="Manage school news, drafts, featured stories, and publication dates."
      action={
        <Button
          className="inline-flex items-center gap-2"
          type="button"
          onClick={() => navigate('/admin/news/new')}
        >
          <Plus size={16} />
          Create News
        </Button>
      }
    />
  );
}
