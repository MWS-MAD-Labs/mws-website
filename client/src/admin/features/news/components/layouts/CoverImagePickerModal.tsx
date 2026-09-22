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

type PickerMode = 'GALLERY' | 'UPLOAD';

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
        <div className="border-b border-gray-200">
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => setMode('GALLERY')}
              className={[
                'border-b-2 px-1 pb-3 text-sm font-medium',
                mode === 'GALLERY'
                  ? 'border-[#7e1518] text-[#7e1518]'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
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
                  ? 'border-[#7e1518] text-[#7e1518]'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
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

              <div className="max-h-[52vh] overflow-y-auto rounded-lg border border-gray-200">
                {filteredGalleries.length ? (
                  filteredGalleries.map((gallery) => {
                    const isActive = gallery.id === activeGallery?.id;

                    return (
                      <button
                        key={gallery.id}
                        type="button"
                        onClick={() => setActiveGalleryId(gallery.id)}
                        className={[
                          'block w-full border-b border-gray-200 px-3 py-3 text-left last:border-b-0',
                          isActive
                            ? 'bg-[#faf8f3] text-[#7e1518]'
                            : 'bg-white text-gray-700 hover:bg-gray-50',
                        ].join(' ')}
                      >
                        <span className="block truncate text-sm font-semibold">
                          {gallery.title}
                        </span>

                        <span className="block text-xs text-gray-500">
                          {gallery.images.length} Images
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 text-sm text-gray-500">No galleries found.</div>
                )}
              </div>
            </div>

            {/* Images */}
            <div className="min-w-0">
              {!activeGallery ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-6 text-sm text-gray-500">
                  No gallery available.
                </div>
              ) : !images.length ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-6 text-sm text-gray-500">
                  No images in this gallery.
                </div>
              ) : (
                <div className="grid max-h-[52vh] gap-3 overflow-y-auto sm:grid-cols-2 xl:grid-cols-3">
                  {images.map((image) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => selectGalleryImage(activeGallery, image)}
                      className="overflow-hidden rounded-lg border border-gray-200 bg-white text-left transition hover:border-[#7e1518] hover:shadow-sm"
                    >
                      <div className="aspect-video bg-gray-100">
                        <img
                          src={adminApi.galleryImageUrl(image)}
                          alt={image.title || image.caption || activeGallery.title}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <span className="block truncate px-3 py-2 text-sm font-semibold text-gray-900">
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
              className="flex min-h-[300px] w-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 text-center transition hover:border-[#7e1518] hover:bg-[#faf8f3]"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">Upload an image</p>

                <p className="mt-1 text-sm text-gray-500">Click to browse from your computer</p>

                <p className="mt-2 text-xs text-gray-400">JPG, PNG, WEBP, or GIF · Max 10 MB</p>
              </div>
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-200 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
