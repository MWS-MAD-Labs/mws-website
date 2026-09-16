export type GalleryAssetTab = "images" | "videos";

export type GalleryAssetSort = "az" | "newest" | "oldest" | "za";

export type GalleryPreviewState = {
  id: string;
  type: GalleryAssetTab;
};

export type GalleryConfirmDeleteState = {
  mode: "bulk" | "preview";
};

export type SearchableGalleryAsset = {
  caption: string | null;
  createdAt: string;
  id: string;
  title: string | null;
};
