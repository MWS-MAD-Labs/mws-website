import { Link } from "react-router-dom";
import Button from "@/admin/components/ui/Button";
import type { GalleryItem } from "@/admin/api/adminApi";
import GalleryThumb from "../GalleryThumb";

type GalleryListProps = {
  galleries: GalleryItem[];
  isLoading: boolean;
  isSaving: boolean;
  message: string | null;
  onDelete: (id: string) => void;
};

export default function GalleryList({
  galleries,
  isLoading,
  isSaving,
  message,
  onDelete,
}: GalleryListProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500">
        Loading galleries...
      </div>
    );
  }

  if (!galleries.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500">
        No galleries yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      {message ? (
        <div className="border-b border-gray-200 bg-[#faf8f3] px-4 py-3 text-sm text-[#7b3f2a]">
          {message}
        </div>
      ) : null}

      {/* Table Header */}
      <div className="hidden grid-cols-[minmax(0,1fr)_140px_140px_140px] items-center gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-500 md:grid">
        <span>Gallery</span>
        <span>Created At</span>
        <span>Updated At</span>
        <span className="text-right">Actions</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {galleries.map((gallery) => (
          <div
            key={gallery.id}
            className="grid items-center gap-4 px-4 py-3 md:grid-cols-[minmax(0,1fr)_140px_140px_140px]"
          >
            {/* Gallery */}
            <div className="flex min-w-0 items-center gap-3">
              <GalleryThumb gallery={gallery} />

              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-gray-900">
                  {gallery.title}
                </h2>

                <p className="truncate text-sm text-gray-500">
                  {gallery.description || "-"}
                </p>

                <p className="text-xs text-gray-400">
                  {gallery.images.length} Images /{" "}
                  {gallery.videos.length} Videos
                </p>
              </div>
            </div>

            {/* Created */}
            <div className="text-sm text-gray-500">
              {new Date(gallery.createdAt).toLocaleDateString()}
            </div>

            {/* Updated */}
            <div className="text-sm text-gray-500">
              {new Date(gallery.updatedAt).toLocaleDateString()}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                disabled={isSaving}
                size="sm"
                type="button"
                variant="danger"
                onClick={() => onDelete(gallery.id)}
              >
                Delete
              </Button>

              <Link to={`/admin/gallery/${gallery.id}`}>
                <Button size="sm" type="button" variant="outline">
                  Open
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
