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
    <div className="border-b border-[#E2E8F0] px-5 py-4">
      <div className="flex w-fit rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] p-1">
        <button
          className={`rounded-md px-4 py-2 text-sm font-semibold ${
            activeTab === "images"
              ? "bg-white text-[#1C2434] shadow-sm"
              : "text-[#64748B] hover:text-[#1C2434]"
          }`}
          type="button"
          onClick={() => onChange("images")}
        >
          Images ({imageCount})
        </button>
        <button
          className={`rounded-md px-4 py-2 text-sm font-semibold ${
            activeTab === "videos"
              ? "bg-white text-[#1C2434] shadow-sm"
              : "text-[#64748B] hover:text-[#1C2434]"
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
