import { adminApi, type GalleryVideoItem } from "@/admin/api/adminApi";

type VidioListProps = {
  onOpenPreview: (index: number) => void;
  onToggleSelection: (videoId: string) => void;
  selectedIds: string[];
  videos: GalleryVideoItem[];
};

export default function VidioList({
  onOpenPreview,
  onToggleSelection,
  selectedIds,
  videos,
}: VidioListProps) {
  if (!videos.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-6 text-sm text-gray-500">
        No videos in this gallery yet.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6">
      {videos.map((video, index) => {
        const isSelected = selectedIds.includes(video.id);

        return (
          <div
            className={`group relative overflow-hidden rounded-lg border bg-white ${
              isSelected ? "border-[#7e1518] ring-2 ring-[#7e1518]/20" : "border-gray-200"
            }`}
            key={video.id}
          >
            <button
              className="grid aspect-[4/3] w-full place-items-center bg-[#241718]"
              type="button"
              onClick={() => onOpenPreview(index)}
              aria-label={`Preview ${video.title ?? "gallery video"}`}
            >
              {video.sourceType === "UPLOAD" ? (
                <video
                  className="h-full w-full object-cover"
                  src={adminApi.galleryVideoUrl(video)}
                  muted
                />
              ) : (
                <span className="px-4 text-center text-sm font-semibold text-white">
                  YouTube Video
                </span>
              )}
            </button>
            <label className="absolute left-2 top-2 grid h-6 w-6 cursor-pointer place-items-center rounded border border-white/80 bg-white/90 shadow-sm">
              <input
                className="h-4 w-4 accent-[#7e1518]"
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelection(video.id)}
                aria-label={`Select ${video.title ?? "gallery video"}`}
              />
            </label>
          </div>
        );
      })}
    </div>
  );
}
