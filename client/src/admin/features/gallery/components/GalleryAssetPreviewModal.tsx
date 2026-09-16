import { useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
} from "lucide-react";
import {
  adminApi,
  type GalleryImageItem,
  type GalleryVideoItem,
} from "@/admin/api/adminApi";
import Button from "@/admin/components/ui/Button";
import type { GalleryAssetTab } from "../types";
import {
  imagePreviewName,
  videoPreviewName,
  youtubeEmbedUrl,
} from "../utils/galleryAssets";

type GalleryAssetPreviewModalProps = {
  asset: GalleryImageItem | GalleryVideoItem | null;
  assetType: GalleryAssetTab | null;
  currentIndex: number;
  isSaving: boolean;
  totalAssets: number;
  onClose: () => void;
  onDelete: () => void;
  onNext: () => void;
  onPrevious: () => void;
};

function renderPreview(
  asset: GalleryImageItem | GalleryVideoItem,
  type: GalleryAssetTab,
) {
  if (type === "images") {
    const image = asset as GalleryImageItem;

    return (
      <img
        className="max-h-[calc(100vh-120px)] max-w-full object-contain"
        src={adminApi.galleryImageUrl(image)}
        alt={imagePreviewName(image)}
      />
    );
  }

  const video = asset as GalleryVideoItem;

  if (video.sourceType === "UPLOAD") {
    return (
      <video
        className="max-h-[calc(100vh-120px)] max-w-full object-contain"
        src={adminApi.galleryVideoUrl(video)}
        controls
      />
    );
  }

  const embedUrl = youtubeEmbedUrl(video.source);

  if (embedUrl) {
    return (
      <iframe
        className="aspect-video w-[min(90vw,1100px)]"
        src={embedUrl}
        title={videoPreviewName(video)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <a
      className="grid aspect-video w-[min(90vw,1100px)] place-items-center rounded-lg bg-white/10 text-sm font-semibold text-white"
      href={video.source}
      target="_blank"
      rel="noreferrer"
    >
      Open YouTube Video
    </a>
  );
}

function assetName(
  asset: GalleryImageItem | GalleryVideoItem,
  type: GalleryAssetTab,
) {
  return type === "images"
    ? imagePreviewName(asset as GalleryImageItem)
    : videoPreviewName(asset as GalleryVideoItem);
}

export default function GalleryAssetPreviewModal({
  asset,
  assetType,
  currentIndex,
  isSaving,
  totalAssets,
  onClose,
  onDelete,
  onNext,
  onPrevious,
}: GalleryAssetPreviewModalProps) {
  const isOpen = Boolean(asset && assetType);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowLeft" && currentIndex > 0) {
        onPrevious();
      }

      if (
        event.key === "ArrowRight" &&
        currentIndex < totalAssets - 1
      ) {
        onNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [
    isOpen,
    currentIndex,
    totalAssets,
    onClose,
    onNext,
    onPrevious,
  ]);

  if (!isOpen || !asset || !assetType) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-black/85 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={
        assetType === "images" ? "Image Preview" : "Video Preview"
      }
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Close */}
      <button
        type="button"
        aria-label="Close preview"
        onClick={onClose}
        className="absolute right-5 top-5 z-30 grid h-10 w-10 place-items-center rounded-full bg-black/50 text-white transition hover:bg-white/20"
      >
        <X size={20} />
      </button>

      {/* Previous */}
      <button
        type="button"
        aria-label="Previous asset"
        disabled={currentIndex <= 0}
        onClick={onPrevious}
        className="absolute left-4 top-1/2 z-30 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Next */}
      <button
        type="button"
        aria-label="Next asset"
        disabled={currentIndex >= totalAssets - 1}
        onClick={onNext}
        className="absolute right-4 top-1/2 z-30 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronRight size={24} />
      </button>

      {/* Media */}
      <div className="relative flex max-h-screen max-w-full items-center justify-center">
        {renderPreview(asset, assetType)}
      </div>

      {/* Metadata Overlay */}
      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="mx-auto flex max-w-5xl items-end justify-between gap-4 bg-black/55 px-5 py-4 backdrop-blur-md">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-white">
              {assetName(asset, assetType)}
            </h3>

            <p className="mt-1 text-xs text-white/60">
              Uploaded:{" "}
              {new Date(asset.createdAt).toLocaleDateString()}
            </p>
          </div>

          <Button
            className="inline-flex shrink-0 items-center gap-1.5 border-white/20 px-3 text-xs"
            disabled={isSaving}
            size="sm"
            type="button"
            variant="danger"
            onClick={onDelete}
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
}