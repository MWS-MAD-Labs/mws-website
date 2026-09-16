import Button from "@/admin/components/ui/Button";
import Modal from "@/admin/components/ui/Modal";
import type { GalleryConfirmDeleteState } from "../types";

type GalleryDeleteConfirmModalProps = {
  confirmDelete: GalleryConfirmDeleteState | null;
  isSaving: boolean;
  selectedCount: number;
  onClose: () => void;
  onDeleteBulk: () => void;
  onDeletePreview: () => void;
};

export default function GalleryDeleteConfirmModal({
  confirmDelete,
  isSaving,
  selectedCount,
  onClose,
  onDeleteBulk,
  onDeletePreview,
}: GalleryDeleteConfirmModalProps) {
  return (
    <Modal
      open={Boolean(confirmDelete)}
      title={
        confirmDelete?.mode === "bulk"
          ? "Delete selected assets?"
          : "Delete asset?"
      }
      onClose={onClose}
    >
      <div className="grid gap-4">
        <p className="text-sm text-gray-500">
          {confirmDelete?.mode === "bulk"
            ? `Are you sure you want to delete ${selectedCount} selected asset${
                selectedCount === 1 ? "" : "s"
              }?`
            : "Are you sure you want to delete this asset?"}{" "}
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button size="sm" type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={isSaving}
            size="sm"
            type="button"
            variant="danger"
            onClick={
              confirmDelete?.mode === "bulk" ? onDeleteBulk : onDeletePreview
            }
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
