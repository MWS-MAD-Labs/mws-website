import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Eye, ImagePlus, Pencil, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import {
  adminApi,
  type CampusSpotlightItem,
  type GalleryItem,
  type HeroSlideFormData,
  type NewsCategory,
} from '@/admin/api/adminApi';
import AppShell from '@/admin/components/layout/AppShell';
import Button from '@/admin/components/ui/Button';
import Field from '@/admin/components/ui/Field';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import { uploadImageForPicker } from '@/admin/features/gallery/utils/uploadImageForPicker';
import CoverImagePickerModal from '@/admin/features/news/components/layouts/CoverImagePickerModal';
import type {
  HeroSlideMediaType,
  HeroSlideSourceType,
  ResolvedHeroSlide,
} from '@/features/hero/heroData';
import HeaderHero from './components/layouts/HeaderHero';
import { useToastState } from '@/admin/components/ui/toastContext';

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
  caption: '',
  ctaLabel: '',
  ctaUrl: '',
  description: '',
  isActive: true,
  isLooping: true,
  mediaAlt: '',
  mediaPath: '',
  mediaType: 'IMAGE',
  posterPath: '',
  sortOrder: '0',
  sourceType: 'MANUAL',
  title: '',
};

const heroCtaLinkOptions = [
  { label: 'Default: Admission', value: '' },
  { label: 'Admission', value: '/admission' },
  { label: 'Book a Tour', value: '/book-a-tour' },
  { label: 'Academic', value: '/academic' },
  { label: 'Our School', value: '/our-school' },
  { label: 'News', value: '/news' },
  { label: 'Community Stories', value: '/community-stories' },
  { label: 'Contact', value: '/contact' },
  { label: 'Admission FAQ', value: '/admission/faq' },
  { label: 'Admission Guidelines', value: '/admission/guidelines' },
];

type HomeSettingsForm = {
  infoSectionCategoryIds: string[];
  infoSectionTitle: string;
};

type SpotlightForm = {
  cite: string;
  isActive: boolean;
  sortOrder: string;
  text: string;
};

const emptySpotlightForm: SpotlightForm = {
  cite: '',
  isActive: true,
  sortOrder: '0',
  text: '',
};

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function formFromSlide(slide: ResolvedHeroSlide): FormState {
  return {
    caption: slide.caption ?? '',
    ctaLabel: slide.ctaLabel ?? '',
    ctaUrl: slide.ctaUrl ?? '',
    description: slide.description ?? '',
    isActive: slide.isActive,
    isLooping: slide.isLooping,
    mediaAlt: slide.mediaAlt ?? '',
    mediaPath: slide.mediaPath ?? '',
    mediaType: slide.mediaType ?? 'IMAGE',
    posterPath: slide.posterPath ?? '',
    sortOrder: String(slide.sortOrder),
    sourceType: slide.sourceType,
    title: slide.title ?? '',
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
    ctaLabel: form.ctaLabel.trim() || 'Learn More',
    mediaAlt: form.mediaAlt.trim() || form.title.trim() || 'Home hero slide',
    mediaPath: form.mediaPath,
    mediaType: form.mediaType,
    title: form.title.trim() || 'Untitled home slide',
  };
}

function previewFromSlide(slide: ResolvedHeroSlide): PreviewSlide {
  return {
    caption: slide.caption ?? slide.description ?? '',
    ctaLabel: slide.ctaLabel ?? 'Learn More',
    mediaAlt: slide.mediaAlt ?? slide.title ?? 'Home hero slide',
    mediaPath: slide.mediaPath ?? '',
    mediaType: slide.mediaType ?? 'IMAGE',
    title: slide.title ?? 'Untitled home slide',
  };
}

function slideStatus(slide: ResolvedHeroSlide) {
  if (!slide.isActive) return 'Hidden';
  if (!slide.mediaPath) return 'Needs media';
  if (!slide.title && !slide.caption) return 'Needs copy';
  return 'Ready';
}

function HomeHeroPreview({
  activeSlideCount,
  slide,
}: {
  activeSlideCount: number;
  slide: PreviewSlide;
}) {
  const mediaUrl = slide.mediaPath ? adminApi.publicAssetUrl(slide.mediaPath) : '';

  return (
    <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-[#111]">
      <div className="relative aspect-[16/9] min-h-[360px] overflow-hidden bg-[#181818]">
        {mediaUrl ? (
          slide.mediaType === 'VIDEO' ? (
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
            <h2 className="text-[44px] font-bold leading-[0.98] tracking-normal">{slide.title}</h2>

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
          {Array.from({
            length: Math.max(activeSlideCount, 1),
          }).map((_, index) => (
            <span
              className={[
                'h-1.5 rounded-full bg-white',
                index === 0 ? 'w-8' : 'w-2 opacity-60',
              ].join(' ')}
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
  const [newsCategories, setNewsCategories] = useState<NewsCategory[]>([]);
  const [homeSettings, setHomeSettings] = useState<HomeSettingsForm>({
    infoSectionCategoryIds: [],
    infoSectionTitle: 'Everything you need to know about joining MWS.',
  });
  const [spotlights, setSpotlights] = useState<CampusSpotlightItem[]>([]);
  const [editingSpotlightId, setEditingSpotlightId] = useState<string | null>(null);
  const [spotlightForm, setSpotlightForm] = useState<SpotlightForm>(emptySpotlightForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [message, setMessage] = useToastState<string | null>(null);

  const editingSlide = useMemo(
    () => slides.find((slide) => slide.id === editingId) ?? null,
    [editingId, slides],
  );

  const previewSlide = previewFromForm(form);
  const activeSlideCount = slides.filter((slide) => slide.isActive).length;
  const readySlideCount = slides.filter((slide) => slideStatus(slide) === 'Ready').length;
  const isBusy = isLoading || isSaving || isUploadingImage;

  async function loadSlides() {
    const [nextSlides, nextGalleries, homeContent] = await Promise.all([
      adminApi.heroSlides(),
      adminApi.galleries(),
      adminApi.homeContent(),
    ]);

    setSlides(nextSlides);
    setGalleries(nextGalleries);
    setNewsCategories(homeContent.categories);
    setSpotlights(homeContent.spotlights);
    setHomeSettings({
      infoSectionCategoryIds:
        homeContent.settings.infoSectionCategoryIds ??
        (homeContent.settings.infoSectionCategoryId ? [homeContent.settings.infoSectionCategoryId] : []),
      infoSectionTitle: homeContent.settings.infoSectionTitle,
    });

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
          setMessage(error instanceof Error ? error.message : 'Failed to load hero slides.'),
        )
        .finally(() => setIsLoading(false));
    });
  }, [setMessage]);

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

      setMessage(editingId ? 'Home hero slide updated.' : 'Home hero slide created.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save hero slide.');
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteSlide(id: string) {
    const slide = slides.find((item) => item.id === id);
    const confirmed = window.confirm(
      `Delete "${slide?.title || 'this home hero slide'}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

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

      setMessage('Home hero slide deleted.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete hero slide.');
    } finally {
      setIsSaving(false);
    }
  }

  async function uploadHeroImage(file: File) {
    setIsUploadingImage(true);
    setMessage(null);

    try {
      const uploaded = await uploadImageForPicker({
        caption: form.title || 'Home hero slide',
        fallbackGalleryTitle: 'Home Hero Images',
        file,
        galleries,
      });

      setGalleries(uploaded.galleries);
      setForm((current) => ({
        ...current,
        mediaAlt: uploaded.alt,
        mediaPath: uploaded.path,
        mediaType: 'IMAGE',
        posterPath: '',
      }));
      setMessage('Hero image uploaded. Save slide to publish it.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to upload hero image.');
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function saveHomeSettings() {
    setIsSaving(true);
    setMessage(null);

    try {
      const data = await adminApi.updateHomeContentSettings({
        infoSectionTitle: homeSettings.infoSectionTitle,
        infoSectionCategoryIds: homeSettings.infoSectionCategoryIds,
      });
      setNewsCategories(data.categories);
      setSpotlights(data.spotlights);
      setHomeSettings({
        infoSectionCategoryIds:
          data.settings.infoSectionCategoryIds ??
          (data.settings.infoSectionCategoryId ? [data.settings.infoSectionCategoryId] : []),
        infoSectionTitle: data.settings.infoSectionTitle,
      });
      setMessage('Home info section settings saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save home settings.');
    } finally {
      setIsSaving(false);
    }
  }

  function editSpotlight(spotlight: CampusSpotlightItem) {
    setEditingSpotlightId(spotlight.id);
    setSpotlightForm({
      cite: spotlight.cite,
      isActive: spotlight.isActive,
      sortOrder: String(spotlight.sortOrder),
      text: spotlight.text,
    });
  }

  function startNewSpotlight() {
    setEditingSpotlightId(null);
    setSpotlightForm({
      ...emptySpotlightForm,
      sortOrder: String(spotlights.length),
    });
  }

  async function saveSpotlight(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const payload = {
        cite: spotlightForm.cite,
        isActive: spotlightForm.isActive,
        sortOrder: Number.parseInt(spotlightForm.sortOrder, 10) || 0,
        text: spotlightForm.text,
      };
      if (editingSpotlightId) {
        await adminApi.updateCampusSpotlight(editingSpotlightId, payload);
        setMessage('Campus spotlight updated.');
      } else {
        await adminApi.createCampusSpotlight(payload);
        setMessage('Campus spotlight created.');
      }
      setEditingSpotlightId(null);
      setSpotlightForm(emptySpotlightForm);
      const data = await adminApi.homeContent();
      setSpotlights(data.spotlights);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save campus spotlight.');
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteSpotlight(id: string) {
    const confirmed = window.confirm('Delete this campus spotlight? This action cannot be undone.');
    if (!confirmed) return;

    setIsSaving(true);
    setMessage(null);

    try {
      await adminApi.deleteCampusSpotlight(id);
      if (editingSpotlightId === id) {
        setEditingSpotlightId(null);
        setSpotlightForm(emptySpotlightForm);
      }
      const data = await adminApi.homeContent();
      setSpotlights(data.spotlights);
      setMessage('Campus spotlight deleted.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete campus spotlight.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell title="Home Hero">
      <section className="space-y-5 p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <HeaderHero />

          <Button
            className="inline-flex items-center gap-2"
            disabled={isBusy}
            type="button"
            onClick={startNewSlide}
          >
            <Plus size={16} />
            New Slide
          </Button>
        </div>

        {message ? (
          <div className="rounded-lg border border-[#E2E8F0] bg-white px-5 py-3">
            <StatusMessage>{message}</StatusMessage>
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-5">
            <section className="rounded-lg border border-[#E2E8F0] bg-white p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#1C2434]">
                    <Eye size={16} />
                    Live Preview
                  </div>

                  <p className="mt-1 text-sm text-[#64748B]">
                    {editingSlide ? editingSlide.title || 'Selected slide' : 'Unsaved slide'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-md bg-[#F1F5F9] px-3 py-1.5 text-[#64748B]">
                    {activeSlideCount} Active
                  </span>

                  <span className="rounded-md bg-[#F1F5F9] px-3 py-1.5 text-[#64748B]">
                    {readySlideCount} Ready
                  </span>
                </div>
              </div>

              <HomeHeroPreview activeSlideCount={activeSlideCount} slide={previewSlide} />
            </section>

            <section className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] px-5 py-4">
                <div>
                  <h2 className="text-base font-semibold text-[#1C2434]">Slides</h2>

                  <p className="text-sm text-[#64748B]">{slides.length} total slides</p>
                </div>
              </div>

              <div className="p-4">
                {isLoading ? (
                  <div className="rounded-lg border border-[#E2E8F0] p-6 text-sm text-[#64748B]">
                    Loading hero slides...
                  </div>
                ) : null}

                {!isLoading && !slides.length ? (
                  <div className="rounded-lg border border-dashed border-[#E2E8F0] p-6 text-sm text-[#64748B]">
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
                            'grid w-full gap-3 rounded-lg border p-3 text-left transition-colors md:grid-cols-[96px_minmax(0,1fr)_auto]',
                            isSelected
                              ? 'border-[#3C50E0] bg-[#3C50E0]/5'
                              : 'border-[#E2E8F0] bg-white hover:bg-[#F1F5F9]',
                          ].join(' ')}
                          key={slide.id}
                          type="button"
                          onClick={() => editSlide(slide)}
                        >
                          <div className="h-16 w-24 overflow-hidden rounded-md bg-[#F1F5F9]">
                            {slide.mediaPath ? (
                              preview.mediaType === 'VIDEO' ? (
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
                              <div className="grid h-full place-items-center text-[#64748B]">
                                <ImagePlus size={18} />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-sm font-semibold text-[#1C2434]">
                                {preview.title}
                              </h3>

                              <span
                                className={[
                                  'rounded-md px-2 py-1 text-[11px] font-semibold',
                                  status === 'Ready'
                                    ? 'bg-[#10B981]/10 text-[#047857]'
                                    : status === 'Hidden'
                                      ? 'bg-[#F1F5F9] text-[#64748B]'
                                      : 'bg-[#F59E0B]/10 text-[#D97706]',
                                ].join(' ')}
                              >
                                {status}
                              </span>
                            </div>

                            <p className="mt-1 truncate text-sm text-[#64748B]">
                              {preview.caption || '-'}
                            </p>

                            <p className="mt-1 text-xs text-[#64748B]">
                              {slide.isActive ? 'Visible on website' : 'Hidden from website'}
                            </p>
                          </div>

                          <div className="flex items-center justify-end gap-2">
                            <Pencil size={16} className="text-[#64748B]" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </section>
          </div>

          <form className="h-fit rounded-lg border border-[#E2E8F0] bg-white" onSubmit={saveSlide}>
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E2E8F0] px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-[#1C2434]">
                  {editingSlide ? 'Edit Slide' : 'New Slide'}
                </h2>

                <p className="text-sm text-[#64748B]">
                  {editingSlide
                    ? 'Edit the text, media, and button that visitors see on the homepage.'
                    : 'Add a new slide for the homepage hero carousel.'}
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
              <div className="rounded-lg border border-[#3C50E0]/15 bg-[#F1F5F9] px-4 py-3 text-sm text-[#64748B]">
                This form only controls content visitors can see in the Home hero.
              </div>

              <Field label="Headline">
                <input
                  className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm"
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
              </Field>

              <Field label="Caption">
                <textarea
                  className="min-h-24 rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm"
                  value={form.caption}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      caption: event.target.value,
                    }))
                  }
                />
              </Field>

              <div className="rounded-lg border border-[#E2E8F0] p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#1C2434]">Hero Image or Video</h3>

                    <p className="text-sm text-[#64748B]">
                      {form.mediaPath
                        ? 'Media selected from Gallery Library.'
                        : 'No media selected.'}
                    </p>
                  </div>

                  <Button
                    className="inline-flex items-center gap-2"
                    disabled={isBusy}
                    type="button"
                    variant="outline"
                    onClick={() => setIsImagePickerOpen(true)}
                  >
                    <ImagePlus size={15} />
                    Choose Image
                  </Button>
                  <Button
                    className="inline-flex items-center gap-2"
                    disabled={isBusy}
                    type="button"
                    variant="outline"
                    onClick={() => setIsAssetPickerOpen(true)}
                  >
                    Choose Video
                  </Button>
                </div>

                {form.mediaPath ? (
                  <div className="overflow-hidden rounded-lg bg-[#F1F5F9]">
                    {form.mediaType === 'VIDEO' ? (
                      <video
                        className="aspect-video w-full object-cover"
                        src={adminApi.publicAssetUrl(form.mediaPath)}
                        muted
                      />
                    ) : (
                      <img
                        className="aspect-video w-full object-cover"
                        src={adminApi.publicAssetUrl(form.mediaPath)}
                        alt={form.mediaAlt || 'Hero media'}
                      />
                    )}
                  </div>
                ) : null}
              </div>

              <Field label="Image Description">
                <input
                  className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm"
                  value={form.mediaAlt}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      mediaAlt: event.target.value,
                    }))
                  }
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Button Text">
                  <input
                    className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm"
                    value={form.ctaLabel}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        ctaLabel: event.target.value,
                      }))
                    }
                  />
                </Field>

                <Field label="Button Link">
                  <select
                    className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm"
                    value={form.ctaUrl}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        ctaUrl: event.target.value,
                      }))
                    }
                  >
                    {heroCtaLinkOptions.map((option) => (
                      <option key={option.label} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                    {form.ctaUrl &&
                    !heroCtaLinkOptions.some((option) => option.value === form.ctaUrl) ? (
                      <option value={form.ctaUrl}>Current custom link: {form.ctaUrl}</option>
                    ) : null}
                  </select>
                </Field>
              </div>

              <div className="grid gap-3 rounded-lg border border-[#E2E8F0] p-4 text-sm text-[#1C2434]">
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
                  disabled={isBusy}
                  type="submit"
                >
                  <Save size={15} />
                  {isUploadingImage ? 'Uploading...' : isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </form>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="rounded-lg border border-[#E2E8F0] bg-white">
            <div className="border-b border-[#E2E8F0] px-5 py-4">
              <h2 className="text-base font-semibold text-[#1C2434]">Info Section</h2>
              <p className="mt-1 text-sm text-[#64748B]">
                Choose the News category used by the Home information cards.
              </p>
            </div>
            <div className="grid gap-4 p-5">
              <Field label="Section title">
                <input
                  className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm"
                  disabled={isBusy}
                  value={homeSettings.infoSectionTitle}
                  onChange={(event) =>
                    setHomeSettings((current) => ({
                      ...current,
                      infoSectionTitle: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field as="div" label="News categories">
                <div className="grid gap-2 rounded-lg border border-[#E2E8F0] p-3">
                  <p className="text-xs text-[#64748B]">
                    Choose up to 5 categories. Public Home will show these as Info Section tabs.
                  </p>
                  {newsCategories.map((category) => {
                    const isSelected = homeSettings.infoSectionCategoryIds.includes(category.id);
                    const isLimitReached =
                      !isSelected && homeSettings.infoSectionCategoryIds.length >= 5;

                    return (
                      <label
                        className={[
                          'flex items-center gap-2 text-sm',
                          isLimitReached ? 'text-[#94A3B8]' : 'text-[#1C2434]',
                        ].join(' ')}
                        key={category.id}
                      >
                        <input
                          checked={isSelected}
                          disabled={isBusy || isLimitReached}
                          type="checkbox"
                          onChange={(event) =>
                            setHomeSettings((current) => {
                              if (event.target.checked) {
                                return {
                                  ...current,
                                  infoSectionCategoryIds: [
                                    ...current.infoSectionCategoryIds,
                                    category.id,
                                  ].slice(0, 5),
                                };
                              }

                              return {
                                ...current,
                                infoSectionCategoryIds: current.infoSectionCategoryIds.filter(
                                  (categoryId) => categoryId !== category.id,
                                ),
                              };
                            })
                          }
                        />
                        <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                          <span className="truncate">
                            {category.name}
                            {category.isActive ? '' : ' (inactive)'}
                          </span>
                          <span className="shrink-0 rounded-md bg-[#F1F5F9] px-2 py-0.5 text-xs font-semibold text-[#64748B]">
                            {category._count?.posts ?? 0}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                  <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-2 text-xs text-[#64748B]">
                    <span>{homeSettings.infoSectionCategoryIds.length}/5 selected</span>
                    {homeSettings.infoSectionCategoryIds.length ? (
                      <button
                        className="font-semibold text-[#3C50E0]"
                        disabled={isBusy}
                        type="button"
                        onClick={() =>
                          setHomeSettings((current) => ({
                            ...current,
                            infoSectionCategoryIds: [],
                          }))
                        }
                      >
                        Use default cards
                      </button>
                    ) : null}
                  </div>
                </div>
              </Field>
              <div className="flex justify-end">
                <Button disabled={isBusy} type="button" onClick={() => void saveHomeSettings()}>
                  {isSaving ? 'Saving...' : 'Save Info Section'}
                </Button>
              </div>
            </div>
          </section>

          <form className="rounded-lg border border-[#E2E8F0] bg-white" onSubmit={saveSpotlight}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-[#1C2434]">Campus Spotlight</h2>
                <p className="mt-1 text-sm text-[#64748B]">
                  Text-only spotlight content shown on Home.
                </p>
              </div>
              <Button disabled={isBusy} size="sm" type="button" variant="outline" onClick={startNewSpotlight}>
                <Plus size={15} />
                New
              </Button>
            </div>
            <div className="grid gap-4 p-5">
              <Field label="Text">
                <textarea
                  className="min-h-24 rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm"
                  disabled={isBusy}
                  required
                  value={spotlightForm.text}
                  onChange={(event) =>
                    setSpotlightForm((current) => ({
                      ...current,
                      text: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Cite">
                <input
                  className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm"
                  disabled={isBusy}
                  required
                  value={spotlightForm.cite}
                  onChange={(event) =>
                    setSpotlightForm((current) => ({
                      ...current,
                      cite: event.target.value,
                    }))
                  }
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Sort order">
                  <input
                    className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm"
                    disabled={isBusy}
                    type="number"
                    value={spotlightForm.sortOrder}
                    onChange={(event) =>
                      setSpotlightForm((current) => ({
                        ...current,
                        sortOrder: event.target.value,
                      }))
                    }
                  />
                </Field>
                <label className="mt-6 flex items-center gap-2 text-sm text-[#1C2434]">
                  <input
                    checked={spotlightForm.isActive}
                    disabled={isBusy}
                    type="checkbox"
                    onChange={(event) =>
                      setSpotlightForm((current) => ({
                        ...current,
                        isActive: event.target.checked,
                      }))
                    }
                  />
                  Active
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <Button disabled={isBusy} type="submit">
                  {isSaving ? 'Saving...' : editingSpotlightId ? 'Update Spotlight' : 'Create Spotlight'}
                </Button>
              </div>
            </div>
          </form>
        </div>

        <section className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
          <div className="border-b border-[#E2E8F0] px-5 py-4">
            <h2 className="text-base font-semibold text-[#1C2434]">Campus Spotlight List</h2>
          </div>
          {!spotlights.length ? (
            <div className="p-5 text-sm text-[#64748B]">No campus spotlight content yet.</div>
          ) : (
            <div className="divide-y divide-[#E2E8F0]">
              {spotlights.map((spotlight) => (
                <div
                  key={spotlight.id}
                  className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_120px_150px] md:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#1C2434]">
                      {spotlight.cite}
                    </p>
                    <p className="truncate text-sm text-[#64748B]">{spotlight.text}</p>
                  </div>
                  <span className="text-sm text-[#64748B]">
                    {spotlight.isActive ? 'Active' : 'Hidden'}
                  </span>
                  <div className="flex justify-end gap-2">
                    <Button
                      disabled={isBusy}
                      size="sm"
                      type="button"
                      variant="danger"
                      onClick={() => void deleteSpotlight(spotlight.id)}
                    >
                      Delete
                    </Button>
                    <Button
                      disabled={isBusy}
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() => editSpotlight(spotlight)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <CoverImagePickerModal
          galleries={galleries}
          open={isImagePickerOpen}
          title="Choose Hero Image"
          onClose={() => setIsImagePickerOpen(false)}
          onSelect={(asset) =>
            setForm((current) => ({
              ...current,
              mediaAlt: asset.alt,
              mediaPath: asset.path,
              mediaType: 'IMAGE',
              posterPath: '',
            }))
          }
          onSelectLocalFile={(file) => void uploadHeroImage(file)}
        />
        <CoverImagePickerModal
          allowUpload={false}
          allowedKinds={['VIDEO']}
          galleries={galleries}
          open={isAssetPickerOpen}
          title="Choose Hero Video"
          onClose={() => setIsAssetPickerOpen(false)}
          onSelect={(asset) =>
            setForm((current) => ({
              ...current,
              mediaAlt: asset.alt,
              mediaPath: asset.path,
              mediaType: 'VIDEO',
            }))
          }
        />
      </section>
    </AppShell>
  );
}
