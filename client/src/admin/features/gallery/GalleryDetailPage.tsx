import { Link, useParams } from "react-router-dom";
import AppShell from "@/admin/components/layout/AppShell";
import Modal from "@/admin/components/ui/Modal";
import StatusMessage from "@/admin/components/ui/StatusMessage";
import GalleryAssetPreviewModal from "./components/GalleryAssetPreviewModal";
import GalleryAssetTabs from "./components/GalleryAssetTabs";
import GalleryAssetToolbar from "./components/GalleryAssetToolbar";
import GalleryDeleteConfirmModal from "./components/GalleryDeleteConfirmModal";
import GalleryDetailHeader from "./components/GalleryDetailHeader";
import GallerySelectionBar from "./components/GallerySelectionBar";
import ImageList from "./components/layouts/ImageList";
import UploadImages from "./components/layouts/UploadImages";
import UploadVidio from "./components/layouts/UploadVidio";
import VidioList from "./components/layouts/VidioList";
import { useGalleryDetail } from "./hooks/useGalleryDetail";

export default function GalleryDetailPage() {
  const { galleryId } = useParams();
  const {
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
  } = useGalleryDetail(galleryId);

  return (
    <AppShell title={gallery?.title ?? "Gallery Detail"}>
      <section className="space-y-5 p-6">
        <p className="text-sm text-gray-500">
          <Link className="hover:text-gray-900" to="/admin/gallery">
            All Galleries
          </Link>{" "}
          / {gallery?.title ?? "Gallery Detail"}
        </p>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <GalleryDetailHeader
            gallery={gallery}
            onOpenUpload={setOpenUpload}
          />

          {message ? (
            <div className="border-b border-gray-200 bg-[#faf8f3] px-5 py-3">
              <StatusMessage>{message}</StatusMessage>
            </div>
          ) : null}

          {isLoading ? (
            <div className="p-5 text-sm text-gray-500">Loading gallery...</div>
          ) : null}

          {!isLoading && !gallery ? (
            <div className="p-5 text-sm text-gray-500">Gallery not found.</div>
          ) : null}

          {gallery ? (
            <>
              <GalleryAssetTabs
                activeTab={activeTab}
                imageCount={gallery.images.length}
                videoCount={gallery.videos.length}
                onChange={setActiveTab}
              />

              <GalleryAssetToolbar
                searchQuery={searchQuery}
                sortBy={sortBy}
                onSearchChange={setSearchQuery}
                onSortChange={setSortBy}
              />

              <GallerySelectionBar
                disabled={isSaving}
                selectedCount={selectedIds.length}
                onDelete={() => setConfirmDelete({ mode: "bulk" })}
              />

              <div className="p-4">
                {activeTab === "images" ? (
                  <ImageList
                    images={visibleImages}
                    selectedIds={selectedImageIds}
                    onOpenPreview={openPreview}
                    onToggleSelection={toggleImageSelection}
                  />
                ) : (
                  <VidioList
                    selectedIds={selectedVideoIds}
                    videos={visibleVideos}
                    onOpenPreview={openPreview}
                    onToggleSelection={toggleVideoSelection}
                  />
                )}
              </div>
            </>
          ) : null}
        </div>
      </section>

      <Modal
        open={openUpload === "images"}
        title="Upload Image"
        onClose={() => setOpenUpload(null)}
      >
        <UploadImages
          isSaving={isSaving}
          onCancel={() => setOpenUpload(null)}
          onUploadImage={uploadImage}
        />
      </Modal>

      <Modal
        open={openUpload === "videos"}
        title="Upload Video"
        onClose={() => setOpenUpload(null)}
      >
        <UploadVidio
          isSaving={isSaving}
          onCancel={() => setOpenUpload(null)}
          onCreateYoutube={createYoutubeVideo}
          onUploadVideo={uploadVideo}
        />
      </Modal>

      <GalleryAssetPreviewModal
        asset={previewAsset}
        assetType={preview?.type ?? null}
        currentIndex={previewIndex}
        isSaving={isSaving}
        totalAssets={previewAssets.length}
        onClose={() => setPreview(null)}
        onDelete={() => setConfirmDelete({ mode: "preview" })}
        onNext={() => goToPreviewAsset("next")}
        onPrevious={() => goToPreviewAsset("previous")}
      />

      <GalleryDeleteConfirmModal
        confirmDelete={confirmDelete}
        isSaving={isSaving}
        selectedCount={selectedIds.length}
        onClose={() => setConfirmDelete(null)}
        onDeleteBulk={deleteSelectedAssets}
        onDeletePreview={deletePreviewAsset}
      />
    </AppShell>
  );
}
