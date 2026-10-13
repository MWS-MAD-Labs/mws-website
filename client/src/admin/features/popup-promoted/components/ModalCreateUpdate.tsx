import { useState, type FormEvent, type ReactNode } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { adminApi, type GalleryItem, type PopupPromotedPayload } from '@/admin/api/adminApi';
import { uploadImageForPicker } from '@/admin/features/gallery/utils/uploadImageForPicker';
import CoverImagePickerModal from '@/admin/features/news/components/layouts/CoverImagePickerModal';

export type PopupPromotedFormData = {
  title: string;
  description: string;
  posterImagePath: string;
  posterImageAlt: string;
  buttonText: string;
  buttonUrl: string;
  targetType: string;
  targetId: string;
  openInNewTab: boolean;
  sortOrder: string;
  isActive: boolean;
  activeFrom: string;
  activeUntil: string;
};

type ModalCreateUpdateProps = {
  galleries: GalleryItem[];
  initialData?: PopupPromotedFormData;
  loading?: boolean;
  mode: 'create' | 'update';
  onClose: () => void;
  onGalleriesChange: (galleries: GalleryItem[]) => void;
  onSubmit: (data: PopupPromotedPayload) => void;
  open: boolean;
};

const emptyForm: PopupPromotedFormData = {
  title: '',
  description: '',
  posterImagePath: '',
  posterImageAlt: '',
  buttonText: 'Learn more',
  buttonUrl: '',
  targetType: 'CUSTOM',
  targetId: '',
  openInNewTab: false,
  sortOrder: '0',
  isActive: true,
  activeFrom: '',
  activeUntil: '',
};

function optionalText(value: string) {
  return value.trim() || null;
}

function isoDate(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function payloadFromForm(form: PopupPromotedFormData): PopupPromotedPayload {
  return {
    title: form.title.trim(),
    description: optionalText(form.description),
    posterImagePath: optionalText(form.posterImagePath),
    posterImageAlt: optionalText(form.posterImageAlt),
    buttonText: optionalText(form.buttonText),
    buttonUrl: optionalText(form.buttonUrl),
    targetType: optionalText(form.targetType),
    targetId: optionalText(form.targetId),
    openInNewTab: form.openInNewTab,
    sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
    isActive: form.isActive,
    activeFrom: isoDate(form.activeFrom),
    activeUntil: isoDate(form.activeUntil),
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
  const [form, setForm] = useState<PopupPromotedFormData>(
    mode === 'update' && initialData ? initialData : emptyForm,
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const isBusy = loading || uploadingPoster;
  const isUpdate = mode === 'update';

  if (!open) return null;

  function updateField<Key extends keyof PopupPromotedFormData>(
    field: Key,
    value: PopupPromotedFormData[Key],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(payloadFromForm(form));
  }

  async function handleSelectLocalFile(file: File) {
    setUploadingPoster(true);
    setPickerError(null);

    try {
      const uploaded = await uploadImageForPicker({
        file,
        galleries,
        fallbackGalleryTitle: 'Popup Promoted Posters',
        fallbackGalleryDescription: 'Poster images uploaded from Popup Promoted CMS.',
      });
      onGalleriesChange(uploaded.galleries);
      updateField('posterImagePath', uploaded.path);
      updateField('posterImageAlt', form.posterImageAlt || uploaded.alt);
      setPickerOpen(false);
    } catch (error) {
      setPickerError(error instanceof Error ? error.message : 'Failed to upload poster.');
    } finally {
      setUploadingPoster(false);
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
          aria-labelledby="popup-promoted-modal-title"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 id="popup-promoted-modal-title" className="text-lg font-semibold text-gray-900">
                {isUpdate ? 'Edit Popup Promoted' : 'Add Popup Promoted'}
              </h2>
              <p className="mt-0.5 text-sm text-gray-500">
                Manage the popup title, poster, CTA link, and schedule.
              </p>
            </div>
            <button
              type="button"
              aria-label="Close"
              className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
              disabled={isBusy}
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-5 px-6 py-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-5">
                <Field label="Title" htmlFor="popup-title" required>
                  <input
                    id="popup-title"
                    className={inputClass}
                    disabled={isBusy}
                    maxLength={255}
                    required
                    value={form.title}
                    onChange={(event) => updateField('title', event.target.value)}
                  />
                </Field>

                <Field label="Description" htmlFor="popup-description">
                  <textarea
                    id="popup-description"
                    className={inputClass + ' min-h-28 resize-y'}
                    disabled={isBusy}
                    value={form.description}
                    onChange={(event) => updateField('description', event.target.value)}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Button text" htmlFor="popup-button-text">
                    <input
                      id="popup-button-text"
                      className={inputClass}
                      disabled={isBusy}
                      maxLength={100}
                      value={form.buttonText}
                      onChange={(event) => updateField('buttonText', event.target.value)}
                    />
                  </Field>

                  <Field label="Button URL" htmlFor="popup-button-url">
                    <input
                      id="popup-button-url"
                      className={inputClass}
                      disabled={isBusy}
                      placeholder="/admission or https://forms.gle/..."
                      value={form.buttonUrl}
                      onChange={(event) => updateField('buttonUrl', event.target.value)}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Target type" htmlFor="popup-target-type">
                    <select
                      id="popup-target-type"
                      className={inputClass}
                      disabled={isBusy}
                      value={form.targetType}
                      onChange={(event) => updateField('targetType', event.target.value)}
                    >
                      <option value="CUSTOM">Custom</option>
                      <option value="NEWS">News</option>
                      <option value="ADMISSION">Admission</option>
                      <option value="FORM">Form action</option>
                      <option value="PAGE">Page</option>
                      <option value="EXTERNAL">External link</option>
                    </select>
                  </Field>

                  <Field label="Target ID / slug" htmlFor="popup-target-id">
                    <input
                      id="popup-target-id"
                      className={inputClass}
                      disabled={isBusy}
                      placeholder="news slug, page slug, or optional id"
                      value={form.targetId}
                      onChange={(event) => updateField('targetId', event.target.value)}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Active from" htmlFor="popup-active-from">
                    <input
                      id="popup-active-from"
                      className={inputClass}
                      disabled={isBusy}
                      type="datetime-local"
                      value={form.activeFrom}
                      onChange={(event) => updateField('activeFrom', event.target.value)}
                    />
                  </Field>

                  <Field label="Active until" htmlFor="popup-active-until">
                    <input
                      id="popup-active-until"
                      className={inputClass}
                      disabled={isBusy}
                      type="datetime-local"
                      value={form.activeUntil}
                      onChange={(event) => updateField('activeUntil', event.target.value)}
                    />
                  </Field>
                </div>
              </div>

              <div className="space-y-5">
                <Field label="Poster image">
                  {form.posterImagePath ? (
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <img
                        src={adminApi.publicAssetUrl(form.posterImagePath)}
                        alt={form.posterImageAlt || form.title || 'Popup poster'}
                        className="aspect-[4/5] w-full bg-gray-50 object-contain"
                      />
                      <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-3 py-2">
                        <button
                          type="button"
                          className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                          disabled={isBusy}
                          onClick={() => updateField('posterImagePath', '')}
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
                      className="flex aspect-[4/5] w-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm font-medium text-gray-500 transition hover:border-[#7e1518] hover:bg-gray-50 hover:text-[#7e1518] disabled:opacity-50"
                      disabled={isBusy}
                      onClick={() => setPickerOpen(true)}
                    >
                      <ImagePlus size={22} />
                      <span className="mt-2">
                        {uploadingPoster ? 'Uploading...' : 'Choose poster'}
                      </span>
                    </button>
                  )}
                  {pickerError ? <p className="mt-1.5 text-xs text-red-600">{pickerError}</p> : null}
                </Field>

                <Field label="Poster alt text" htmlFor="popup-poster-alt">
                  <input
                    id="popup-poster-alt"
                    className={inputClass}
                    disabled={isBusy}
                    maxLength={255}
                    value={form.posterImageAlt}
                    onChange={(event) => updateField('posterImageAlt', event.target.value)}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Sort order" htmlFor="popup-sort-order">
                    <input
                      id="popup-sort-order"
                      className={inputClass}
                      disabled={isBusy}
                      type="number"
                      value={form.sortOrder}
                      onChange={(event) => updateField('sortOrder', event.target.value)}
                    />
                  </Field>

                  <Field label="Status" htmlFor="popup-status">
                    <select
                      id="popup-status"
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

                <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.openInNewTab}
                    disabled={isBusy}
                    onChange={(event) => updateField('openInNewTab', event.target.checked)}
                  />
                  Open link in new tab
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                disabled={isBusy}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#7e1518] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#681215] disabled:opacity-50"
                disabled={isBusy || !form.title.trim()}
              >
                {uploadingPoster ? 'Uploading...' : loading ? 'Saving...' : isUpdate ? 'Save Changes' : 'Add Popup'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {pickerOpen ? (
        <CoverImagePickerModal
          galleries={galleries}
          open={pickerOpen}
          title="Choose popup poster"
          onClose={() => {
            if (!uploadingPoster) setPickerOpen(false);
          }}
          onSelect={(asset) => {
            setPickerError(null);
            updateField('posterImagePath', asset.path);
            updateField('posterImageAlt', form.posterImageAlt || asset.alt);
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
      <label
        className="mb-1.5 block text-sm font-medium text-gray-700"
        htmlFor={htmlFor}
      >
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
