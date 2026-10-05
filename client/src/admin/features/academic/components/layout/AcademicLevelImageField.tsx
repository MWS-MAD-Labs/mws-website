import Button from '@/admin/components/ui/Button';
import ImageThumb from '@/admin/features/news/components/layouts/ImageThumb';
import { inputClass } from '@/admin/features/news/components/layouts/formStyles';
import { publicAssetUrl } from '@/lib/api';
import type { ImageField } from '../../lib/academicLevelEditor';

type AcademicLevelImageFieldProps = {
  alt?: string;
  disabled: boolean;
  field: ImageField;
  image: string;
  onAltChange?: (value: string) => void;
  onChoose: (field: ImageField) => void;
  onRemove?: () => void;
};

export default function AcademicLevelImageField({
  alt,
  disabled,
  field,
  image,
  onAltChange,
  onChoose,
  onRemove,
}: AcademicLevelImageFieldProps) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-3">
        <ImageThumb
          src={image ? publicAssetUrl(image) : null}
          alt={alt}
          className="h-16 w-20"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={disabled}
            size="sm"
            type="button"
            variant="outline"
            onClick={() => onChoose(field)}
          >
            {image ? 'Change' : 'Choose image'}
          </Button>
          {onRemove && image ? (
            <Button
              disabled={disabled}
              size="sm"
              type="button"
              variant="ghost"
              onClick={onRemove}
            >
              Remove
            </Button>
          ) : null}
        </div>
      </div>
      {onAltChange ? (
        <input
          className={inputClass}
          placeholder="Alt text"
          value={alt ?? ''}
          onChange={(event) => onAltChange(event.target.value)}
        />
      ) : null}
    </div>
  );
}
