import { adminApi, type GalleryItem } from "@/admin/api/adminApi";

type GalleryThumbProps = {
  gallery: GalleryItem;
};

export default function GalleryThumb({ gallery }: GalleryThumbProps) {
  const firstImage = gallery.images[0];

  if (!firstImage) {
    return (
      <div className="grid h-14 w-20 shrink-0 place-items-center rounded-md bg-[#F1F5F9] text-xs text-[#64748B]">
        No Image
      </div>
    );
  }

  return (
    <img
      src={adminApi.galleryImageUrl(firstImage)}
      alt={firstImage.title ?? gallery.title}
      className="h-14 w-20 shrink-0 rounded-md object-cover"
    />
  );
}