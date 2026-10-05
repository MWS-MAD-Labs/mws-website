import Button from '@/admin/components/ui/Button';
import Field from '@/admin/components/ui/Field';
import ImageThumb from '@/admin/features/news/components/layouts/ImageThumb';
import { inputClass } from '@/admin/features/news/components/layouts/formStyles';
import { publicAssetUrl } from '@/lib/api';
import type { AcademicOverviewEditorState } from '../../hooks/useAcademicOverviewEditor';

const cardClass = 'min-w-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white';
const cardHeaderClass = 'border-b border-[#E2E8F0] px-5 py-4';
const cardTitleClass = 'text-base font-semibold text-[#1C2434]';
const cardHintClass = 'mt-1 text-sm text-[#64748B]';

type AcademicOverviewMainFormProps = {
  editor: AcademicOverviewEditorState;
};

export default function AcademicOverviewMainForm({ editor }: AcademicOverviewMainFormProps) {
  const { form, isBusy, setIsAssetPickerOpen, updateForm } = editor;

  return (
    <div className="min-w-0 space-y-5">
      <section className={cardClass}>
        <div className={cardHeaderClass}>
          <h2 className={cardTitleClass}>Basic Information</h2>
          <p className={cardHintClass}>Content shown on the Academic overview page.</p>
        </div>

        <div className="grid gap-4 p-5">
          <Field label="Title">
            <input
              required
              className={inputClass}
              value={form.title}
              onChange={(event) => updateForm('title', event.target.value)}
            />
          </Field>

          <Field label="Description">
            <textarea
              className={`${inputClass} min-h-32 resize-y leading-6`}
              maxLength={2000}
              value={form.description}
              onChange={(event) => updateForm('description', event.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className={cardClass}>
        <div className={cardHeaderClass}>
          <h2 className={cardTitleClass}>Cover Image</h2>
          <p className={cardHintClass}>Hero image used by the public Academic overview page.</p>
        </div>

        <div className="grid gap-4 p-5">
          <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
            {form.coverImage ? (
              <img
                className="aspect-[16/7] w-full object-cover"
                src={publicAssetUrl(form.coverImage)}
                alt={form.title}
              />
            ) : (
              <div className="grid aspect-[16/7] place-items-center text-sm text-[#64748B]">
                No cover image selected.
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ImageThumb
              src={form.coverImage ? publicAssetUrl(form.coverImage) : null}
              alt={form.title}
              className="h-16 w-20"
            />

            <div className="flex flex-wrap gap-2">
              <Button
                disabled={isBusy}
                size="sm"
                type="button"
                variant="outline"
                onClick={() => setIsAssetPickerOpen(true)}
              >
                {form.coverImage ? 'Change Image' : 'Choose Image'}
              </Button>

              {form.coverImage ? (
                <Button
                  disabled={isBusy}
                  size="sm"
                  type="button"
                  variant="ghost"
                  onClick={() => updateForm('coverImage', '')}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
