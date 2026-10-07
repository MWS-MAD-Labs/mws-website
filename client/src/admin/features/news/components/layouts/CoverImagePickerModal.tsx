import { useMemo, useRef, useState, type ChangeEvent } from 'react';

import {
  adminApi,
  type GalleryImageItem,
  type GalleryItem,
  type GalleryVideoItem,
} from '@/admin/api/adminApi';

import Button from '@/admin/components/ui/Button';
import Modal from '@/admin/components/ui/Modal';
import SearchInput from '@/admin/components/ui/SearchInput';

import type {
  GalleryAssetKind,
  GalleryAssetSelection,
} from '@/admin/features/gallery/components/GalleryAssetPickerModal';

type CoverImagePickerModalProps = {
  allowUpload?: boolean;
  allowedKinds?: GalleryAssetKind[];
  galleries: GalleryItem[];
  open: boolean;
  title?: string;
  onClose: () => void;
  onSelect: (asset: GalleryAssetSelection) => void;
  onSelectLocalFile?: (file: File) => void;
};

type PickerMode = 'GALLERY' | 'UPLOAD';

export default function CoverImagePickerModal({
  allowUpload = true,
  allowedKinds = ['IMAGE'],
  galleries,
  open,
  title = 'Choose image',
  onClose,
  onSelect,
  onSelectLocalFile,
}: CoverImagePickerModalProps) {
  const [mode, setMode] = useState<PickerMode>('GALLERY');
  const [activeGalleryId, setActiveGalleryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canSelectImages = allowedKinds.includes('IMAGE');
  const canSelectVideos = allowedKinds.includes('VIDEO');
  const canUploadImages = allowUpload && canSelectImages && Boolean(onSelectLocalFile);

  const filteredGalleries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return galleries;

    return galleries.filter((gallery) =>
      [gallery.title, gallery.description ?? ''].join(' ').toLowerCase().includes(query),
    );
  }, [galleries, searchQuery]);

  const activeGallery = galleries.find((gallery) => gallery.id === activeGalleryId) ?? null;
  const assets = activeGallery
    ? [
        ...(canSelectImages
          ? activeGallery.images.map((image) => ({
              id: image.id,
              kind: 'IMAGE' as const,
              image,
              label: image.title || image.caption || 'Gallery image',
              selection: imageSelection(activeGallery, image),
            }))
          : []),
        ...(canSelectVideos
          ? activeGallery.videos.map((video) => ({
              id: video.id,
              kind: 'VIDEO' as const,
              label: video.title || video.caption || 'Gallery video',
              selection: videoSelection(activeGallery, video),
              video,
            }))
          : []),
      ]
    : [];

  function close() {
    setMode('GALLERY');
    setActiveGalleryId(null);
    setSearchQuery('');
    onClose();
  }

  function selectLocalFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file && onSelectLocalFile) {
      onSelectLocalFile(file);
      close();
    }

    event.target.value = '';
  }

  function selectGalleryAsset(asset: GalleryAssetSelection) {
    onSelect(asset);
    close();
  }

  return (
    <Modal open={open} title={title} onClose={close}>
      <div className="flex flex-col">
        {/* Tabs */}
        <div className="border-b border-[#E2E8F0] pb-4 pt-1">
          <div className="inline-flex rounded-md bg-[#F1F5F9] p-1">
            <PickerTab
              active={mode === 'GALLERY'}
              label="Gallery"
              onClick={() => setMode('GALLERY')}
            />
            {canUploadImages ? (
              <PickerTab
                active={mode === 'UPLOAD'}
                label="Upload"
                onClick={() => setMode('UPLOAD')}
              />
            ) : null}
          </div>
        </div>

        {/* Body */}
        <div className="h-[58vh] min-h-[340px]">
          {mode === 'UPLOAD' ? (
            <div className="h-full py-4">
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
                className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-[#E2E8F0] bg-[#F1F5F9] px-6 text-center hover:border-[#3C50E0]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#64748B]">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 16V4" />
                    <path d="m7 9 5-5 5 5" />
                    <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
                  </svg>
                </span>

                <span>
                  <span className="block text-sm font-semibold text-[#1C2434]">
                    Upload an image
                  </span>
                  <span className="mt-1 block text-xs text-[#64748B]">
                    JPG, PNG, WEBP, or GIF · Max 10 MB
                  </span>
                </span>

                <span className="rounded-md border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#1C2434]">
                  Browse files
                </span>
              </button>
            </div>
          ) : !activeGallery ? (
            /* Step 1: gallery list */
            <div className="flex h-full flex-col gap-4 pt-4">
              <SearchInput
                placeholder="Search gallery"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />

              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
                {filteredGalleries.length ? (
                  filteredGalleries.map((gallery) => (
                    <button
                      key={gallery.id}
                      type="button"
                      onClick={() => setActiveGalleryId(gallery.id)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-left hover:border-[#3C50E0] hover:bg-[#F1F5F9]"
                    >
                      <span className="truncate text-sm font-semibold text-[#1C2434]">
                        {gallery.title}
                      </span>

                      <span className="flex shrink-0 items-center gap-2 text-xs text-[#64748B]">
                        {galleryAssetCount(gallery, allowedKinds)}
                        <ChevronIcon direction="right" />
                      </span>
                    </button>
                  ))
                ) : (
                  <EmptyState text="No galleries found." />
                )}
              </div>
            </div>
          ) : (
            /* Step 2: assets in the selected gallery */
            <div className="flex h-full flex-col">
              <div className="flex shrink-0 items-center gap-3 border-b border-[#E2E8F0] py-4">
                <button
                  type="button"
                  onClick={() => setActiveGalleryId(null)}
                  className="flex shrink-0 items-center gap-1 rounded-md border border-[#E2E8F0] bg-white py-1.5 pl-2 pr-3 text-sm font-medium text-[#1C2434] hover:bg-[#F1F5F9]"
                >
                  <ChevronIcon direction="left" />
                  Back
                </button>

                <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-[#1C2434]">
                  {activeGallery.title}
                </h3>

                <span className="shrink-0 text-xs text-[#64748B]">
                  {assetCountLabel(assets.length, canSelectVideos && !canSelectImages ? 'video' : 'asset')}
                </span>
              </div>

              <div className="flex min-h-0 flex-1 flex-col pt-4">
                {!assets.length ? (
                  <EmptyState
                    text={
                      canSelectVideos && !canSelectImages
                        ? 'No videos in this gallery.'
                        : 'No matching assets in this gallery.'
                    }
                  />
                ) : (
                  <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-3 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
                    {assets.map((asset) => (
                      <button
                        key={`${asset.kind}-${asset.id}`}
                        type="button"
                        onClick={() => selectGalleryAsset(asset.selection)}
                        className="group text-left"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-[#E2E8F0] bg-[#F1F5F9] group-hover:border-[#3C50E0] group-focus-visible:border-[#3C50E0]">
                          {asset.kind === 'IMAGE' ? (
                            <img
                              src={adminApi.galleryImageUrl(asset.image)}
                              alt={asset.selection.alt}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <VideoPreview video={asset.video} />
                          )}

                          {asset.kind === 'VIDEO' ? (
                            <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                              Video
                            </span>
                          ) : null}
                        </div>

                        <span className="mt-1.5 block truncate text-xs text-[#64748B] group-hover:text-[#1C2434]">
                          {asset.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-[#E2E8F0] pt-4">
          <Button type="button" variant="outline" onClick={close}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function imageSelection(gallery: GalleryItem, image: GalleryImageItem): GalleryAssetSelection {
  return {
    alt: image.title || image.caption || gallery.title,
    galleryId: gallery.id,
    kind: 'IMAGE',
    label: image.title || image.caption || 'Gallery image',
    path: adminApi.galleryImagePublicPath(image),
  };
}

function videoSelection(gallery: GalleryItem, video: GalleryVideoItem): GalleryAssetSelection {
  return {
    alt: video.title || video.caption || gallery.title,
    galleryId: gallery.id,
    kind: 'VIDEO',
    label: video.title || video.caption || 'Gallery video',
    path: adminApi.galleryVideoPublicPath(video),
  };
}

function galleryAssetCount(gallery: GalleryItem, allowedKinds: GalleryAssetKind[]) {
  const parts = [];

  if (allowedKinds.includes('IMAGE')) {
    parts.push(assetCountLabel(gallery.images.length, 'image'));
  }

  if (allowedKinds.includes('VIDEO')) {
    parts.push(assetCountLabel(gallery.videos.length, 'video'));
  }

  return parts.join(' / ');
}

function assetCountLabel(count: number, noun: string) {
  return `${count} ${count === 1 ? noun : `${noun}s`}`;
}

function VideoPreview({ video }: { video: GalleryVideoItem }) {
  if (video.sourceType === 'UPLOAD') {
    return (
      <video
        className="h-full w-full object-cover"
        src={adminApi.galleryVideoUrl(video)}
        muted
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center text-[#64748B]">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#1C2434] shadow-sm">
        <svg
          viewBox="0 0 24 24"
          className="ml-0.5 h-5 w-5"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      <span className="line-clamp-2 text-xs font-medium">
        {video.title || video.caption || 'YouTube video'}
      </span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-[#E2E8F0] p-6 text-sm text-[#64748B]">
      {text}
    </div>
  );
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
    </svg>
  );
}

type PickerTabProps = {
  active: boolean;
  label: string;
  onClick: () => void;
};

function PickerTab({ active, label, onClick }: PickerTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded px-4 py-1.5 text-sm font-medium',
        active ? 'bg-white text-[#1C2434] shadow-sm' : 'text-[#64748B] hover:text-[#1C2434]',
      ].join(' ')}
    >
      {label}
    </button>
  );
}
