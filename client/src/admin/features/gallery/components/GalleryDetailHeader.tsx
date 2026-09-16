import { Link } from "react-router-dom";
import { Upload } from "lucide-react";
import type { GalleryItem } from "@/admin/api/adminApi";
import Button from "@/admin/components/ui/Button";
import type { GalleryAssetTab } from "../types";

type GalleryDetailHeaderProps = {
  gallery: GalleryItem | null;
  onOpenUpload: (type: GalleryAssetTab) => void;
};

export default function GalleryDetailHeader({
  gallery,
  onOpenUpload,
}: GalleryDetailHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
      <div className="min-w-0">
        <div className="mb-2">
          <Link to="/admin/gallery">
            <Button size="sm" type="button" variant="outline">
              Back
            </Button>
          </Link>
        </div>
        <h1 className="truncate text-lg font-semibold text-gray-900">
          {gallery?.title ?? "Gallery Detail"}
        </h1>
        <p className="mt-1 max-w-2xl truncate text-sm text-gray-500">
          {gallery?.description || "Manage gallery images and videos."}
        </p>
      </div>

      {gallery ? (
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          <Button
            className="inline-flex items-center gap-1.5 px-3 text-xs"
            size="sm"
            type="button"
            onClick={() => onOpenUpload("images")}
          >
            <Upload size={14} />
            <span>Upload Image</span>
          </Button>
          <Button
            className="inline-flex items-center gap-1.5 px-3 text-xs"
            size="sm"
            type="button"
            variant="outline"
            onClick={() => onOpenUpload("videos")}
          >
            <Upload size={14} />
            <span>Upload Video</span>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
