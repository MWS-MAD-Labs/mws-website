// UNUSED — SAFE TO DELETE: only used by the old NewsEditorModal footer; CreateUpdateNews owns the active page footer.
import Button from '@/admin/components/ui/Button';

type NewsEditorFooterProps = {
  isEditing: boolean;
  saving: boolean;
  canPreview: boolean;
  onCancel: () => void;
  onPreview: () => void;
};

export default function NewsEditorFooter({
  isEditing,
  saving,
  canPreview,
  onCancel,
  onPreview,
}: NewsEditorFooterProps) {
  return (
    <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-4">
      <Button type="button" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={onPreview} disabled={!canPreview}>
          Preview
        </Button>

        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : isEditing ? 'Update News' : 'Create News'}
        </Button>
      </div>
    </div>
  );
}
