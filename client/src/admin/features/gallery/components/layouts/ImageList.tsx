import { adminApi, type GalleryImageItem } from "@/admin/api/adminApi";

type ImageListProps = {
  images: GalleryImageItem[];
  selectedIds: string[];
  onOpenPreview: (index: number) => void;
  onToggleSelection: (imageId: string) => void;
};

export default function ImageList({
  images,
  selectedIds,
  onOpenPreview,
  onToggleSelection,
}: ImageListProps) {
  if (!images.length) {
    return (
      <div className="rounded-lg border border-dashed border-[#E2E8F0] p-6 text-sm text-[#64748B]">
        No images in this gallery yet.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6">
      {images.map((image, index) => {
        const isSelected = selectedIds.includes(image.id);

        return (
          <div
            className={`group relative overflow-hidden rounded-lg border bg-white ${
              isSelected ? "border-[#3C50E0] ring-2 ring-[#3C50E0]/20" : "border-[#E2E8F0]"
            }`}
            key={image.id}
          >
            <button
              className="block aspect-[4/3] w-full bg-[#F1F5F9]"
              type="button"
              onClick={() => onOpenPreview(index)}
              aria-label={`Preview ${image.title ?? "gallery image"}`}
            >
              <img
                className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                src={adminApi.galleryImageUrl(image)}
                alt={image.title ?? "Gallery image"}
              />
            </button>
            <label className="absolute left-2 top-2 grid h-6 w-6 cursor-pointer place-items-center rounded border border-white/80 bg-white/90 shadow-sm">
              <input
                className="h-4 w-4 accent-[#3C50E0]"
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelection(image.id)}
                aria-label={`Select ${image.title ?? "gallery image"}`}
              />
            </label>
          </div>
        );
      })}
    </div>
  );
}
