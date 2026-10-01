import { useEffect, useMemo, useState } from 'react';
import { Eye, ImagePlus, Save, Trash2 } from 'lucide-react';

import {
  adminApi,
  type AcademicOverviewPayload,
  type GalleryItem,
} from '@/admin/api/adminApi';
import AppShell from '@/admin/components/layout/AppShell';
import Button from '@/admin/components/ui/Button';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import GalleryAssetPickerModal from '@/admin/features/gallery/components/GalleryAssetPickerModal';
import GalleryPickerModal from '@/admin/features/gallery/components/GalleryPickerModal';
import GalleryThumb from '@/admin/features/gallery/components/GalleryThumb';
import { publicAssetUrl } from '@/lib/api';

type AcademicOverviewForm = {
  title: string;
  description: string;
  coverImage: string;
  galleryId: string | null;
};

const defaultForm: AcademicOverviewForm = {
  title: 'Academic',
  description:
    'A connected learning journey that helps students build strong foundations, explore their interests, and grow into confident independent learners.',
  coverImage: '/assets-mws/DSC09500.jpg',
  galleryId: null,
};

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function payloadFromForm(form: AcademicOverviewForm): AcademicOverviewPayload {
  return {
    title: form.title,
    description: optionalText(form.description),
    coverImage: optionalText(form.coverImage),
    galleryId: form.galleryId,
  };
}

export default function AcademicOverviewPage() {
  const [overviewId, setOverviewId] = useState<string | null>(null);
  const [form, setForm] = useState<AcademicOverviewForm>(defaultForm);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [isGalleryPickerOpen, setIsGalleryPickerOpen] = useState(false);
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedGallery = useMemo(
    () => galleries.find((gallery) => gallery.id === form.galleryId) ?? null,
    [form.galleryId, galleries],
  );

  async function loadData() {
    const [items, nextGalleries] = await Promise.all([
      adminApi.academicOverviews(),
      adminApi.galleries(),
    ]);
    const item = items[0] ?? null;

    setOverviewId(item?.id ?? null);
    setForm({
      title: item?.title ?? defaultForm.title,
      description: item?.description ?? defaultForm.description,
      coverImage: item?.coverImage ?? defaultForm.coverImage,
      galleryId: item?.galleryId ?? null,
    });
    setGalleries(nextGalleries);
  }

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      loadData()
        .catch((error) => {
          if (!cancelled) {
            setMessage(error instanceof Error ? error.message : 'Failed to load Academic.');
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function saveOverview() {
    setIsSaving(true);
    setMessage(null);

    try {
      const payload = payloadFromForm(form);
      const saved = overviewId
        ? await adminApi.updateAcademicOverview(overviewId, payload)
        : await adminApi.createAcademicOverview(payload);

      setOverviewId(saved.id);
      setForm({
        title: saved.title,
        description: saved.description ?? '',
        coverImage: saved.coverImage ?? '',
        galleryId: saved.galleryId,
      });
      setMessage('Academic overview saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save Academic overview.');
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteOverview() {
    if (!overviewId) return;
    const confirmed = window.confirm('Delete the Academic overview record?');
    if (!confirmed) return;

    setIsSaving(true);
    setMessage(null);

    try {
      await adminApi.deleteAcademicOverview(overviewId);
      setOverviewId(null);
      setForm(defaultForm);
      setMessage('Academic overview deleted.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete Academic overview.');
    } finally {
      setIsSaving(false);
    }
  }

  const isBusy = isSaving || isLoading;

  return (
    <AppShell title="Academic Overview">
      <div className="bg-[#F1F5F9]">
        <div className="border-b border-[#E2E8F0] bg-white px-6 py-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <ContentPageHeader
              breadcrumbs={[{ label: 'Academic' }, { label: 'Overview' }]}
              title="Academic Overview"
              description="Manage the standalone Academic overview content."
            />

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.open('/academic', '_blank', 'noopener,noreferrer')}
              >
                <Eye size={15} />
                Preview
              </Button>
              {overviewId ? (
                <Button
                  disabled={isBusy}
                  type="button"
                  variant="danger"
                  onClick={() => void deleteOverview()}
                >
                  <Trash2 size={15} />
                  Delete
                </Button>
              ) : null}
              <Button
                disabled={isBusy}
                type="button"
                onClick={() => {
                  void saveOverview();
                }}
              >
                <Save size={15} />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 px-6 py-6">
          {message ? (
            <div className="rounded-lg border border-[#E2E8F0] bg-white px-5 py-3">
              <StatusMessage>{message}</StatusMessage>
            </div>
          ) : null}

          {isLoading ? (
            <div className="rounded-lg border border-[#E2E8F0] bg-white p-6 text-sm text-[#64748B]">
              Loading Academic overview...
            </div>
          ) : (
            <>
              <section className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-[#141414] text-white">
                <div className="relative min-h-[520px]">
                  {form.coverImage ? (
                    <img
                      className="absolute inset-0 h-full w-full object-cover"
                      src={publicAssetUrl(form.coverImage)}
                      alt={form.title}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#2f2f2f]" />
                  )}
                  <div className="absolute inset-0 bg-black/35" />
                  <div className="absolute right-5 top-5 z-10 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      type="button"
                      variant="primary"
                      onClick={() => setIsAssetPickerOpen(true)}
                    >
                      <ImagePlus size={15} />
                      Cover Image
                    </Button>
                  </div>
                  <div className="relative z-10 flex min-h-[520px] items-end">
                    <div className="grid w-full gap-6 p-6 md:grid-cols-[0.55fr_1fr] md:p-10">
                      <input
                        required
                        aria-label="Academic title"
                        className="w-full border-0 border-b border-white/35 bg-transparent px-0 pb-3 text-5xl font-medium leading-none text-white outline-none placeholder:text-white/55 focus:border-white md:text-7xl"
                        value={form.title}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, title: event.target.value }))
                        }
                      />
                      <textarea
                        aria-label="Academic description"
                        className="min-h-28 w-full resize-none border-0 border-b border-white/35 bg-transparent px-0 pb-3 text-lg leading-8 text-white outline-none placeholder:text-white/55 focus:border-white md:text-xl"
                        value={form.description}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            description: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-[#E2E8F0] bg-white">
                <div className="grid gap-6 border-b border-[#E2E8F0] p-6 md:grid-cols-[0.7fr_1fr]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748B]">
                      Connected Media
                    </p>
                    <h2 className="mt-2 text-2xl font-medium text-[#1C2434]">
                      Academic activity gallery
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-[#64748B]">
                      Activity and classroom media connected to the Academic overview.
                    </p>
                  </div>

                  <div className="rounded-lg border border-[#E2E8F0] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1C2434]">Gallery</p>
                        <p className="truncate text-sm text-[#64748B]">
                          {selectedGallery ? selectedGallery.title : 'No gallery selected.'}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {form.galleryId ? (
                          <Button
                            size="sm"
                            type="button"
                            variant="ghost"
                            onClick={() =>
                              setForm((current) => ({ ...current, galleryId: null }))
                            }
                          >
                            Clear
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          type="button"
                          variant="outline"
                          onClick={() => setIsGalleryPickerOpen(true)}
                        >
                          Choose Gallery
                        </Button>
                      </div>
                    </div>

                    {selectedGallery ? (
                      <div className="mt-4 flex items-center gap-3">
                        <GalleryThumb gallery={selectedGallery} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#1C2434]">
                            {selectedGallery.title}
                          </p>
                          <p className="truncate text-sm text-[#64748B]">
                            {selectedGallery.description || '-'}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-6 p-6 md:grid-cols-2">
                  <div className="border-t border-[#E2E8F0] pt-6">
                    <h3 className="mb-4 text-2xl font-medium text-[#1C2434]">
                      Learning through inquiry
                    </h3>
                    <p className="max-w-xl leading-7 text-[#64748B]">
                      Students are encouraged to ask questions, explore ideas, collaborate with
                      others, and connect their learning with experiences beyond the classroom.
                    </p>
                  </div>

                  <div className="overflow-hidden rounded-lg border border-[#E2E8F0]">
                    {form.coverImage ? (
                      <img
                        className="block aspect-[4/3] w-full object-cover"
                        src={publicAssetUrl(form.coverImage)}
                        alt={form.title}
                      />
                    ) : (
                      <div className="flex aspect-[4/3] w-full items-center justify-center bg-[#F1F5F9] text-sm text-[#64748B]">
                        No cover image selected.
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </>
          )}

          <GalleryPickerModal
            galleries={galleries}
            open={isGalleryPickerOpen}
            selectedGalleryId={form.galleryId}
            onClose={() => setIsGalleryPickerOpen(false)}
            onSelect={(galleryId) => setForm((current) => ({ ...current, galleryId }))}
          />

          <GalleryAssetPickerModal
            allowedKinds={['IMAGE']}
            galleries={galleries}
            initialGalleryId={form.galleryId}
            open={isAssetPickerOpen}
            title="Choose Cover Image"
            onClose={() => setIsAssetPickerOpen(false)}
            onSelect={(asset) =>
              setForm((current) => ({
                ...current,
                coverImage: asset.path,
                galleryId: current.galleryId ?? asset.galleryId,
              }))
            }
          />
        </div>
      </div>
    </AppShell>
  );
}
