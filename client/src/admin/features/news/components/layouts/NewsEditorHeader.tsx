import { ArrowLeft } from 'lucide-react';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';

export default function NewsEditorHeader({
  isEditing,
  onClose,
}: {
  isEditing: boolean;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <button
        aria-label="Back to news"
        className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:border-[#7e1518]/30 hover:text-[#7e1518]"
        type="button"
        onClick={onClose}
      >
        <ArrowLeft size={17} />
      </button>

      <ContentPageHeader
        breadcrumbs={[
          { label: 'Content' },
          { label: 'News', path: '/admin/news' },
          { label: isEditing ? 'Edit News' : 'Create News' },
        ]}
        title={isEditing ? 'Edit news post' : 'Create a news post'}
        description={
          isEditing
            ? 'Update the article content and publication settings.'
            : 'Write a story and save it as a draft or publish it.'
        }
      />
    </div>
  );
}
