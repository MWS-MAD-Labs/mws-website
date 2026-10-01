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
          <div className="rounded-lg border border-[#E2E8F0] p-4 text-sm text-[#64748B]">
            Loading galleries...
          </div>
        ) : null}

        {!isLoading && !filteredGalleries.length ? (
          <div className="rounded-lg border border-[#E2E8F0] p-4 text-sm text-[#64748B]">
            No galleries found.
          </div>
        ) : null}

        <div className="max-h-[48vh] overflow-y-auto rounded-lg border border-[#E2E8F0]">
          {filteredGalleries.map((gallery) => {
            const isSelected = gallery.id === selectedGalleryId;

            return (
              <button
                className={`grid w-full grid-cols-[80px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#E2E8F0] px-3 py-3 text-left last:border-b-0 ${
                  isSelected ? "bg-[#F1F5F9]" : "bg-white hover:bg-[#F1F5F9]"
                }`}
                key={gallery.id}
                type="button"
                onClick={() => selectGallery(gallery.id)}
              >
                <GalleryThumb gallery={gallery} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-[#1C2434]">
                    {gallery.title}
                  </span>
                  <span className="block truncate text-sm text-[#64748B]">
                    {gallery.description || "-"}
                  </span>
                  <span className="block text-xs text-[#64748B]">
                    {gallery.images.length} Images / {gallery.videos.length} Videos
                  </span>
                </span>
                <span className="text-xs font-semibold text-[#3C50E0]">
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
