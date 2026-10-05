import { useState } from 'react';
import { X } from 'lucide-react';

type PartnerFormData = {
  name: string;
  description: string;
  logo: string;
  link: string;
  status: string;
};

type ModalCreateUpdateProps = {
  open: boolean;
  mode: 'create' | 'update';
  initialData?: PartnerFormData;
  onClose: () => void;
  onSubmit: (data: PartnerFormData) => void;
  loading?: boolean;
};

const emptyForm: PartnerFormData = {
  name: '',
  description: '',
  logo: '',
  link: '',
  status: 'active',
};

export default function ModalCreateUpdate({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
  loading = false,
}: ModalCreateUpdateProps) {
  const [form, setForm] = useState<PartnerFormData>(
    mode === 'update' && initialData ? initialData : emptyForm,
  );

  const isUpdate = mode === 'update';

  if (!open) return null;

  const updateField = (field: keyof PartnerFormData, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      logo: form.logo.trim(),
      link: form.link.trim(),
      status: form.status.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="partner-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 id="partner-modal-title" className="text-lg font-semibold text-gray-900">
              {isUpdate ? 'Edit Partner' : 'Add Partner'}
            </h2>

            <p className="mt-0.5 text-sm text-gray-500">
              {isUpdate ? 'Update partner information.' : 'Add a new partner to the website.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-5">
            {/* Name */}
            <div>
              <label
                htmlFor="partner-name"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Partner Name
              </label>

              <input
                id="partner-name"
                type="text"
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder="Enter partner name"
                maxLength={225}
                disabled={loading}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7e1518] focus:ring-1 focus:ring-[#7e1518] disabled:bg-gray-50"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="partner-description"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Description
              </label>

              <textarea
                id="partner-description"
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="Enter partner description"
                maxLength={225}
                rows={3}
                disabled={loading}
                required
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7e1518] focus:ring-1 focus:ring-[#7e1518] disabled:bg-gray-50"
              />

              <div className="mt-1 text-right text-xs text-gray-400">
                {form.description.length}/225
              </div>
            </div>

            {/* Logo */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Logo</label>

              {form.logo ? (
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                    <img
                      src={form.logo}
                      alt={form.name || 'Partner logo'}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-700">Logo selected</p>

                    <p className="mt-0.5 truncate text-xs text-gray-400">{form.logo}</p>
                  </div>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => updateField('logo', '')}
                    className="shrink-0 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    // Open GalleryPickerModal here.
                  }}
                  className="flex w-full items-center justify-center rounded-lg border border-dashed border-gray-300 px-4 py-8 text-sm font-medium text-gray-500 transition hover:border-[#7e1518] hover:bg-gray-50 hover:text-[#7e1518] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Choose Image
                </button>
              )}

              {!form.logo && (
                <p className="mt-1.5 text-xs text-gray-400">Select an image from the gallery.</p>
              )}
            </div>

            {/* Link */}
            <div>
              <label
                htmlFor="partner-link"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Link
                <span className="ml-1 font-normal text-gray-400">(Optional)</span>
              </label>

              <input
                id="partner-link"
                type="text"
                value={form.link}
                onChange={(event) => updateField('link', event.target.value)}
                placeholder="https://example.com"
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7e1518] focus:ring-1 focus:ring-[#7e1518] disabled:bg-gray-50"
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="partner-status"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Status
              </label>

              <select
                id="partner-status"
                value={form.status}
                onChange={(event) => updateField('status', event.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#7e1518] focus:ring-1 focus:ring-[#7e1518] disabled:bg-gray-50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                !form.name.trim() ||
                !form.description.trim() ||
                !form.logo.trim() ||
                !form.status.trim()
              }
              className="rounded-lg bg-[#7e1518] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#681215] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Saving...' : isUpdate ? 'Save Changes' : 'Add Partner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
