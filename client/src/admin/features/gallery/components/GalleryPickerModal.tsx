import { useMemo, useState } from "react";
import type { GalleryItem } from "@/admin/api/adminApi";
import Button from "@/admin/components/ui/Button";
import Modal from "@/admin/components/ui/Modal";
import SearchInput from "@/admin/components/ui/SearchInput";
import GalleryThumb from "./GalleryThumb";

type GalleryPickerModalProps = {
  galleries: GalleryItem[];
  isLoading?: boolean;
  open: boolean;
  selectedGalleryId: string | null;
  onClose: () => void;
  onSelect: (galleryId: string | null) => void;
};

export default function GalleryPickerModal({
  galleries,
  isLoading = false,
  open,
  selectedGalleryId,
  onClose,
  onSelect,
}: GalleryPickerModalProps) {
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

  function selectGallery(galleryId: string | null) {
    onSelect(galleryId);
    onClose();
  }

  return (
    <Modal open={open} title="Choose Gallery" onClose={onClose}>
      <div className="grid gap-4">
        <SearchInput
          placeholder="Search gallery"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />

        {isLoading ? (
          <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-500">
            Loading galleries...
          </div>
        ) : null}

        {!isLoading && !filteredGalleries.length ? (
          <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-500">
            No galleries found.
          </div>
        ) : null}

        <div className="max-h-[48vh] overflow-y-auto rounded-lg border border-gray-200">
          {filteredGalleries.map((gallery) => {
            const isSelected = gallery.id === selectedGalleryId;

            return (
              <button
                className={`grid w-full grid-cols-[80px_minmax(0,1fr)_auto] items-center gap-3 border-b border-gray-200 px-3 py-3 text-left last:border-b-0 ${
                  isSelected ? "bg-[#faf8f3]" : "bg-white hover:bg-gray-50"
                }`}
                key={gallery.id}
                type="button"
                onClick={() => selectGallery(gallery.id)}
              >
                <GalleryThumb gallery={gallery} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-gray-900">
                    {gallery.title}
                  </span>
                  <span className="block truncate text-sm text-gray-500">
                    {gallery.description || "-"}
                  </span>
                  <span className="block text-xs text-gray-400">
                    {gallery.images.length} Images / {gallery.videos.length} Videos
                  </span>
                </span>
                <span className="text-xs font-semibold text-[#7e1518]">
                  {isSelected ? "Selected" : "Select"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-between gap-2">
          <Button type="button" variant="ghost" onClick={() => selectGallery(null)}>
            Clear Gallery
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
