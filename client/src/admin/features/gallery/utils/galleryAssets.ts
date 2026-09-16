import type {
  GalleryImageItem,
  GalleryVideoItem,
} from "@/admin/api/adminApi";
import type {
  GalleryAssetSort,
  SearchableGalleryAsset,
} from "../types";

function assetTitle(asset: SearchableGalleryAsset, fallback: string) {
  return asset.title?.trim() || fallback;
}

export function fileNameFromPath(path: string) {
  return decodeURIComponent(path.split("/").filter(Boolean).at(-1) ?? path);
}

export function filterAndSortAssets<T extends SearchableGalleryAsset>(
  assets: T[],
  query: string,
  sortBy: GalleryAssetSort,
  sourceText?: (asset: T) => string,
) {
  const normalizedQuery = query.trim().toLowerCase();

  return assets
    .filter((asset) => {
      if (!normalizedQuery) return true;

      return [
        asset.title ?? "",
        asset.caption ?? "",
        sourceText ? sourceText(asset) : "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    })
    .sort((first, second) => {
      if (sortBy === "az") {
        return assetTitle(first, "").localeCompare(assetTitle(second, ""));
      }

      if (sortBy === "za") {
        return assetTitle(second, "").localeCompare(assetTitle(first, ""));
      }

      if (sortBy === "oldest") {
        return (
          new Date(first.createdAt).getTime() -
          new Date(second.createdAt).getTime()
        );
      }

      return (
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime()
      );
    });
}

export function imagePreviewName(image: GalleryImageItem) {
  return image.title || fileNameFromPath(image.path) || "Untitled image";
}

export function videoPreviewName(video: GalleryVideoItem) {
  return video.title || fileNameFromPath(video.source) || "Untitled video";
}

export function youtubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");

    if (host === "youtu.be") {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }

    if (host.endsWith("youtube.com")) {
      const watchId = parsed.searchParams.get("v");
      if (watchId) return `https://www.youtube.com/embed/${watchId}`;

      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts[0] === "shorts" || parts[0] === "embed") {
        return `https://www.youtube.com/embed/${parts[1]}`;
      }
    }
  } catch {
    return null;
  }

  return null;
}
