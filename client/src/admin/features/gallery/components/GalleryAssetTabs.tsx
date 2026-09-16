import type { GalleryAssetTab } from "../types";

type GalleryAssetTabsProps = {
  activeTab: GalleryAssetTab;
  imageCount: number;
  onChange: (tab: GalleryAssetTab) => void;
  videoCount: number;
};

export default function GalleryAssetTabs({
  activeTab,
  imageCount,
  onChange,
  videoCount,
}: GalleryAssetTabsProps) {
  return (
    <div className="border-b border-gray-200 px-5 py-4">
      <div className="flex w-fit rounded-lg border border-gray-200 bg-gray-50 p-1">
        <button
          className={`rounded-md px-4 py-2 text-sm font-semibold ${
            activeTab === "images"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
          type="button"
          onClick={() => onChange("images")}
        >
          Images ({imageCount})
        </button>
        <button
          className={`rounded-md px-4 py-2 text-sm font-semibold ${
            activeTab === "videos"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
          type="button"
          onClick={() => onChange("videos")}
        >
          Videos ({videoCount})
        </button>
      </div>
    </div>
  );
}
