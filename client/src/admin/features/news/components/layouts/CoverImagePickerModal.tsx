import { useMemo, useRef, useState, type ChangeEvent } from 'react';

import { adminApi, type GalleryImageItem, type GalleryItem } from '@/admin/api/adminApi';

import Button from '@/admin/components/ui/Button';

import Modal from '@/admin/components/ui/Modal';

import SearchInput from '@/admin/components/ui/SearchInput';

import type { GalleryAssetSelection } from '@/admin/features/gallery/components/GalleryAssetPickerModal';

type CoverImagePickerModalProps = {
  open: boolean;

  galleries: GalleryItem[];

  onClose: () => void;

  onSelect: (asset: GalleryAssetSelection) => void;

  onSelectLocalFile: (file: File) => void;
};

type PickerMode = 'GALLERY' | 'UPLOAD' | 'VIDEO';

export default function CoverImagePickerModal({
  open,
  galleries,
  onClose,
  onSelect,
  onSelectLocalFile,
}: CoverImagePickerModalProps) {
  const [mode, setMode] = useState<PickerMode>('GALLERY');

  const [activeGalleryId, setActiveGalleryId] = useState<string | null>(galleries[0]?.id ?? null);

  const [searchQuery, setSearchQuery] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredGalleries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return galleries;
    }

    return galleries.filter((gallery) =>
      [gallery.title, gallery.description ?? ''].join(' ').toLowerCase().includes(query),
    );
  }, [galleries, searchQuery]);

  const activeGallery =
    galleries.find((gallery) => gallery.id === activeGalleryId) ?? filteredGalleries[0] ?? null;

  const images = activeGallery?.images ?? [];

  function selectLocalFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      onSelectLocalFile(file);
      onClose();
    }

    event.target.value = '';
  }

  function selectGalleryImage(gallery: GalleryItem, image: GalleryImageItem) {
    onSelect({
      alt: image.title || image.caption || gallery.title,

      galleryId: gallery.id,

      kind: 'IMAGE',

      label: image.title || image.caption || 'Gallery image',

      path: adminApi.galleryImagePublicPath(image),
    });

    onClose();
  }

  return (
    <Modal open={open} title="Choose news cover image" onClose={onClose}>
      <div className="space-y-4">
        {/* Tabs */}
        <div className="border-b border-[#E2E8F0]">
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => setMode('GALLERY')}
              className={[
                'border-b-2 px-1 pb-3 text-sm font-medium',
                mode === 'GALLERY'
                  ? 'border-[#3C50E0] text-[#3C50E0]'
                  : 'border-transparent text-[#64748B] hover:text-[#1C2434]',
              ].join(' ')}
            >
              Gallery
            </button>

            <button
              type="button"
              onClick={() => setMode('UPLOAD')}
              className={[
                'border-b-2 px-1 pb-3 text-sm font-medium',
                mode === 'UPLOAD'
                  ? 'border-[#3C50E0] text-[#3C50E0]'
                  : 'border-transparent text-[#64748B] hover:text-[#1C2434]',
              ].join(' ')}
            >
              Upload from computer
            </button>
          </div>
        </div>

        {/* Gallery */}
        {mode === 'GALLERY' ? (
          <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
            {/* Gallery list */}
            <div className="grid gap-3">
              <SearchInput
                placeholder="Search gallery"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />

              <div className="max-h-[52vh] overflow-y-auto rounded-lg border border-[#E2E8F0]">
                {filteredGalleries.length ? (
                  filteredGalleries.map((gallery) => {
                    const isActive = gallery.id === activeGallery?.id;

                    return (
                      <button
                        key={gallery.id}
                        type="button"
                        onClick={() => setActiveGalleryId(gallery.id)}
                        className={[
                          'block w-full border-b border-[#E2E8F0] px-3 py-3 text-left last:border-b-0',
                          isActive
                            ? 'bg-[#F1F5F9] text-[#3C50E0]'
                            : 'bg-white text-[#1C2434] hover:bg-[#F1F5F9]',
                        ].join(' ')}
                      >
                        <span className="block truncate text-sm font-semibold">
                          {gallery.title}
                        </span>

                        <span className="block text-xs text-[#64748B]">
                          {gallery.images.length} Images
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 text-sm text-[#64748B]">No galleries found.</div>
                )}
              </div>
            </div>

            {/* Images */}
            <div className="min-w-0">
              {!activeGallery ? (
                <div className="rounded-lg border border-dashed border-[#E2E8F0] p-6 text-sm text-[#64748B]">
                  No gallery available.
                </div>
              ) : !images.length ? (
                <div className="rounded-lg border border-dashed border-[#E2E8F0] p-6 text-sm text-[#64748B]">
                  No images in this gallery.
                </div>
              ) : (
                <div className="grid max-h-[52vh] gap-3 overflow-y-auto sm:grid-cols-2 xl:grid-cols-3">
                  {images.map((image) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => selectGalleryImage(activeGallery, image)}
                      className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white text-left transition hover:border-[#3C50E0] hover:shadow-sm"
                    >
                      <div className="aspect-video bg-[#F1F5F9]">
                        <img
                          src={adminApi.galleryImageUrl(image)}
                          alt={image.title || image.caption || activeGallery.title}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <span className="block truncate px-3 py-2 text-sm font-semibold text-[#1C2434]">
                        {image.title || image.caption || 'Gallery image'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Upload */
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={selectLocalFile}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-[300px] w-full items-center justify-center rounded-xl border border-dashed border-[#E2E8F0] bg-[#F1F5F9] px-6 text-center transition hover:border-[#3C50E0] hover:bg-[#F1F5F9]"
            >
              <div>
                <p className="text-sm font-semibold text-[#1C2434]">Upload an image</p>

                <p className="mt-1 text-sm text-[#64748B]">Click to browse from your computer</p>

                <p className="mt-2 text-xs text-[#64748B]">JPG, PNG, WEBP, or GIF · Max 10 MB</p>
              </div>
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end border-t border-[#E2E8F0] pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
