import { adminApi } from '@/admin/api/adminApi';
import Button from '@/admin/components/ui/Button';
import type { NewsForm } from '@/admin/features/news/newsEditorModel';

import FormSection from './FormSection';
import ImageThumb from './ImageThumb';
import { inputClass } from './formStyles';

type CoverImageSectionProps = {
  form: NewsForm;
  localFileName?: string;
  localPreviewUrl: string | null;
  onFieldChange: <Key extends keyof NewsForm>(key: Key, value: NewsForm[Key]) => void;
  onOpenAssetPicker: () => void;
  onRemoveCover: () => void;
};

export default function CoverImageSection({
  form,
  localFileName,
  localPreviewUrl,
  onFieldChange,
  onOpenAssetPicker,
  onRemoveCover,
}: CoverImageSectionProps) {
  const previewSrc =
    localPreviewUrl ?? (form.coverImage ? adminApi.publicAssetUrl(form.coverImage) : null);

  return (
    <FormSection title="Cover image">
      <div className="flex items-start gap-3">
        <ImageThumb src={previewSrc} alt={form.coverImageAlt} />

        <div className="flex min-w-0 flex-col items-start gap-1">
          <Button type="button" variant="outline" onClick={onOpenAssetPicker}>
            {previewSrc ? 'Change' : 'Choose image'}
          </Button>

          {previewSrc ? (
            <Button type="button" variant="ghost" onClick={onRemoveCover}>
              Remove
            </Button>
          ) : null}
        </div>
      </div>

      {localFileName ? <p className="truncate text-xs text-[#64748B]">{localFileName}</p> : null}

      <input
        type="text"
        value={form.coverImageAlt}
        onChange={(event) => onFieldChange('coverImageAlt', event.target.value)}
        placeholder="Alt text"
        className={inputClass}
      />
    </FormSection>
  );
}
  