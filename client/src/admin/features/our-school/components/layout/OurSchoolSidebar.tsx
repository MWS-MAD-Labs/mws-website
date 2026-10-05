import { Eye } from 'lucide-react';

import Button from '@/admin/components/ui/Button';
import GalleryThumb from '@/admin/features/gallery/components/GalleryThumb';
import { adminApi } from '@/admin/api/adminApi';
import type { OurSchoolEditorState } from '../../hooks/useOurSchoolEditor';

const cardClass = 'min-w-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white';

type OurSchoolSidebarProps = {
  editor: OurSchoolEditorState;
};

export default function OurSchoolSidebar({ editor }: OurSchoolSidebarProps) {
  const {
    content,
    featuredImageId,
    isBusy,
    isSaving,
    pageId,
    persist,
    selectedFeaturedImage,
    selectedGallery,
    setFeaturedImageId,
    setIsGalleryPickerOpen,
  } = editor;
  const isPublished = content.status === 'PUBLISHED';

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
            {pageId ? (isPublished ? 'Published' : 'Draft') : 'Not saved'}
          </span>
        </div>

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
            onClick={() => window.open('/our-school', '_blank', 'noopener,noreferrer')}
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
            Connected gallery and featured image for this page.
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
          <label className="grid gap-1 text-sm font-medium text-[#1C2434]">
            Featured image
            <select
              className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm"
              disabled={isBusy}
              value={featuredImageId ?? ''}
              onChange={(event) => setFeaturedImageId(event.target.value || null)}
            >
              <option value="">Auto select</option>
              {selectedGallery.images.map((image) => (
                <option key={image.id} value={image.id}>
                  {image.title || image.path}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {selectedFeaturedImage ? (
          <img
            className="aspect-video rounded-lg object-cover"
            src={adminApi.galleryImageUrl(selectedFeaturedImage)}
            alt={selectedFeaturedImage.title || selectedGallery?.title || 'Featured image'}
          />
        ) : null}
      </section>
    </aside>
  );
}
