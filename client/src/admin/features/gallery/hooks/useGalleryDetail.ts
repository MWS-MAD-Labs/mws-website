import { useEffect, useMemo, useState } from "react";
import { adminApi, type GalleryItem } from "@/admin/api/adminApi";
import {
  type GalleryAssetSort,
  type GalleryAssetTab,
  type GalleryConfirmDeleteState,
  type GalleryPreviewState,
} from "../types";
import { filterAndSortAssets } from "../utils/galleryAssets";

type UploadAssetData = {
  caption: string;
  file: File;
  sortOrder: string;
  title: string;
};

type CreateYoutubeVideoData = {
  caption: string | null;
  sortOrder: number;
  title: string | null;
  url: string;
};

export function useGalleryDetail(galleryId: string | undefined) {
  const [gallery, setGallery] = useState<GalleryItem | null>(null);
  const [activeTab, setActiveTab] = useState<GalleryAssetTab>("images");
  const [openUpload, setOpenUpload] = useState<GalleryAssetTab | null>(null);
  const [preview, setPreview] = useState<GalleryPreviewState | null>(null);
  const [confirmDelete, setConfirmDelete] =
    useState<GalleryConfirmDeleteState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<GalleryAssetSort>("newest");
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const visibleImages = useMemo(
    () =>
      filterAndSortAssets(
        gallery?.images ?? [],
        searchQuery,
        sortBy,
        (image) => image.path,
      ),
    [gallery?.images, searchQuery, sortBy],
  );

  const visibleVideos = useMemo(
    () =>
      filterAndSortAssets(
        gallery?.videos ?? [],
        searchQuery,
        sortBy,
        (video) => `${video.sourceType} ${video.source}`,
      ),
    [gallery?.videos, searchQuery, sortBy],
  );

  const activeAssets = activeTab === "images" ? visibleImages : visibleVideos;
  const selectedIds =
    activeTab === "images" ? selectedImageIds : selectedVideoIds;
  const previewAssets =
    preview?.type === "images" ? visibleImages : visibleVideos;
  const previewIndex = preview
    ? previewAssets.findIndex((asset) => asset.id === preview.id)
    : -1;
  const previewAsset = previewIndex >= 0 ? previewAssets[previewIndex] : null;

  async function loadGallery() {
    if (!galleryId) return;
    setGallery(await adminApi.gallery(galleryId));
  }

  useEffect(() => {
    queueMicrotask(() => {
      loadGallery()
        .catch((error) =>
          setMessage(
            error instanceof Error ? error.message : "Failed to load gallery.",
          ),
        )
        .finally(() => setIsLoading(false));
    });
  }, [galleryId]);

  useEffect(() => {
    if (!preview) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPreview(null);
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPreviewAsset("previous");
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToPreviewAsset("next");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [preview, previewAssets, previewIndex]);

  async function runMutation(
    action: () => Promise<void>,
    successMessage: string,
    fallbackMessage: string,
  ) {
    setMessage(null);
    setIsSaving(true);

    try {
      await action();
      await loadGallery();
      setMessage(successMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : fallbackMessage);
    } finally {
      setIsSaving(false);
    }
  }

  async function uploadImage(data: UploadAssetData) {
    if (!galleryId) return;

    await runMutation(
      async () => {
        await adminApi.uploadGalleryImage(galleryId, data);
        setOpenUpload(null);
      },
      "Image uploaded.",
      "Failed to upload image.",
    );
  }

  async function uploadVideo(data: UploadAssetData) {
    if (!galleryId) return;

    await runMutation(
      async () => {
        await adminApi.uploadGalleryVideo(galleryId, data);
        setOpenUpload(null);
      },
      "Video uploaded.",
      "Failed to upload video.",
    );
  }

  async function createYoutubeVideo(data: CreateYoutubeVideoData) {
    if (!galleryId) return;

    await runMutation(
      async () => {
        await adminApi.createYoutubeGalleryVideo(galleryId, data);
        setOpenUpload(null);
      },
      "YouTube video added.",
      "Failed to add YouTube video.",
    );
  }

  function toggleImageSelection(imageId: string) {
    setSelectedImageIds((current) =>
      current.includes(imageId)
        ? current.filter((id) => id !== imageId)
        : [...current, imageId],
    );
  }

  function toggleVideoSelection(videoId: string) {
    setSelectedVideoIds((current) =>
      current.includes(videoId)
        ? current.filter((id) => id !== videoId)
        : [...current, videoId],
    );
  }

  function clearSelection(type: GalleryAssetTab) {
    if (type === "images") {
      setSelectedImageIds([]);
      return;
    }

    setSelectedVideoIds([]);
  }

  async function deleteAsset(type: GalleryAssetTab, assetId: string) {
    if (type === "images") {
      await adminApi.deleteGalleryImage(assetId);
      return;
    }

    await adminApi.deleteGalleryVideo(assetId);
  }

  function goToPreviewAsset(direction: "next" | "previous") {
    if (!preview || previewIndex < 0) return;

    const nextIndex =
      direction === "next" ? previewIndex + 1 : previewIndex - 1;
    const nextAsset = previewAssets[nextIndex];

    if (nextAsset) {
      setPreview({ id: nextAsset.id, type: preview.type });
    }
  }

  async function deleteSelectedAssets() {
    if (!selectedIds.length) return;

    const type = activeTab;
    setIsSaving(true);
    setMessage(null);

    try {
      await Promise.all(selectedIds.map((assetId) => deleteAsset(type, assetId)));
      clearSelection(type);
      setConfirmDelete(null);
      await loadGallery();
      setMessage(
        `${selectedIds.length} asset${selectedIds.length === 1 ? "" : "s"} deleted.`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to delete assets.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function deletePreviewAsset() {
    if (!preview || !previewAsset) return;

    const nextAsset =
      previewAssets[previewIndex + 1] ?? previewAssets[previewIndex - 1];
    const deletedId = previewAsset.id;

    setIsSaving(true);
    setMessage(null);

    try {
      await deleteAsset(preview.type, deletedId);
      if (preview.type === "images") {
        setSelectedImageIds((current) =>
          current.filter((id) => id !== deletedId),
        );
      } else {
        setSelectedVideoIds((current) =>
          current.filter((id) => id !== deletedId),
        );
      }
      setConfirmDelete(null);
      await loadGallery();
      setMessage("Asset deleted.");

      if (nextAsset) {
        setPreview({ id: nextAsset.id, type: preview.type });
      } else {
        setPreview(null);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to delete asset.");
    } finally {
      setIsSaving(false);
    }
  }

  function openPreview(index: number) {
    const asset = activeAssets[index];
    if (!asset) return;

    setPreview({ id: asset.id, type: activeTab });
  }

  return {
    activeTab,
    confirmDelete,
    createYoutubeVideo,
    deletePreviewAsset,
    deleteSelectedAssets,
    gallery,
    goToPreviewAsset,
    isLoading,
    isSaving,
    message,
    openPreview,
    openUpload,
    preview,
    previewAsset,
    previewAssets,
    previewIndex,
    searchQuery,
    selectedIds,
    selectedImageIds,
    selectedVideoIds,
    setActiveTab,
    setConfirmDelete,
    setOpenUpload,
    setPreview,
    setSearchQuery,
    setSortBy,
    sortBy,
    toggleImageSelection,
    toggleVideoSelection,
    uploadImage,
    uploadVideo,
    visibleImages,
    visibleVideos,
  };
}
