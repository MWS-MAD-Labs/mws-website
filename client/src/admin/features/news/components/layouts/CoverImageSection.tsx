import { adminApi } from '@/admin/api/adminApi';

import Button from '@/admin/components/ui/Button';

import type { NewsForm } from '@/admin/features/news/newsEditorModel';

type CoverImageSectionProps = {
  form: NewsForm;

  localFileName?: string | null;

  localPreviewUrl?: string | null;

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
  const previewUrl =
    localPreviewUrl || (form.coverImage ? adminApi.publicAssetUrl(form.coverImage) : '');

  return (
    <section className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-900">Images</h2>
      </div>

      <div className="p-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,1fr)]">
          {/* Image */}
          <div className="min-w-0">
            <button
              type="button"
              onClick={onOpenAssetPicker}
              className={[
                'group relative block w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 text-left transition',
                'hover:border-[#7e1518] focus:outline-none focus:ring-2 focus:ring-[#7e1518]/20',
                previewUrl ? 'aspect-[16/7]' : 'aspect-[16/7]',
              ].join(' ')}
            >
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt={form.coverImageAlt || 'News cover'}
                    className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.01]"
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                    <span className="rounded-lg bg-white/95 px-4 py-2 text-sm font-medium text-gray-900 opacity-0 shadow-sm transition group-hover:opacity-100">
                      Change image
                    </span>
                  </div>

                  {/* File name */}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-black/50 px-4 py-3">
                    <span className="min-w-0 truncate text-sm font-medium text-white">
                      {localFileName || form.coverImage}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center px-6 text-center">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Choose news cover image</p>

                    <p className="mt-1 text-xs text-gray-500">
                      Click to choose from Gallery or your computer
                    </p>
                  </div>
                </div>
              )}
            </button>

            <div className="mt-3 flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onOpenAssetPicker}>
                Choose image
              </Button>

              {previewUrl ? (
                <Button type="button" variant="outline" onClick={onRemoveCover}>
                  Remove
                </Button>
              ) : null}
            </div>
          </div>

          {/* Image metadata */}
          <div className="flex flex-col justify-center gap-4">
            <div>
              <label
                htmlFor="news-cover-image"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Image path or URL
              </label>

              <input
                id="news-cover-image"
                type="text"
                value={form.coverImage}
                onChange={(event) => onFieldChange('coverImage', event.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7e1518] focus:ring-1 focus:ring-[#7e1518]"
              />
            </div>

            <div>
              <label
                htmlFor="news-cover-image-alt"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Alternative text
                <span className="ml-1 font-normal text-gray-400">(optional)</span>
              </label>

              <input
                id="news-cover-image-alt"
                type="text"
                value={form.coverImageAlt}
                onChange={(event) => onFieldChange('coverImageAlt', event.target.value)}
                placeholder="Describe the cover image"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7e1518] focus:ring-1 focus:ring-[#7e1518]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
