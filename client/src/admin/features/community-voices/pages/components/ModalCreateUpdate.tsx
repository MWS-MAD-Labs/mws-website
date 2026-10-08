import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { GalleryItem } from '@/admin/api/adminApi';
import Field from '@/admin/components/ui/Field';
import Select from '@/admin/components/ui/Select';
import { uploadImageForPicker } from '@/admin/features/gallery/utils/uploadImageForPicker';
import CoverImagePickerModal from '@/admin/features/news/components/layouts/CoverImagePickerModal';
import { getErrorMessage } from '@/admin/features/news/newsUtils';
import { VOICE_ROLE_OPTIONS, emptyVoiceForm, type VoiceForm } from '../voiceFormModel';
import VoiceMediaPreview from './VoiceMediaPreview';

type ModalCreateUpdateProps = {
  galleries: GalleryItem[];
  initialData?: VoiceForm;
  loading?: boolean;
  mode: 'create' | 'update';
  onClose: () => void;
  onSubmit: (form: VoiceForm) => void;
  open: boolean;
};

export default function ModalCreateUpdate({
  galleries,
  initialData,
  loading = false,
  mode,
  onClose,
  onSubmit,
  open,
}: ModalCreateUpdateProps) {
  const [form, setForm] = useState<VoiceForm>(
    mode === 'update' && initialData ? initialData : emptyVoiceForm,
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const isUpdate = mode === 'update';
  const isBusy = loading || uploadingMedia;
  const hasCustomRole = form.role !== '' && !VOICE_ROLE_OPTIONS.includes(form.role);

  if (!open) return null;

  function updateField<Key extends keyof VoiceForm>(field: Key, value: VoiceForm[Key]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(form);
  }

  function openPicker() {
    if (isBusy) return;

    setPickerError(null);
    setPickerOpen(true);
  }

  function closePicker() {
    if (uploadingMedia) return;

    setPickerOpen(false);
  }

  async function handleSelectLocalFile(file: File) {
    setUploadingMedia(true);
    setPickerError(null);

    try {
      const uploaded = await uploadImageForPicker({
        caption: form.name.trim() || 'Community voice image',
        fallbackGalleryTitle: 'Community Voice Images',
        file,
        galleries,
      });

      updateField('imagePath', uploaded.path);
      setPickerOpen(false);
    } catch (error) {
      setPickerError(getErrorMessage(error, 'Failed to upload voice image.'));
    } finally {
      setUploadingMedia(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !isBusy) {
            onClose();
          }
        }}
      >
        <div
          className="max-h-[calc(100dvh-32px)] w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="voice-modal-title"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 id="voice-modal-title" className="text-lg font-semibold text-gray-900">
                {isUpdate ? 'Edit Voice' : 'Add Voice'}
              </h2>

              <p className="mt-0.5 text-sm text-gray-500">
                {isUpdate ? 'Update community voice information.' : 'Add a new community voice.'}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="max-h-[calc(100dvh-180px)] space-y-5 overflow-y-auto px-6 py-5">
              <Field label="Name">
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7e1518] focus:ring-1 focus:ring-[#7e1518] disabled:bg-gray-50"
                  disabled={isBusy}
                  maxLength={255}
                  placeholder="Enter voice name"
                  required
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Role">
                  <Select
                    className="w-full"
                    disabled={isBusy}
                    required
                    value={form.role}
                    onChange={(event) => updateField('role', event.target.value)}
                  >
                    {hasCustomRole ? <option value={form.role}>{form.role}</option> : null}
                    {VOICE_ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Grade / context">
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7e1518] focus:ring-1 focus:ring-[#7e1518] disabled:bg-gray-50"
                    disabled={isBusy}
                    maxLength={255}
                    placeholder="Grade 9, Parent, Alumni"
                    value={form.grade}
                    onChange={(event) => updateField('grade', event.target.value)}
                  />
                </Field>
              </div>

              <Field label="Quote">
                <textarea
                  className="min-h-28 w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7e1518] focus:ring-1 focus:ring-[#7e1518] disabled:bg-gray-50"
                  disabled={isBusy}
                  placeholder="Enter the testimonial quote"
                  required
                  value={form.quote}
                  onChange={(event) => updateField('quote', event.target.value)}
                />
              </Field>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Voice Media
                </label>

                {form.imagePath ? (
                  <div className="rounded-lg border border-gray-200 p-3">
                    <VoiceMediaPreview
                      className="aspect-video w-full rounded-md bg-gray-50 object-cover"
                      alt={form.name || 'Community voice media'}
                      path={form.imagePath}
                    />

                    <div className="mt-3 flex min-w-0 items-center justify-between gap-3">
                      <p className="min-w-0 truncate text-xs text-gray-400">{form.imagePath}</p>

                      <div className="flex shrink-0 items-center gap-3">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => {
                            setPickerError(null);
                            updateField('imagePath', '');
                          }}
                          className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          Remove
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={openPicker}
                          className="text-sm font-medium text-[#7e1518] hover:text-[#681215] disabled:opacity-50"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={openPicker}
                    className="flex w-full items-center justify-center rounded-lg border border-dashed border-gray-300 px-4 py-8 text-sm font-medium text-gray-500 transition hover:border-[#7e1518] hover:bg-gray-50 hover:text-[#7e1518] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploadingMedia ? 'Uploading...' : 'Choose Media'}
                  </button>
                )}

                {pickerError ? <p className="mt-1.5 text-xs text-red-600">{pickerError}</p> : null}

                {!form.imagePath ? (
                  <p className="mt-1.5 text-xs text-gray-400">
                    Select an image or video from the gallery.
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Sort order">
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7e1518] focus:ring-1 focus:ring-[#7e1518] disabled:bg-gray-50"
                    disabled={isBusy}
                    type="number"
                    value={form.sortOrder}
                    onChange={(event) => updateField('sortOrder', event.target.value)}
                  />
                </Field>

                <Field label="Home order">
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7e1518] focus:ring-1 focus:ring-[#7e1518] disabled:bg-gray-50"
                    disabled={isBusy || !form.showOnHome}
                    type="number"
                    value={form.homeSortOrder}
                    onChange={(event) => updateField('homeSortOrder', event.target.value)}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    checked={form.isActive}
                    className="h-4 w-4 accent-[#7e1518]"
                    disabled={isBusy}
                    type="checkbox"
                    onChange={(event) => updateField('isActive', event.target.checked)}
                  />
                  Active
                </label>

                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    checked={form.showOnHome}
                    className="h-4 w-4 accent-[#7e1518]"
                    disabled={isBusy || !form.isActive}
                    type="checkbox"
                    onChange={(event) => updateField('showOnHome', event.target.checked)}
                  />
                  Show on Home
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isBusy}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  isBusy ||
                  !form.name.trim() ||
                  !form.role.trim() ||
                  !form.quote.trim() ||
                  !form.imagePath.trim()
                }
                className="rounded-lg bg-[#7e1518] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#681215] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploadingMedia
                  ? 'Uploading...'
                  : loading
                    ? 'Saving...'
                    : isUpdate
                      ? 'Save Changes'
                      : 'Add Voice'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {pickerOpen ? (
        <CoverImagePickerModal
          allowedKinds={['IMAGE', 'VIDEO']}
          galleries={galleries}
          open={pickerOpen}
          title="Choose voice media"
          onClose={closePicker}
          onSelect={(asset) => {
            setPickerError(null);
            updateField('imagePath', asset.path);
            setPickerOpen(false);
          }}
          onSelectLocalFile={(file) => void handleSelectLocalFile(file)}
        />
      ) : null}
    </>
  );
}
