import { useEffect, useState, type FormEvent } from 'react';
import { ImagePlus, Save, Trash2, Video } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi, type GalleryItem } from '@/admin/api/adminApi';
import AppShell from '@/admin/components/layout/AppShell';
import Button from '@/admin/components/ui/Button';
import Field from '@/admin/components/ui/Field';
import { useToastState } from '@/admin/components/ui/toastContext';
import { uploadImageForPicker } from '@/admin/features/gallery/utils/uploadImageForPicker';
import { uploadVideoForPicker } from '@/admin/features/gallery/utils/uploadVideoForPicker';
import CoverImagePickerModal from '@/admin/features/news/components/layouts/CoverImagePickerModal';
import NewsEditorMessage from '@/admin/features/news/components/layouts/NewsEditorMessage';
import { useUnsavedChangesGuard } from '@/admin/hooks/useUnsavedChangesGuard';
import HeroEditorHeader from './components/layouts/HeroEditorHeader';
import {
  HERO_CTA_LINK_OPTIONS,
  HERO_SLIDES_PATH,
  createEmptyHeroSlideForm,
  heroSlideFormFromSlide,
  heroSlidePayloadFromForm,
  nextHeroSlideSortOrder,
  type HeroSlideForm,
  type HeroSlidesReturnState,
} from './heroSlideForm';

const inputClass =
  'w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#1C2434] outline-none focus:border-[#3C50E0]';

export default function HeroSlideEditorPage() {
  const navigate = useNavigate();
  const { slideId } = useParams<{ slideId: string }>();
  const isEditing = Boolean(slideId);

  const [form, setForm] = useState<HeroSlideForm>(() => createEmptyHeroSlideForm());
  const [savedForm, setSavedForm] = useState<HeroSlideForm>(() => createEmptyHeroSlideForm());
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [isVideoPickerOpen, setIsVideoPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [message, setMessage] = useToastState<string | null>(null);

  const isBusy = isLoading || isSaving || isDeleting || isUploadingImage || isUploadingVideo;
  const hasUnsavedChanges =
    !isLoading && !notFound && JSON.stringify(form) !== JSON.stringify(savedForm);

  useUnsavedChangesGuard(hasUnsavedChanges && !isSaving && !isDeleting);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      Promise.all([adminApi.heroSlides(), adminApi.galleries()])
        .then(([slides, nextGalleries]) => {
          if (cancelled) return;

          setGalleries(nextGalleries);

          if (!slideId) {
            const emptyForm = createEmptyHeroSlideForm(nextHeroSlideSortOrder(slides));
            setForm(emptyForm);
            setSavedForm(emptyForm);
            return;
          }

          const slide = slides.find((item) => item.id === slideId);

          if (!slide) {
            setNotFound(true);
            return;
          }

          const loadedForm = heroSlideFormFromSlide(slide);
          setForm(loadedForm);
          setSavedForm(loadedForm);
        })
        .catch((error) => {
          if (cancelled) return;
          setMessage(error instanceof Error ? error.message : 'Failed to load hero slide.');
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [setMessage, slideId]);

  function updateField<Key extends keyof HeroSlideForm>(key: Key, value: HeroSlideForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function returnToList(returnMessage?: string) {
    const state: HeroSlidesReturnState = returnMessage ? { message: returnMessage } : null;
    navigate(HERO_SLIDES_PATH, { state });
  }

  function handleClose() {
    if (
      hasUnsavedChanges &&
      !window.confirm('You have unsaved changes. Leave this page and discard them?')
    ) {
      return;
    }

    returnToList();
  }

  async function saveSlide(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const payload = heroSlidePayloadFromForm(form);

      if (slideId) {
        await adminApi.updateHeroSlide(slideId, payload);
      } else {
        await adminApi.createHeroSlide(payload);
      }

      setSavedForm(form);
      returnToList(slideId ? 'Home hero slide updated.' : 'Home hero slide created.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save hero slide.');
      setIsSaving(false);
    }
  }

  async function deleteSlide() {
    if (!slideId) return;

    const confirmed = window.confirm(
      `Delete "${form.title || 'this home hero slide'}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setMessage(null);

    try {
      await adminApi.deleteHeroSlide(slideId);
      returnToList('Home hero slide deleted.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete hero slide.');
      setIsDeleting(false);
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

  async function uploadHeroVideo(file: File) {
    setIsUploadingVideo(true);
    setMessage(null);

    try {
      const uploaded = await uploadVideoForPicker({
        caption: form.title || 'Home hero slide',
        fallbackGalleryTitle: 'Home Hero Videos',
        file,
        galleries,
      });

      setGalleries(uploaded.galleries);
      setForm((current) => ({
        ...current,
        mediaAlt: uploaded.alt,
        mediaPath: uploaded.path,
        mediaType: 'VIDEO',
      }));
      setMessage('Hero video uploaded. Save slide to publish it.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to upload hero video.');
    } finally {
      setIsUploadingVideo(false);
    }
  }

  const hasCustomCtaUrl =
    Boolean(form.ctaUrl) && !HERO_CTA_LINK_OPTIONS.some((option) => option.value === form.ctaUrl);

  return (
    <AppShell title={isEditing ? 'Edit Hero Slide' : 'Create Hero Slide'}>
      <section className="w-full space-y-5 p-6">
        <HeroEditorHeader
          backLabel="Back to hero slides"
          breadcrumb={isEditing ? 'Edit Slide' : 'Create Slide'}
          title={isEditing ? 'Edit hero slide' : 'Create a hero slide'}
          description={
            isEditing
              ? 'Edit the text, media, and button that visitors see on the homepage.'
              : 'Add a new slide for the homepage hero carousel.'
          }
          onClose={handleClose}
        />

        <NewsEditorMessage message={message} />

        {isLoading ? (
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]">
            Loading hero slide...
          </div>
        ) : notFound ? (
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-8 text-center">
            <p className="font-medium text-[#1C2434]">Hero slide not found.</p>
            <p className="mt-1 text-sm text-[#64748B]">It may have been deleted.</p>
            <Button className="mt-4" type="button" variant="outline" onClick={() => returnToList()}>
              Back to hero slides
            </Button>
          </div>
        ) : (
          <form
            className="w-full overflow-hidden rounded-lg border border-[#E2E8F0] bg-white"
            onSubmit={saveSlide}
          >
            <div className="border-b border-[#E2E8F0] px-5 py-4">
              <h2 className="text-base font-semibold text-[#1C2434]">Slide</h2>
              <p className="mt-1 text-sm text-[#64748B]">
                This form only controls content visitors can see in the Home hero.
              </p>
            </div>

            <div className="grid gap-5 p-5">
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

                  <div className="flex flex-wrap gap-2">
                    <Button
                      className="inline-flex items-center gap-2"
                      disabled={isBusy}
                      type="button"
                      variant="outline"
                      onClick={() => setIsImagePickerOpen(true)}
                    >
                      <ImagePlus size={15} />
                      {isUploadingImage ? 'Uploading...' : 'Choose Image'}
                    </Button>
                    <Button
                      className="inline-flex items-center gap-2"
                      disabled={isBusy}
                      type="button"
                      variant="outline"
                      onClick={() => setIsVideoPickerOpen(true)}
                    >
                      <Video size={15} />
                      {isUploadingVideo ? 'Uploading...' : 'Choose Video'}
                    </Button>
                  </div>
                </div>

                {form.mediaPath ? (
                  <div className="overflow-hidden rounded-lg bg-[#F1F5F9]">
                    {form.mediaType === 'VIDEO' ? (
                      <video
                        className="aspect-video w-full object-cover"
                        src={adminApi.publicAssetUrl(form.mediaPath)}
                        controls
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

              <Field label="Headline">
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(event) => updateField('title', event.target.value)}
                />
              </Field>

              <Field label="Caption">
                <textarea
                  className={`${inputClass} min-h-24`}
                  value={form.caption}
                  onChange={(event) => updateField('caption', event.target.value)}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Button Text">
                  <input
                    className={inputClass}
                    placeholder="Learn More"
                    value={form.ctaLabel}
                    onChange={(event) => updateField('ctaLabel', event.target.value)}
                  />
                </Field>

                <Field label="Button Link">
                  <select
                    className={inputClass}
                    value={form.ctaUrl}
                    onChange={(event) => updateField('ctaUrl', event.target.value)}
                  >
                    {HERO_CTA_LINK_OPTIONS.map((option) => (
                      <option key={option.label} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                    {hasCustomCtaUrl ? (
                      <option value={form.ctaUrl}>Current custom link: {form.ctaUrl}</option>
                    ) : null}
                  </select>
                </Field>
              </div>

              <div className="grid gap-3 rounded-lg border border-[#E2E8F0] p-4 text-sm text-[#1C2434]">
                <label className="flex items-center justify-between gap-3">
                  <span>
                    Show this slide on website
                    <span className="mt-0.5 block text-xs text-[#64748B]">
                      Status: {form.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </span>

                  <input
                    checked={form.isActive}
                    type="checkbox"
                    onChange={(event) => updateField('isActive', event.target.checked)}
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E8F0] px-5 py-4">
              <div>
                {isEditing ? (
                  <Button
                    className="inline-flex items-center gap-1.5"
                    disabled={isBusy}
                    type="button"
                    variant="danger"
                    onClick={() => void deleteSlide()}
                  >
                    <Trash2 size={14} />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                ) : null}
              </div>

              <div className="flex gap-2">
                <Button disabled={isSaving} type="button" variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>

                <Button className="inline-flex items-center gap-2" disabled={isBusy} type="submit">
                  <Save size={15} />
                  {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Slide'}
                </Button>
              </div>
            </div>
          </form>
        )}

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
          allowedKinds={['VIDEO']}
          galleries={galleries}
          open={isVideoPickerOpen}
          title="Choose Hero Video"
          uploadKind="VIDEO"
          onClose={() => setIsVideoPickerOpen(false)}
          onSelect={(asset) =>
            setForm((current) => ({
              ...current,
              mediaAlt: asset.alt,
              mediaPath: asset.path,
              mediaType: 'VIDEO',
            }))
          }
          onSelectLocalFile={(file) => void uploadHeroVideo(file)}
        />
      </section>
    </AppShell>
  );
}
