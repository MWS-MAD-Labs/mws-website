import Button from '@/admin/components/ui/Button';
import type { NewsForm } from '@/admin/features/news/newsEditorModel';

import FormSection from './FormSection';
import ImageThumb from './ImageThumb';
import { inputClass } from './formStyles';

type ArticlePhotoField = 'alt' | 'caption';

type ArticlePhotosSectionProps = {
  photos: NewsForm['articlePhotos'];
  onOpenAssetPicker: () => void;
  onRemovePhoto: (id: string) => void;
  onChangePhoto: (id: string, field: ArticlePhotoField, value: string) => void;
};

export default function ArticlePhotosSection({
  photos,
  onOpenAssetPicker,
  onRemovePhoto,
  onChangePhoto,
}: ArticlePhotosSectionProps) {
  return (
    <FormSection
      title="Article photos"
      action={
        <Button type="button" variant="outline" onClick={onOpenAssetPicker}>
          Add photo
        </Button>
      }
    >
      {photos.length ? (
        <ul className="divide-y divide-[#E2E8F0] rounded-lg border border-[#E2E8F0]">
          {photos.map((photo) => (
            <li key={photo.id} className="flex items-center gap-3 p-3">
              <ImageThumb src={photo.previewUrl} alt={photo.alt} className="h-12 w-16" />

              <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                <input
                  type="text"
                  value={photo.alt}
                  onChange={(event) => onChangePhoto(photo.id, 'alt', event.target.value)}
                  placeholder="Alt text"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={photo.caption}
                  onChange={(event) => onChangePhoto(photo.id, 'caption', event.target.value)}
                  placeholder="Caption"
                  className={inputClass}
                />
              </div>

              <Button type="button" variant="ghost" onClick={() => onRemovePhoto(photo.id)}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[#64748B]">No article photos yet.</p>
      )}
    </FormSection>
  );
}
