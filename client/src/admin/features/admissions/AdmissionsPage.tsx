import { useEffect, useState, type FormEvent } from "react";
import {
  adminApi,
  type AdminAdmissionProgram,
  type GalleryItem,
} from "@/admin/api/adminApi";
import AppShell from "@/admin/components/layout/AppShell";
import Button from "@/admin/components/ui/Button";
import Field from "@/admin/components/ui/Field";
import StatusMessage from "@/admin/components/ui/StatusMessage";
import GalleryAssetPickerModal from "@/admin/features/gallery/components/GalleryAssetPickerModal";

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : "";
}

function updateProgramField(
  programs: AdminAdmissionProgram[],
  id: string,
  field: keyof AdminAdmissionProgram,
  value: string | boolean | null,
) {
  return programs.map((program) =>
    program.id === id ? { ...program, [field]: value } : program,
  );
}

export default function AdmissionsPage() {
  const [programs, setPrograms] = useState<AdminAdmissionProgram[]>([]);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [assetPickerProgramId, setAssetPickerProgramId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadAdmissions() {
    const data = await adminApi.admissions();
    setPrograms(data.programs);
    setGalleries(data.galleries);
  }

  useEffect(() => {
    queueMicrotask(() => {
      loadAdmissions()
        .catch((error) =>
          setMessage(error instanceof Error ? error.message : "Failed to load admissions."),
        )
        .finally(() => setIsLoading(false));
    });
  }, []);

  async function saveAdmissions(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const data = await adminApi.updateAdmissions(
        programs.map((program, index) => ({
          ...program,
          age: optionalText(program.age),
          adminWhatsapp: optionalText(program.adminWhatsapp),
          contactLabel: optionalText(program.contactLabel ?? ""),
          description: optionalText(program.description),
          exploreLabel: optionalText(program.exploreLabel ?? ""),
          image: optionalText(program.image),
          imageAlt: optionalText(program.imageAlt ?? ""),
          path: optionalText(program.path),
          sortOrder: program.sortOrder ?? index,
          isActive: program.isActive ?? true,
        })),
      );
      setPrograms(data.programs);
      setMessage("Admissions content updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save admissions.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell title="Admissions">
      <section className="space-y-5 p-6">
        <p className="text-sm text-gray-500">Programs / Admissions</p>

        <form
          className="overflow-hidden rounded-lg border border-gray-200 bg-white"
          onSubmit={saveAdmissions}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Admissions by Level
              </h1>
              <p className="text-sm text-gray-500">
                Maintain the program cards shown on the public Admissions page.
              </p>
            </div>
            <Button disabled={isSaving || isLoading} type="submit">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          {message ? (
            <div className="border-b border-gray-200 bg-[#faf8f3] px-5 py-3">
              <StatusMessage>{message}</StatusMessage>
            </div>
          ) : null}

          <div className="grid gap-4 p-5">
            <div className="rounded-lg border border-[#7e1518]/15 bg-[#faf8f3] px-4 py-3 text-sm text-[#625759]">
              Edit the visible title, age range, description, image, and WhatsApp contact for each admissions card.
            </div>

            {isLoading ? (
              <div className="rounded-lg border border-gray-200 p-6 text-sm text-gray-500">
                Loading admissions...
              </div>
            ) : null}

            {!isLoading && !programs.length ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-6 text-sm text-gray-500">
                No admission programs found.
              </div>
            ) : null}

            {programs.map((program, index) => (
              <section
                className="rounded-lg border border-gray-200 p-4"
                key={program.id}
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      {program.title || `Program ${index + 1}`}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Public admissions card content.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      checked={program.isActive ?? true}
                      type="checkbox"
                      onChange={(event) =>
                        setPrograms((current) =>
                          updateProgramField(
                            current,
                            program.id,
                            "isActive",
                            event.target.checked,
                          ),
                        )
                      }
                    />
                    Show on website
                  </label>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Field label="Program Name">
                    <input
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      value={program.title}
                      onChange={(event) =>
                        setPrograms((current) =>
                          updateProgramField(
                            current,
                            program.id,
                            "title",
                            event.target.value,
                          ),
                        )
                      }
                    />
                  </Field>
                  <Field label="Age Range">
                    <input
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      value={program.age}
                      onChange={(event) =>
                        setPrograms((current) =>
                          updateProgramField(
                            current,
                            program.id,
                            "age",
                            event.target.value,
                          ),
                        )
                      }
                    />
                  </Field>
                  <div className="rounded-lg border border-gray-200 p-4 lg:col-span-2">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Program Image
                        </h3>
                        <p className="text-sm text-gray-500">
                          {program.image ? "Image selected from Gallery Library." : "No image selected."}
                        </p>
                      </div>
                      <Button
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
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      value={program.imageAlt ?? ""}
                      onChange={(event) =>
                        setPrograms((current) =>
                          updateProgramField(
                            current,
                            program.id,
                            "imageAlt",
                            event.target.value,
                          ),
                        )
                      }
                    />
                  </Field>
                  <Field label="WhatsApp Number">
                    <input
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      value={program.adminWhatsapp}
                      onChange={(event) =>
                        setPrograms((current) =>
                          updateProgramField(
                            current,
                            program.id,
                            "adminWhatsapp",
                            event.target.value,
                          ),
                        )
                      }
                    />
                  </Field>
                  <Field label="Explore Button Text">
                    <input
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      value={program.exploreLabel ?? ""}
                      onChange={(event) =>
                        setPrograms((current) =>
                          updateProgramField(
                            current,
                            program.id,
                            "exploreLabel",
                            event.target.value,
                          ),
                        )
                      }
                    />
                  </Field>
                  <Field label="WhatsApp Button Text">
                    <input
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      value={program.contactLabel ?? ""}
                      onChange={(event) =>
                        setPrograms((current) =>
                          updateProgramField(
                            current,
                            program.id,
                            "contactLabel",
                            event.target.value,
                          ),
                        )
                      }
                    />
                  </Field>
                  <label className="grid gap-1 text-sm font-medium lg:col-span-2">
                    Description
                    <textarea
                      className="min-h-28 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      value={program.description}
                      onChange={(event) =>
                        setPrograms((current) =>
                          updateProgramField(
                            current,
                            program.id,
                            "description",
                            event.target.value,
                          ),
                        )
                      }
                    />
                  </label>
                </div>
              </section>
            ))}
          </div>
        </form>
        <GalleryAssetPickerModal
          allowedKinds={["IMAGE"]}
          galleries={galleries}
          initialGalleryId={
            programs.find((program) => program.id === assetPickerProgramId)?.galleryId ??
            null
          }
          open={assetPickerProgramId !== null}
          title="Choose Program Image"
          onClose={() => setAssetPickerProgramId(null)}
          onSelect={(asset) =>
            setPrograms((current) =>
              current.map((program) =>
                program.id === assetPickerProgramId
                  ? {
                      ...program,
                      galleryId: asset.galleryId,
                      image: asset.path,
                      imageAlt: asset.alt,
                    }
                  : program,
              ),
            )
          }
        />
      </section>
    </AppShell>
  );
}
