import SearchInput from "@/admin/components/ui/SearchInput";
import Select from "@/admin/components/ui/Select";
import type { GalleryAssetSort } from "../types";

type GalleryAssetToolbarProps = {
  searchQuery: string;
  sortBy: GalleryAssetSort;
  onSearchChange: (value: string) => void;
  onSortChange: (value: GalleryAssetSort) => void;
};

export default function GalleryAssetToolbar({
  searchQuery,
  sortBy,
  onSearchChange,
  onSortChange,
}: GalleryAssetToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-5 py-4">
      <SearchInput
        className="max-w-sm"
        placeholder="Search your assets"
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      <Select
        value={sortBy}
        onChange={(event) => onSortChange(event.target.value as GalleryAssetSort)}
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="az">A-Z</option>
        <option value="za">Z-A</option>
      </Select>
    </div>
  );
}
