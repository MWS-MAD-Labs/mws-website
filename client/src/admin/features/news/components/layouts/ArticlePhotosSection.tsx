import { Plus, Trash2 } from 'lucide-react';

import Button from '@/admin/components/ui/Button';
import EditorSection from './EditorSection';

import { NEWS_INPUT_CLASS, type NewsArticlePhoto } from '@/admin/features/news/newsEditorModel';

type ArticlePhotosSectionProps = {
  photos: NewsArticlePhoto[];
  onOpenAssetPicker: () => void;
  onRemovePhoto: (id: string) => void;
  onChangePhoto: (id: string, field: 'alt' | 'caption', value: string) => void;
};

export default function ArticlePhotosSection({
  photos,
  onOpenAssetPicker,
  onRemovePhoto,
  onChangePhoto,
}: ArticlePhotosSectionProps) {
  return (
    <EditorSection
      title="Article Photos"
      description="Add additional photos that appear with this news article."
      action={
        <Button type="button" onClick={onOpenAssetPicker}>
          <Plus size={16} />
          Add Photo
        </Button>
      }
    >
      <div className="p-5">
        {photos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center">
            <p className="text-sm font-medium text-gray-700">No article photos added</p>

            <p className="mt-1 text-sm text-gray-500">
              Add photos that are different from the cover image.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {photos.map((photo, index) => (
              <div key={photo.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Photo {index + 1}</p>

                    <p className="mt-0.5 text-xs text-gray-500">Additional article image</p>
                  </div>

                  <Button type="button" variant="ghost" onClick={() => onRemovePhoto(photo.id)}>
                    <Trash2 size={16} />
                    Remove
                  </Button>
                </div>

                <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
                  <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                    <div className="aspect-[4/3]">
                      <img
                        src={photo.previewUrl}
                        alt={photo.alt || `Photo ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                        htmlFor={`${photo.id}-alt`}
                      >
                        Alternative text
                      </label>

                      <input
                        id={`${photo.id}-alt`}
                        className={NEWS_INPUT_CLASS}
                        placeholder="Describe the image"
                        value={photo.alt}
                        onChange={(event) => onChangePhoto(photo.id, 'alt', event.target.value)}
                      />
                    </div>

                    <div>
                      <label
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                        htmlFor={`${photo.id}-caption`}
                      >
                        Caption
                      </label>

                      <textarea
                        id={`${photo.id}-caption`}
                        className={`${NEWS_INPUT_CLASS} min-h-24 resize-y`}
                        placeholder="Optional image caption"
                        value={photo.caption}
                        onChange={(event) => onChangePhoto(photo.id, 'caption', event.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </EditorSection>
  );
}
