import { Eye, Trash2 } from 'lucide-react';

import Button from '@/admin/components/ui/Button';
import Field from '@/admin/components/ui/Field';
import { inputClass } from '@/admin/features/news/components/layouts/formStyles';
import type { AcademicLevelEditorState } from '../../hooks/useAcademicLevelEditor';
import AcademicLevelImageField from './AcademicLevelImageField';

const cardClass = 'min-w-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white';

type AcademicLevelSidebarProps = {
  editor: AcademicLevelEditorState;
};

export default function AcademicLevelSidebar({ editor }: AcademicLevelSidebarProps) {
  const {
    config,
    content,
    coverImage,
    deleteLevel,
    isBusy,
    isPublished,
    isSaving,
    itemId,
    persist,
    publishedAt,
    setActiveImageField,
    setCoverImage,
    setPublishedAt,
    unpublish,
    updatedAt,
  } = editor;

  return (
    <aside className="min-w-0 space-y-5 lg:sticky lg:top-6">
      <section className={`${cardClass} grid gap-4 p-4`}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[#1C2434]">Status</h2>
          <span
            className={[
              'rounded-md px-2 py-1 text-xs font-semibold',
              isPublished
                ? 'bg-[#10B981]/10 text-[#047857]'
                : 'bg-[#F59E0B]/10 text-[#D97706]',
            ].join(' ')}
          >
            {isPublished ? 'Published' : itemId ? 'Draft' : 'Not saved'}
          </span>
        </div>

        {updatedAt ? (
          <p className="text-xs text-[#64748B]">
            Last saved {new Date(updatedAt).toLocaleString()}
          </p>
        ) : null}

        <Field label="Published at">
          <input
            className={inputClass}
            type="datetime-local"
            value={publishedAt}
            onChange={(event) => setPublishedAt(event.target.value)}
          />
        </Field>

        <div className="grid gap-2">
          <Button disabled={isBusy} type="button" onClick={() => void persist('PUBLISHED')}>
            {isSaving ? 'Saving...' : isPublished ? 'Update' : 'Publish'}
          </Button>
          <Button
            disabled={isBusy}
            type="button"
            variant="outline"
            onClick={() => (isPublished ? unpublish() : void persist('DRAFT'))}
          >
            {isPublished ? 'Unpublish' : 'Save Draft'}
          </Button>
          <Button
            disabled={isBusy || !itemId}
            type="button"
            variant="ghost"
            onClick={() =>
              window.open(`${config.previewPath}?preview=draft`, '_blank', 'noopener,noreferrer')
            }
          >
            <Eye size={15} />
            Preview
          </Button>
          <p className="text-xs text-[#64748B]">
            {isPublished
              ? 'Update changes the live page immediately.'
              : 'Preview shows the last saved draft.'}
          </p>
        </div>
      </section>

      <section className={`${cardClass} grid gap-3 p-4`}>
        <div>
          <h2 className="text-sm font-semibold text-[#1C2434]">Program Card</h2>
          <p className="mt-1 text-xs text-[#64748B]">
            Card image on /academic. Falls back to the hero image when empty.
          </p>
        </div>
        <AcademicLevelImageField
          disabled={isBusy}
          field="cover"
          image={coverImage || content.hero.image}
          onChoose={setActiveImageField}
          onRemove={coverImage ? () => setCoverImage('') : undefined}
        />
      </section>

      {itemId ? (
        <section className={`${cardClass} grid gap-3 p-4`}>
          <div>
            <h2 className="text-sm font-semibold text-[#B91C1C]">Danger Zone</h2>
            <p className="mt-1 text-xs text-[#64748B]">
              Deleting removes saved content. The public page falls back to default content.
            </p>
          </div>
          <Button
            disabled={isBusy}
            size="sm"
            type="button"
            variant="danger"
            onClick={() => void deleteLevel()}
          >
            <Trash2 size={15} />
            Delete content
          </Button>
        </section>
      ) : null}
    </aside>
  );
}
