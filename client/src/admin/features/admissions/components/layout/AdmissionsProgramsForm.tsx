import { adminApi } from '@/admin/api/adminApi';
import Button from '@/admin/components/ui/Button';
import Field from '@/admin/components/ui/Field';

import type { AdmissionsEditorState } from '../../hooks/useAdmissionsEditor';

const inputClass = 'rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm';

type AdmissionsProgramsFormProps = {
  editor: AdmissionsEditorState;
};

export default function AdmissionsProgramsForm({ editor }: AdmissionsProgramsFormProps) {
  const {
    isLoading,
    isSaving,
    programs,
    saveAdmissions,
    setAssetPickerProgramId,
    updateProgram,
  } = editor;
  const isBusy = isLoading || isSaving;

  return (
    <form
      id="admissions-editor-form"
      className="min-w-0 space-y-5"
      onSubmit={saveAdmissions}
    >
      <section className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
        <div className="border-b border-[#E2E8F0] px-5 py-4">
          <h1 className="text-base font-semibold text-[#1C2434]">Admissions by Level</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Edit the visible title, age range, description, image, and WhatsApp contact for each
            admissions card.
          </p>
        </div>

        <div className="grid gap-4 p-5">
          {isLoading ? (
            <div className="rounded-lg border border-[#E2E8F0] p-6 text-sm text-[#64748B]">
              Loading admissions...
            </div>
          ) : null}

          {!isLoading && !programs.length ? (
            <div className="rounded-lg border border-dashed border-[#E2E8F0] p-6 text-sm text-[#64748B]">
              No admission programs found.
            </div>
          ) : null}

          {programs.map((program, index) => (
            <section className="rounded-lg border border-[#E2E8F0] p-4" key={program.id}>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-[#1C2434]">
                    {program.title || `Program ${index + 1}`}
                  </h2>
                  <p className="text-sm text-[#64748B]">Public admissions card content.</p>
                </div>

                <label className="flex items-center gap-2 text-sm text-[#1C2434]">
                  <input
                    checked={program.isActive ?? true}
                    disabled={isBusy}
                    type="checkbox"
                    onChange={(event) =>
                      updateProgram(program.id, 'isActive', event.target.checked)
                    }
                  />
                  Show on website
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Field label="Program Name">
                  <input
                    className={inputClass}
                    disabled={isBusy}
                    value={program.title}
                    onChange={(event) => updateProgram(program.id, 'title', event.target.value)}
                  />
                </Field>

                <Field label="Age Range">
                  <input
                    className={inputClass}
                    disabled={isBusy}
                    value={program.age}
                    onChange={(event) => updateProgram(program.id, 'age', event.target.value)}
                  />
                </Field>

                <label className="grid gap-1 text-sm font-medium lg:col-span-2">
                  Description
                  <textarea
                    className="min-h-28 rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm"
                    disabled={isBusy}
                    value={program.description}
                    onChange={(event) =>
                      updateProgram(program.id, 'description', event.target.value)
                    }
                  />
                </label>

                <div className="rounded-lg border border-[#E2E8F0] p-4 lg:col-span-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-[#1C2434]">Program Image</h3>
                      <p className="text-sm text-[#64748B]">
                        {program.image
                          ? 'Image selected from Gallery Library.'
                          : 'No image selected.'}
                      </p>
                    </div>

                    <Button
                      disabled={isBusy}
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() => setAssetPickerProgramId(program.id)}
                    >
                      Choose Image
                    </Button>
                  </div>

                  {program.image ? (
                    <img
                      className="mt-3 aspect-video w-full rounded-lg object-cover"
                      src={adminApi.publicAssetUrl(program.image)}
                      alt={program.imageAlt ?? program.title}
                    />
                  ) : null}
                </div>

                <Field label="Image Description">
                  <input
                    className={inputClass}
                    disabled={isBusy}
                    value={program.imageAlt ?? ''}
                    onChange={(event) => updateProgram(program.id, 'imageAlt', event.target.value)}
                  />
                </Field>

                <Field label="WhatsApp Number">
                  <input
                    className={inputClass}
                    disabled={isBusy}
                    value={program.adminWhatsapp}
                    onChange={(event) =>
                      updateProgram(program.id, 'adminWhatsapp', event.target.value)
                    }
                  />
                </Field>

                <Field label="Explore Button Text">
                  <input
                    className={inputClass}
                    disabled={isBusy}
                    value={program.exploreLabel ?? ''}
                    onChange={(event) =>
                      updateProgram(program.id, 'exploreLabel', event.target.value)
                    }
                  />
                </Field>

                <Field label="WhatsApp Button Text">
                  <input
                    className={inputClass}
                    disabled={isBusy}
                    value={program.contactLabel ?? ''}
                    onChange={(event) =>
                      updateProgram(program.id, 'contactLabel', event.target.value)
                    }
                  />
                </Field>
              </div>
            </section>
          ))}
        </div>
      </section>
    </form>
  );
}
