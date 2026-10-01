import { Trash2 } from "lucide-react";
import Button from "@/admin/components/ui/Button";

type GallerySelectionBarProps = {
  disabled: boolean;
  selectedCount: number;
  onDelete: () => void;
};

export default function GallerySelectionBar({
  disabled,
  selectedCount,
  onDelete,
}: GallerySelectionBarProps) {
  if (!selectedCount) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] bg-[#F1F5F9] px-5 py-3">
      <p className="text-sm font-medium text-[#1C2434]">
        {selectedCount} selected
      </p>
      <Button
        className="inline-flex items-center gap-1.5 px-3 text-xs"
        disabled={disabled}
        size="sm"
        type="button"
        variant="danger"
        onClick={onDelete}
      >
        <Trash2 size={14} />
        <span>Delete</span>
      </Button>
    </div>
  );
}
