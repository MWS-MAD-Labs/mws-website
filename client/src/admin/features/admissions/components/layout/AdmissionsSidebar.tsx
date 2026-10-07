import { Eye } from 'lucide-react';

import { adminApi } from '@/admin/api/adminApi';
import Button from '@/admin/components/ui/Button';
import GalleryThumb from '@/admin/features/gallery/components/GalleryThumb';

import type { AdmissionsEditorState } from '../../hooks/useAdmissionsEditor';

const cardClass = 'min-w-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white';

type AdmissionsSidebarProps = {
  editor: AdmissionsEditorState;
};

export default function AdmissionsSidebar({ editor }: AdmissionsSidebarProps) {
  const {
    activeCount,
    content,
    imageCount,
    isBusy,
    isSaving,
    isUploadingImage,
    pageId,
    persist,
    programs,
    selectedGallery,
    setIsGalleryPickerOpen,
    updatedAt,
  } = editor;
  const isPublished = content.status === 'PUBLISHED';

  return (
    <aside className="min-w-0 space-y-5 lg:sticky lg:top-6">
      <section className={`${cardClass} grid gap-4 p-4`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[#1C2434]">Publishing</h2>
            <p className="mt-1 text-xs text-[#64748B]">
              Save admissions content before publishing it to the public page.
            </p>
          </div>
          <span
            className={[
              'shrink-0 rounded-md px-2 py-1 text-xs font-semibold',
              isPublished
                ? 'bg-[#10B981]/10 text-[#047857]'
                : 'bg-[#F59E0B]/10 text-[#D97706]',
            ].join(' ')}
          >
            {pageId ? (isPublished ? 'Published' : 'Draft') : 'Not saved'}
          </span>
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#64748B]">Working state</dt>
            <dd className="font-medium text-[#1C2434]">
              {isUploadingImage ? 'Uploading image...' : isSaving ? 'Saving...' : 'Ready'}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#64748B]">Programs</dt>
            <dd className="font-medium text-[#1C2434]">{programs.length}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#64748B]">Visible</dt>
            <dd className="font-medium text-[#1C2434]">{activeCount}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#64748B]">Updated</dt>
            <dd className="font-medium text-[#1C2434]">
              {updatedAt ? new Date(updatedAt).toLocaleDateString() : '-'}
            </dd>
          </div>
        </dl>

        <div className="grid gap-2">
          <Button disabled={isBusy} type="button" onClick={() => void persist('PUBLISHED')}>
            {isSaving ? 'Saving...' : isPublished ? 'Update' : 'Publish'}
          </Button>
          <Button
            disabled={isBusy}
            type="button"
            variant="outline"
            onClick={() => void persist('DRAFT')}
          >
            Save Draft
          </Button>
          <Button
            disabled={isBusy}
            type="button"
            variant="ghost"
            onClick={() => window.open('/admission', '_blank', 'noopener,noreferrer')}
          >
            <Eye size={15} />
            Preview Live
          </Button>
        </div>
      </section>

      <section className={`${cardClass} grid gap-3 p-4`}>
        <div>
          <h2 className="text-sm font-semibold text-[#1C2434]">Activity Gallery</h2>
          <p className="mt-1 text-xs text-[#64748B]">
            Connected gallery for admissions page media.
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

        <Button
          disabled={isBusy}
          size="sm"
          type="button"
          variant="outline"
          onClick={() => setIsGalleryPickerOpen(true)}
        >
          Choose Gallery
        </Button>

        {selectedGallery?.images.length ? (
          <img
            className="aspect-video rounded-lg object-cover"
            src={adminApi.galleryImageUrl(selectedGallery.images[0]!)}
            alt={selectedGallery.images[0]!.title || selectedGallery.title}
          />
        ) : null}

        <dl className="space-y-3 border-t border-[#E2E8F0] pt-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#64748B]">Images selected</dt>
            <dd className="font-medium text-[#1C2434]">
              {imageCount}/{programs.length}
            </dd>
          </div>
        </dl>
      </section>
    </aside>
  );
}
