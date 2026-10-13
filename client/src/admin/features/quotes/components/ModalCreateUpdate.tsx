import { useState, type FormEvent, type ReactNode } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { adminApi, type CampusSpotlightPayload, type GalleryItem } from '@/admin/api/adminApi';
import { uploadImageForPicker } from '@/admin/features/gallery/utils/uploadImageForPicker';
import CoverImagePickerModal from '@/admin/features/news/components/layouts/CoverImagePickerModal';

export type QuoteFormData = {
  cite: string;
  imageAlt: string;
  imagePath: string;
  isActive: boolean;
  sortOrder: string;
  text: string;
};

type ModalCreateUpdateProps = {
  galleries: GalleryItem[];
  initialData?: QuoteFormData;
  loading?: boolean;
  mode: 'create' | 'update';
  onClose: () => void;
  onGalleriesChange: (galleries: GalleryItem[]) => void;
  onSubmit: (data: CampusSpotlightPayload) => void;
  open: boolean;
};

const emptyForm: QuoteFormData = {
  cite: '',
  imageAlt: '',
  imagePath: '',
  isActive: true,
  sortOrder: '0',
  text: '',
};

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function payloadFromForm(form: QuoteFormData): CampusSpotlightPayload {
  return {
    cite: form.cite.trim(),
    imageAlt: optionalText(form.imageAlt),
    imagePath: optionalText(form.imagePath),
    isActive: form.isActive,
    sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
    text: form.text.trim(),
  };
}

export default function ModalCreateUpdate({
  galleries,
  initialData,
  loading = false,
  mode,
  onClose,
  onGalleriesChange,
  onSubmit,
  open,
}: ModalCreateUpdateProps) {
  const [form, setForm] = useState<QuoteFormData>(
    mode === 'update' && initialData ? initialData : emptyForm,
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const isBusy = loading || uploadingImage;
  const isUpdate = mode === 'update';

  if (!open) return null;

  function updateField<Key extends keyof QuoteFormData>(
    field: Key,
    value: QuoteFormData[Key],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(payloadFromForm(form));
  }

  async function handleSelectLocalFile(file: File) {
    setUploadingImage(true);
    setPickerError(null);

    try {
      const uploaded = await uploadImageForPicker({
        caption: form.cite || 'Campus spotlight image',
        fallbackGalleryDescription: 'Campus Spotlight images uploaded from Quotes CMS.',
        fallbackGalleryTitle: 'Campus Spotlight Images',
        file,
        galleries,
      });

      onGalleriesChange(uploaded.galleries);
      updateField('imagePath', uploaded.path);
      updateField('imageAlt', form.imageAlt || uploaded.alt || form.cite);
      setPickerOpen(false);
    } catch (error) {
      setPickerError(error instanceof Error ? error.message : 'Failed to upload spotlight image.');
    } finally {
      setUploadingImage(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-8"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !isBusy) onClose();
        }}
      >
        <div
          className="w-full max-w-3xl rounded-xl bg-white shadow-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quote-modal-title"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 id="quote-modal-title" className="text-lg font-semibold text-gray-900">
                {isUpdate ? 'Edit Quote' : 'Add Quote'}
              </h2>
              <p className="mt-0.5 text-sm text-gray-500">
                Manage Campus Spotlight content shown on Home.
              </p>
            </div>

            <button
              type="button"
              aria-label="Close"
              className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isBusy}
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-5 px-6 py-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-5">
                <Field label="Text" htmlFor="quote-text" required>
                  <textarea
                    id="quote-text"
                    className={inputClass + ' min-h-32 resize-y'}
                    disabled={isBusy}
                    required
                    value={form.text}
                    onChange={(event) => updateField('text', event.target.value)}
                  />
                </Field>

                <Field label="Cite" htmlFor="quote-cite" required>
                  <input
                    id="quote-cite"
                    className={inputClass}
                    disabled={isBusy}
                    required
                    value={form.cite}
                    onChange={(event) => updateField('cite', event.target.value)}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Sort order" htmlFor="quote-sort-order">
                    <input
                      id="quote-sort-order"
                      className={inputClass}
                      disabled={isBusy}
                      type="number"
                      value={form.sortOrder}
                      onChange={(event) => updateField('sortOrder', event.target.value)}
                    />
                  </Field>

                  <Field label="Status" htmlFor="quote-status">
                    <select
                      id="quote-status"
                      className={inputClass}
                      disabled={isBusy}
                      value={form.isActive ? 'active' : 'inactive'}
                      onChange={(event) => updateField('isActive', event.target.value === 'active')}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </Field>
                </div>
              </div>

              <div className="space-y-5">
                <Field label="Image">
                  {form.imagePath ? (
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <img
                        alt={form.imageAlt || form.cite || 'Campus spotlight'}
                        className="aspect-[16/10] w-full bg-gray-50 object-cover"
                        src={adminApi.publicAssetUrl(form.imagePath)}
                      />
                      <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-3 py-2">
                        <button
                          type="button"
                          className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                          disabled={isBusy}
                          onClick={() => {
                            updateField('imageAlt', '');
                            updateField('imagePath', '');
                          }}
                        >
                          Remove
                        </button>
                        <button
                          type="button"
                          className="text-sm font-medium text-[#7e1518] hover:text-[#681215] disabled:opacity-50"
                          disabled={isBusy}
                          onClick={() => setPickerOpen(true)}
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="flex aspect-[16/10] w-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm font-medium text-gray-500 transition hover:border-[#7e1518] hover:bg-gray-50 hover:text-[#7e1518] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isBusy}
                      onClick={() => setPickerOpen(true)}
                    >
                      <ImagePlus size={22} />
                      <span className="mt-2">
                        {uploadingImage ? 'Uploading...' : 'Choose Image'}
                      </span>
                    </button>
                  )}
                  {pickerError ? <p className="mt-1.5 text-xs text-red-600">{pickerError}</p> : null}
                </Field>

                <Field label="Image alt text" htmlFor="quote-image-alt">
                  <input
                    id="quote-image-alt"
                    className={inputClass}
                    disabled={isBusy}
                    maxLength={255}
                    value={form.imageAlt}
                    onChange={(event) => updateField('imageAlt', event.target.value)}
                  />
                </Field>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isBusy}
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-lg bg-[#7e1518] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#681215] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isBusy || !form.text.trim() || !form.cite.trim()}
              >
                {uploadingImage
                  ? 'Uploading...'
                  : loading
                    ? 'Saving...'
                    : isUpdate
                      ? 'Save Changes'
                      : 'Add Quote'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {pickerOpen ? (
        <CoverImagePickerModal
          allowedKinds={['IMAGE']}
          galleries={galleries}
          open={pickerOpen}
          title="Choose Spotlight Image"
          onClose={() => {
            if (!uploadingImage) setPickerOpen(false);
          }}
          onSelect={(asset) => {
            setPickerError(null);
            updateField('imageAlt', asset.alt || form.cite);
            updateField('imagePath', asset.path);
            setPickerOpen(false);
          }}
          onSelectLocalFile={(file) => void handleSelectLocalFile(file)}
        />
      ) : null}
    </>
  );
}

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7e1518] focus:ring-1 focus:ring-[#7e1518] disabled:bg-gray-50';

function Field({
  children,
  htmlFor,
  label,
  required = false,
}: {
  children: ReactNode;
  htmlFor?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700" htmlFor={htmlFor}>
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
        {!required ? (
          <span className="ml-1 text-xs font-normal text-gray-400">(opsional)</span>
        ) : null}
      </label>
      {children}
    </div>
  );
}
