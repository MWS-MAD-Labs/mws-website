import { useMemo, useState } from "react";
import {
  adminApi,
  type GalleryImageItem,
  type GalleryItem,
  type GalleryVideoItem,
} from "@/admin/api/adminApi";
import Button from "@/admin/components/ui/Button";
import Modal from "@/admin/components/ui/Modal";
import SearchInput from "@/admin/components/ui/SearchInput";

export type GalleryAssetKind = "IMAGE" | "VIDEO";

export type GalleryAssetSelection = {
  alt: string;
  galleryId: string;
  kind: GalleryAssetKind;
  label: string;
  path: string;
};

type GalleryAssetPickerModalProps = {
  allowedKinds?: GalleryAssetKind[];
  galleries: GalleryItem[];
  initialGalleryId?: string | null;
  open: boolean;
  title?: string;
  onClose: () => void;
  onSelect: (asset: GalleryAssetSelection) => void;
};

function imageSelection(
  gallery: GalleryItem,
  image: GalleryImageItem,
): GalleryAssetSelection {
  return {
    alt: image.title || image.caption || gallery.title,
    galleryId: gallery.id,
    kind: "IMAGE",
    label: image.title || image.caption || "Gallery image",
    path: adminApi.galleryImagePublicPath(image),
  };
}

function videoSelection(
  gallery: GalleryItem,
  video: GalleryVideoItem,
): GalleryAssetSelection {
  return {
    alt: video.title || video.caption || gallery.title,
    galleryId: gallery.id,
    kind: "VIDEO",
    label: video.title || video.caption || "Gallery video",
    path: adminApi.galleryVideoPublicPath(video),
  };
}

export default function GalleryAssetPickerModal({
  allowedKinds = ["IMAGE", "VIDEO"],
  galleries,
  initialGalleryId = null,
  open,
  title = "Choose Gallery Asset",
  onClose,
  onSelect,
}: GalleryAssetPickerModalProps) {
  const [activeGalleryId, setActiveGalleryId] = useState<string | null>(
    initialGalleryId ?? galleries[0]?.id ?? null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGalleries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return galleries;

    return galleries.filter((gallery) =>
      [gallery.title, gallery.description ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [galleries, searchQuery]);

  const activeGallery =
    galleries.find((gallery) => gallery.id === activeGalleryId) ??
    galleries.find((gallery) => gallery.id === initialGalleryId) ??
    filteredGalleries[0] ??
    null;

  const assets = activeGallery
    ? [
        ...(allowedKinds.includes("IMAGE")
          ? activeGallery.images.map((image) => ({
              id: image.id,
              preview: adminApi.galleryImageUrl(image),
              selection: imageSelection(activeGallery, image),
            }))
          : []),
        ...(allowedKinds.includes("VIDEO")
          ? activeGallery.videos.map((video) => ({
              id: video.id,
              preview: adminApi.galleryVideoUrl(video),
              selection: videoSelection(activeGallery, video),
            }))
          : []),
      ]
    : [];

  function chooseAsset(asset: GalleryAssetSelection) {
    onSelect(asset);
    onClose();
  }

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="grid gap-3">
          <SearchInput
            placeholder="Search gallery"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <div className="max-h-[52vh] overflow-y-auto rounded-lg border border-gray-200">
            {filteredGalleries.map((gallery) => {
              const isActive = gallery.id === activeGallery?.id;

              return (
                <button
                  className={`block w-full border-b border-gray-200 px-3 py-3 text-left text-sm last:border-b-0 ${
                    isActive ? "bg-[#faf8f3] text-[#7e1518]" : "bg-white text-gray-700"
                  }`}
                  key={gallery.id}
                  type="button"
                  onClick={() => setActiveGalleryId(gallery.id)}
                >
                  <span className="block truncate font-semibold">{gallery.title}</span>
                  <span className="block text-xs text-gray-500">
                    {gallery.images.length} Images / {gallery.videos.length} Videos
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0">
          {!activeGallery ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-6 text-sm text-gray-500">
              No gallery available.
            </div>
          ) : null}

          {activeGallery && !assets.length ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-6 text-sm text-gray-500">
              No matching assets in this gallery.
            </div>
          ) : null}

          {assets.length ? (
            <div className="grid max-h-[52vh] gap-3 overflow-y-auto sm:grid-cols-2 xl:grid-cols-3">
              {assets.map((asset) => (
                <button
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white text-left hover:border-[#7e1518]"
                  key={`${asset.selection.kind}-${asset.id}`}
                  type="button"
                  onClick={() => chooseAsset(asset.selection)}
                >
                  <div className="grid aspect-video place-items-center bg-gray-100">
                    {asset.selection.kind === "IMAGE" ? (
                      <img
                        className="h-full w-full object-cover"
                        src={asset.preview}
                        alt={asset.selection.alt}
                      />
                    ) : asset.preview ? (
                      <video
                        className="h-full w-full object-cover"
                        src={asset.preview}
                        muted
                      />
                    ) : (
                      <span className="px-3 text-center text-sm font-semibold text-gray-500">
                        YouTube Video
                      </span>
                    )}
                  </div>
                  <span className="block truncate px-3 py-2 text-sm font-semibold text-gray-900">
                    {asset.selection.label}
                  </span>
                  <span className="block px-3 pb-3 text-xs text-gray-500">
                    {asset.selection.kind}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex justify-end lg:col-span-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
