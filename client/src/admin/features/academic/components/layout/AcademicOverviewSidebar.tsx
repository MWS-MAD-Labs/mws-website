import { Eye, Trash2 } from 'lucide-react';

import Button from '@/admin/components/ui/Button';
import GalleryThumb from '@/admin/features/gallery/components/GalleryThumb';
import type { AcademicOverviewEditorState } from '../../hooks/useAcademicOverviewEditor';

const cardClass = 'min-w-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white';

type AcademicOverviewSidebarProps = {
  editor: AcademicOverviewEditorState;
};

export default function AcademicOverviewSidebar({ editor }: AcademicOverviewSidebarProps) {
  const {
    deleteOverview,
    form,
    isBusy,
    isSaving,
    isUploadingImage,
    overviewId,
    saveOverview,
    selectedGallery,
    setIsGalleryPickerOpen,
    updateForm,
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
              overviewId ? 'bg-[#10B981]/10 text-[#047857]' : 'bg-[#F59E0B]/10 text-[#D97706]',
            ].join(' ')}
          >
            {overviewId ? 'Saved' : 'Not saved'}
          </span>
        </div>

        {updatedAt ? (
          <p className="text-xs text-[#64748B]">
            Last saved {new Date(updatedAt).toLocaleString()}
          </p>
        ) : null}

        <div className="grid gap-2">
          <Button disabled={isBusy} type="button" onClick={() => void saveOverview()}>
            {isUploadingImage
              ? 'Uploading...'
              : isSaving
                ? 'Saving...'
                : overviewId
                  ? 'Update'
                  : 'Save'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => window.open('/academic', '_blank', 'noopener,noreferrer')}
          >
            <Eye size={15} />
            Preview
          </Button>

          {overviewId ? (
            <Button
              disabled={isBusy}
              size="sm"
              type="button"
              variant="danger"
              onClick={() => void deleteOverview()}
            >
              <Trash2 size={15} />
              Delete overview
            </Button>
          ) : null}
        </div>
      </section>

      <section className={`${cardClass} grid gap-3 p-4`}>
        <div>
          <h2 className="text-sm font-semibold text-[#1C2434]">Activity Gallery</h2>
          <p className="mt-1 text-xs text-[#64748B]">
            Connected media collection for this overview page.
          </p>
        </div>

        {selectedGallery ? (
          <div className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] p-3">
            <GalleryThumb gallery={selectedGallery} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#1C2434]">
                {selectedGallery.title}
              </p>
              <p className="truncate text-sm text-[#64748B]">
                {selectedGallery.description || '-'}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[#E2E8F0] p-4 text-sm text-[#64748B]">
            No gallery selected.
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {form.galleryId ? (
            <Button
              disabled={isBusy}
              size="sm"
              type="button"
              variant="ghost"
              onClick={() => updateForm('galleryId', null)}
            >
              Clear
            </Button>
          ) : null}
          <Button
            disabled={isBusy}
            size="sm"
            type="button"
            variant="outline"
            onClick={() => setIsGalleryPickerOpen(true)}
          >
            Choose Gallery
          </Button>
        </div>
      </section>
    </aside>
  );
}
