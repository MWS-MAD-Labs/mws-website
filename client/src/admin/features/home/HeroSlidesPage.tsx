import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Eye,
  ImagePlus,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import {
  adminApi,
  type GalleryItem,
  type HeroSlideFormData,
} from "@/admin/api/adminApi";
import AppShell from "@/admin/components/layout/AppShell";
import Button from "@/admin/components/ui/Button";
import Field from "@/admin/components/ui/Field";
import StatusMessage from "@/admin/components/ui/StatusMessage";
import GalleryAssetPickerModal from "@/admin/features/gallery/components/GalleryAssetPickerModal";
import type {
  HeroSlideMediaType,
  HeroSlideSourceType,
  ResolvedHeroSlide,
} from "@/features/hero/heroData";

type FormState = {
  caption: string;
  ctaLabel: string;
  ctaUrl: string;
  description: string;
  isActive: boolean;
  isLooping: boolean;
  mediaAlt: string;
  mediaPath: string;
  mediaType: HeroSlideMediaType;
  posterPath: string;
  sortOrder: string;
  sourceType: HeroSlideSourceType;
  title: string;
};

type PreviewSlide = {
  caption: string;
  ctaLabel: string;
  mediaAlt: string;
  mediaPath: string;
  mediaType: HeroSlideMediaType;
  title: string;
};

const emptyForm: FormState = {
  caption: "",
  ctaLabel: "",
  ctaUrl: "",
  description: "",
  isActive: true,
  isLooping: true,
  mediaAlt: "",
  mediaPath: "",
  mediaType: "IMAGE",
  posterPath: "",
  sortOrder: "0",
  sourceType: "MANUAL",
  title: "",
};

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function formFromSlide(slide: ResolvedHeroSlide): FormState {
  return {
    caption: slide.caption ?? "",
    ctaLabel: slide.ctaLabel ?? "",
    ctaUrl: slide.ctaUrl ?? "",
    description: slide.description ?? "",
    isActive: slide.isActive,
    isLooping: slide.isLooping,
    mediaAlt: slide.mediaAlt ?? "",
    mediaPath: slide.mediaPath ?? "",
    mediaType: slide.mediaType ?? "IMAGE",
    posterPath: slide.posterPath ?? "",
    sortOrder: String(slide.sortOrder),
    sourceType: slide.sourceType,
    title: slide.title ?? "",
  };
}

function payloadFromForm(form: FormState): HeroSlideFormData {
  return {
    caption: optionalText(form.caption),
    ctaLabel: optionalText(form.ctaLabel),
    ctaUrl: optionalText(form.ctaUrl),
    description: optionalText(form.description),
    isActive: form.isActive,
    isLooping: form.isLooping,
    mediaAlt: optionalText(form.mediaAlt),
    mediaPath: optionalText(form.mediaPath),
    mediaType: form.mediaType,
    posterPath: optionalText(form.posterPath),
    sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
    sourceType: form.sourceType,
    title: optionalText(form.title),
  };
}

function previewFromForm(form: FormState): PreviewSlide {
  return {
    caption: form.caption.trim() || form.description.trim(),
    ctaLabel: form.ctaLabel.trim() || "Learn More",
    mediaAlt: form.mediaAlt.trim() || form.title.trim() || "Home hero slide",
    mediaPath: form.mediaPath,
    mediaType: form.mediaType,
    title: form.title.trim() || "Untitled home slide",
  };
}

function previewFromSlide(slide: ResolvedHeroSlide): PreviewSlide {
  return {
    caption: slide.caption ?? slide.description ?? "",
    ctaLabel: slide.ctaLabel ?? "Learn More",
    mediaAlt: slide.mediaAlt ?? slide.title ?? "Home hero slide",
    mediaPath: slide.mediaPath ?? "",
    mediaType: slide.mediaType ?? "IMAGE",
    title: slide.title ?? "Untitled home slide",
  };
}

function slideStatus(slide: ResolvedHeroSlide) {
  if (!slide.isActive) return "Hidden";
  if (!slide.mediaPath) return "Needs media";
  if (!slide.title && !slide.caption) return "Needs copy";
  return "Ready";
}

function HomeHeroPreview({
  activeSlideCount,
  slide,
}: {
  activeSlideCount: number;
  slide: PreviewSlide;
}) {
  const mediaUrl = slide.mediaPath ? adminApi.publicAssetUrl(slide.mediaPath) : "";

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-[#111]">
      <div className="relative aspect-[16/9] min-h-[360px] overflow-hidden bg-[#181818]">
        {mediaUrl ? (
          slide.mediaType === "VIDEO" ? (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={mediaUrl}
              muted
              playsInline
            />
          ) : (
            <img
              className="absolute inset-0 h-full w-full object-cover"
              src={mediaUrl}
              alt={slide.mediaAlt}
            />
          )
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-[#2b2525] text-sm font-semibold text-white/70">
            No hero media selected
          </div>
        )}

        <div className="absolute inset-0 bg-black/25" />

        <button
          aria-label="Previous slide preview"
          className="absolute left-6 top-1/2 z-20 -translate-y-1/2 text-xl text-white/90"
          type="button"
        >
          ←
        </button>
        <button
          aria-label="Next slide preview"
          className="absolute right-6 top-1/2 z-20 -translate-y-1/2 text-xl text-white/90"
          type="button"
        >
          →
        </button>

        <div className="absolute inset-x-0 bottom-0 z-10 px-10 pb-10 text-white">
          <div className="max-w-[560px]">
            <h2 className="text-[44px] font-bold leading-[0.98] tracking-normal">
              {slide.title}
            </h2>
            {slide.caption ? (
              <p className="mt-5 max-w-[480px] text-sm leading-relaxed text-white/90">
                {slide.caption}
              </p>
            ) : null}
            <div className="mt-6 inline-flex items-center gap-3 text-sm font-medium text-white">
              {slide.ctaLabel}
              <span aria-hidden="true">→</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-7 right-8 z-20 flex items-center gap-2">
          {Array.from({ length: Math.max(activeSlideCount, 1) }).map((_, index) => (
            <span
              className={[
                "h-1.5 rounded-full bg-white",
                index === 0 ? "w-8" : "w-2 opacity-60",
              ].join(" ")}
              key={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HeroSlidesPage() {
  const [slides, setSlides] = useState<ResolvedHeroSlide[]>([]);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const editingSlide = useMemo(
    () => slides.find((slide) => slide.id === editingId) ?? null,
    [editingId, slides],
  );
  const previewSlide = previewFromForm(form);
  const activeSlideCount = slides.filter((slide) => slide.isActive).length;
  const readySlideCount = slides.filter((slide) => slideStatus(slide) === "Ready").length;

  async function loadSlides() {
    const [nextSlides, nextGalleries] = await Promise.all([
      adminApi.heroSlides(),
      adminApi.galleries(),
    ]);
    setSlides(nextSlides);
    setGalleries(nextGalleries);
    return nextSlides;
  }

  useEffect(() => {
    queueMicrotask(() => {
      loadSlides()
        .then((nextSlides) => {
          const firstSlide = nextSlides[0];
          if (!firstSlide) return;
          setEditingId(firstSlide.id);
          setForm(formFromSlide(firstSlide));
        })
        .catch((error) =>
          setMessage(error instanceof Error ? error.message : "Failed to load hero slides."),
        )
        .finally(() => setIsLoading(false));
    });
  }, []);

  function startNewSlide() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      sortOrder: String(slides.length),
    });
  }

  function editSlide(slide: ResolvedHeroSlide) {
    setEditingId(slide.id);
    setForm(formFromSlide(slide));
  }

  async function saveSlide(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const savedSlide = editingId
        ? await adminApi.updateHeroSlide(editingId, payloadFromForm(form))
        : await adminApi.createHeroSlide(payloadFromForm(form));

      setEditingId(savedSlide.id);
      setForm(formFromSlide(savedSlide));
      await loadSlides();
      setMessage(editingId ? "Home hero slide updated." : "Home hero slide created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save hero slide.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteSlide(id: string) {
    setIsSaving(true);
    setMessage(null);

    try {
      await adminApi.deleteHeroSlide(id);
      const nextSlides = await loadSlides();
      const nextSelected = nextSlides.find((slide) => slide.id !== id) ?? nextSlides[0];
      if (nextSelected) {
        setEditingId(nextSelected.id);
        setForm(formFromSlide(nextSelected));
      } else {
        setEditingId(null);
        setForm(emptyForm);
      }
      setMessage("Home hero slide deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to delete hero slide.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell title="Home Hero">
      <section className="space-y-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Content / Home</p>
            <h1 className="mt-1 text-xl font-semibold text-gray-900">
              Hero Carousel
            </h1>
          </div>
          <Button
            className="inline-flex items-center gap-2"
            type="button"
            onClick={startNewSlide}
          >
            <Plus size={16} />
            New Slide
          </Button>
        </div>

        {message ? (
          <div className="rounded-lg border border-gray-200 bg-white px-5 py-3">
            <StatusMessage>{message}</StatusMessage>
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-5">
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <Eye size={16} />
                    Live Preview
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {editingSlide ? editingSlide.title || "Selected slide" : "Unsaved slide"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-md bg-[#faf8f3] px-3 py-1.5 text-[#625759]">
                    {activeSlideCount} Active
                  </span>
                  <span className="rounded-md bg-[#faf8f3] px-3 py-1.5 text-[#625759]">
                    {readySlideCount} Ready
                  </span>
                </div>
              </div>

              <HomeHeroPreview
                activeSlideCount={activeSlideCount}
                slide={previewSlide}
              />
            </section>

            <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    Slides
                  </h2>
                  <p className="text-sm text-gray-500">
                    {slides.length} total slides
                  </p>
                </div>
              </div>

              <div className="p-4">
                {isLoading ? (
                  <div className="rounded-lg border border-gray-200 p-6 text-sm text-gray-500">
                    Loading hero slides...
                  </div>
                ) : null}

                {!isLoading && !slides.length ? (
                  <div className="rounded-lg border border-dashed border-gray-200 p-6 text-sm text-gray-500">
                    No hero slides yet.
                  </div>
                ) : null}

                {slides.length ? (
                  <div className="grid gap-3">
                    {slides.map((slide) => {
                      const isSelected = slide.id === editingId;
                      const status = slideStatus(slide);
                      const preview = previewFromSlide(slide);

                      return (
                        <button
                          className={[
                            "grid w-full gap-3 rounded-lg border p-3 text-left transition-colors md:grid-cols-[96px_minmax(0,1fr)_auto]",
                            isSelected
                              ? "border-[#7e1518] bg-[#7e1518]/5"
                              : "border-gray-200 bg-white hover:bg-gray-50",
                          ].join(" ")}
                          key={slide.id}
                          type="button"
                          onClick={() => editSlide(slide)}
                        >
                          <div className="h-16 w-24 overflow-hidden rounded-md bg-gray-100">
                            {slide.mediaPath ? (
                              preview.mediaType === "VIDEO" ? (
                                <video
                                  className="h-full w-full object-cover"
                                  src={adminApi.publicAssetUrl(slide.mediaPath)}
                                  muted
                                />
                              ) : (
                                <img
                                  className="h-full w-full object-cover"
                                  src={adminApi.publicAssetUrl(slide.mediaPath)}
                                  alt={preview.mediaAlt}
                                />
                              )
                            ) : (
                              <div className="grid h-full place-items-center text-gray-400">
                                <ImagePlus size={18} />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-sm font-semibold text-gray-900">
                                {preview.title}
                              </h3>
                              <span
                                className={[
                                  "rounded-md px-2 py-1 text-[11px] font-semibold",
                                  status === "Ready"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : status === "Hidden"
                                      ? "bg-gray-100 text-gray-500"
                                      : "bg-amber-50 text-amber-700",
                                ].join(" ")}
                              >
                                {status}
                              </span>
                            </div>
                            <p className="mt-1 truncate text-sm text-gray-500">
                              {preview.caption || "-"}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {slide.isActive ? "Visible on website" : "Hidden from website"}
                            </p>
                          </div>

                          <div className="flex items-center justify-end gap-2">
                            <Pencil size={16} className="text-gray-400" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </section>
          </div>

          <form
            className="h-fit rounded-lg border border-gray-200 bg-white"
            onSubmit={saveSlide}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {editingSlide ? "Edit Slide" : "New Slide"}
                </h2>
                <p className="text-sm text-gray-500">
                  {editingSlide
                    ? "Edit the text, media, and button that visitors see on the homepage."
                    : "Add a new slide for the homepage hero carousel."}
                </p>
              </div>
              {editingSlide ? (
                <Button
                  className="inline-flex items-center gap-1.5"
                  disabled={isSaving}
                  size="sm"
                  type="button"
                  variant="danger"
                  onClick={() => deleteSlide(editingSlide.id)}
                >
                  <Trash2 size={14} />
                  Delete
                </Button>
              ) : null}
            </div>

            <div className="grid gap-4 p-5">
              <div className="rounded-lg border border-[#7e1518]/15 bg-[#faf8f3] px-4 py-3 text-sm text-[#625759]">
                This form only controls content visitors can see in the Home hero.
              </div>

              <Field label="Headline">
                <input
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                />
              </Field>

              <Field label="Caption">
                <textarea
                  className="min-h-24 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.caption}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, caption: event.target.value }))
                  }
                />
              </Field>

              <div className="rounded-lg border border-gray-200 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Hero Image or Video
                    </h3>
                    <p className="text-sm text-gray-500">
                      {form.mediaPath ? "Media selected from Gallery Library." : "No media selected."}
                    </p>
                  </div>
                  <Button
                    className="inline-flex items-center gap-2"
                    type="button"
                    variant="outline"
                    onClick={() => setIsAssetPickerOpen(true)}
                  >
                    <ImagePlus size={15} />
                    Choose
                  </Button>
                </div>

                {form.mediaPath ? (
                  <div className="overflow-hidden rounded-lg bg-gray-100">
                    {form.mediaType === "VIDEO" ? (
                      <video
                        className="aspect-video w-full object-cover"
                        src={adminApi.publicAssetUrl(form.mediaPath)}
                        muted
                      />
                    ) : (
                      <img
                        className="aspect-video w-full object-cover"
                        src={adminApi.publicAssetUrl(form.mediaPath)}
                        alt={form.mediaAlt || "Hero media"}
                      />
                    )}
                  </div>
                ) : null}
              </div>

              <Field label="Image Description">
                <input
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.mediaAlt}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, mediaAlt: event.target.value }))
                  }
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Button Text">
                  <input
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    value={form.ctaLabel}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        ctaLabel: event.target.value,
                      }))
                    }
                  />
                </Field>
              </div>

              <div className="grid gap-3 rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
                <label className="flex items-center justify-between gap-3">
                  <span>Show this slide on website</span>
                  <input
                    checked={form.isActive}
                    type="checkbox"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        isActive: event.target.checked,
                      }))
                    }
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  className="inline-flex items-center gap-2"
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    if (editingSlide) {
                      setForm(formFromSlide(editingSlide));
                      return;
                    }
                    startNewSlide();
                  }}
                >
                  <RotateCcw size={15} />
                  Reset
                </Button>
                <Button
                  className="inline-flex items-center gap-2"
                  disabled={isSaving}
                  type="submit"
                >
                  <Save size={15} />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </form>
        </div>

        <GalleryAssetPickerModal
          galleries={galleries}
          open={isAssetPickerOpen}
          title="Choose Hero Media"
          onClose={() => setIsAssetPickerOpen(false)}
          onSelect={(asset) =>
            setForm((current) => ({
              ...current,
              mediaAlt: asset.alt,
              mediaPath: asset.path,
              mediaType: asset.kind,
            }))
          }
        />
      </section>
    </AppShell>
  );
}
