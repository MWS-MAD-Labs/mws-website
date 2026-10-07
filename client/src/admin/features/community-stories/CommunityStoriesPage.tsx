import { Pencil, Plus, Settings, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  adminApi,
  type AdminCommunityStoriesPage,
  type GalleryImageItem,
  type GalleryItem,
} from '@/admin/api/adminApi';
import AppShell from '@/admin/components/layout/AppShell';
import Button from '@/admin/components/ui/Button';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';
import Field from '@/admin/components/ui/Field';
import SearchInput from '@/admin/components/ui/SearchInput';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import { useToastState } from '@/admin/components/ui/toastContext';
import GalleryPickerModal from '@/admin/features/gallery/components/GalleryPickerModal';
import GalleryThumb from '@/admin/features/gallery/components/GalleryThumb';
import { uploadImageForPicker } from '@/admin/features/gallery/utils/uploadImageForPicker';
import CoverImagePickerModal from '@/admin/features/news/components/layouts/CoverImagePickerModal';
import { getErrorMessage } from '@/admin/features/news/newsUtils';

type PageForm = {
  activityDescription: string;
  activityTitle: string;
  galleryId: string | null;
  heroImageAlt: string;
  heroImagePath: string;
  introBody: string;
  introTitle: string;
  isPublished: boolean;
  title: string;
};

type ImageForm = {
  caption: string;
  sortOrder: string;
  title: string;
};

const emptyImageForm: ImageForm = {
  caption: '',
  sortOrder: '0',
  title: '',
};

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toSortOrder(value: string) {
  const sortOrder = Number.parseInt(value, 10);
  return Number.isFinite(sortOrder) ? sortOrder : 0;
}

function pageToForm(page: AdminCommunityStoriesPage): PageForm {
  return {
    activityDescription: page.activityDescription ?? '',
    activityTitle: page.activityTitle ?? '',
    galleryId: page.galleryId,
    heroImageAlt: page.heroImageAlt ?? '',
    heroImagePath: page.heroImagePath ?? '',
    introBody: page.introBody.join('\n\n'),
    introTitle: page.introTitle ?? '',
    isPublished: page.isPublished,
    title: page.title,
  };
}

function imageToForm(image: GalleryImageItem): ImageForm {
  return {
    caption: image.caption ?? '',
    sortOrder: String(image.sortOrder ?? 0),
    title: image.title ?? '',
  };
}

function pagePayload(form: PageForm) {
  return {
    activityDescription: optionalText(form.activityDescription),
    activityTitle: optionalText(form.activityTitle),
    galleryId: form.galleryId,
    heroImageAlt: optionalText(form.heroImageAlt),
    heroImagePath: optionalText(form.heroImagePath),
    introBody: form.introBody
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean),
    introTitle: optionalText(form.introTitle),
    isPublished: form.isPublished,
    title: form.title,
  };
}

function statusClassName(isPublished: boolean) {
  return isPublished ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#F1F5F9] text-[#64748B]';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export default function CommunityStoriesPage() {
  const [pageForm, setPageForm] = useState<PageForm | null>(null);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [imageForm, setImageForm] = useState<ImageForm>(emptyImageForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingImage, setEditingImage] = useState<GalleryImageItem | null>(null);
  const [search, setSearch] = useState('');
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isGalleryPickerOpen, setIsGalleryPickerOpen] = useState(false);
  const [isHeroAssetPickerOpen, setIsHeroAssetPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useToastState<string | null>(null);

  const selectedGallery = useMemo(
    () => galleries.find((gallery) => gallery.id === pageForm?.galleryId) ?? null,
    [galleries, pageForm?.galleryId],
  );
  const activityImages = selectedGallery?.images ?? [];
  const filteredImages = useMemo(() => {
    const query = search.trim().toLowerCase();

    return activityImages.filter((image) => {
      if (!query) return true;

      return [image.title ?? '', image.caption ?? '', image.path]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [activityImages, search]);

  async function loadData() {
    const data = await adminApi.communityStories();
    setPageForm(pageToForm(data.page));
    setGalleries(data.galleries);
  }

  useEffect(() => {
    let isCurrent = true;

    queueMicrotask(() => {
      loadData()
        .catch((error) => {
          if (!isCurrent) return;
          setMessage(getErrorMessage(error, 'Failed to load community stories.'));
        })
        .finally(() => {
          if (isCurrent) setIsLoading(false);
        });
    });

    return () => {
      isCurrent = false;
    };
  }, [setMessage]);

  function openCreateImage() {
    setEditingImage(null);
    setImageForm({
      ...emptyImageForm,
      sortOrder: String(activityImages.length),
    });
    setImageFile(null);
    setIsImageModalOpen(true);
  }

  function openEditImage(image: GalleryImageItem) {
    setEditingImage(image);
    setImageForm(imageToForm(image));
    setImageFile(null);
    setIsImageModalOpen(true);
  }

  function closeContentModal() {
    if (isSaving || isUploadingHero) return;

    setIsContentModalOpen(false);
  }

  function closeImageModal() {
    if (isSaving) return;

    resetImageModal();
  }

  function resetImageModal() {
    setIsImageModalOpen(false);
    setEditingImage(null);
    setImageForm(emptyImageForm);
    setImageFile(null);
  }

  function handleAddPhotoClick() {
    if (!selectedGallery) {
      setMessage('Choose an Activity Gallery from Manage Content before adding photos.');
      setIsContentModalOpen(true);
      return;
    }

    openCreateImage();
  }

  async function saveCurrentPageContent() {
    if (!pageForm) throw new Error('Community Stories content is not loaded.');

    const updatedPage = await adminApi.updateCommunityStoriesPage(pagePayload(pageForm));
    setPageForm(pageToForm(updatedPage));
    return updatedPage;
  }

  async function savePage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pageForm) return;

    setIsSaving(true);
    setMessage(null);

    try {
      await saveCurrentPageContent();
      setIsContentModalOpen(false);
      setMessage('Community Stories content updated.');
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to save community stories content.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function saveImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pageForm?.galleryId) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const activeGalleryId = editingImage
        ? pageForm.galleryId
        : (await saveCurrentPageContent()).galleryId;

      if (editingImage) {
        await adminApi.updateGalleryImage(editingImage.id, {
          caption: optionalText(imageForm.caption),
          sortOrder: toSortOrder(imageForm.sortOrder),
          title: optionalText(imageForm.title),
        });
        setMessage('Activity photo updated.');
      } else if (imageFile && activeGalleryId) {
        await adminApi.uploadGalleryImage(activeGalleryId, {
          caption: imageForm.caption.trim(),
          file: imageFile,
          sortOrder: imageForm.sortOrder,
          title: imageForm.title.trim(),
        });
        setMessage('Activity photo added.');
      }

      resetImageModal();
      await loadData();
    } catch (error) {
      setMessage(
        getErrorMessage(
          error,
          editingImage ? 'Failed to update activity photo.' : 'Failed to add activity photo.',
        ),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteImage(image: GalleryImageItem) {
    const confirmed = window.confirm(
      `Delete "${image.title || image.caption || image.path}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(image.id);
    setMessage(null);

    try {
      await adminApi.deleteGalleryImage(image.id);
      await loadData();
      setMessage('Activity photo deleted.');
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to delete activity photo.'));
    } finally {
      setDeletingId(null);
    }
  }

  async function uploadPageHeroImage(file: File) {
    if (!pageForm) return;

    setIsUploadingHero(true);
    setMessage(null);

    try {
      const uploaded = await uploadImageForPicker({
        caption: pageForm.title,
        fallbackGalleryTitle: 'Community Stories Images',
        file,
        galleries,
        preferredGalleryId: pageForm.galleryId,
      });

      setGalleries(uploaded.galleries);
      setPageForm((current) =>
        current
          ? {
              ...current,
              galleryId: current.galleryId ?? uploaded.galleryId,
              heroImageAlt: uploaded.alt,
              heroImagePath: uploaded.path,
            }
          : current,
      );
      setMessage('Hero image uploaded. Save content to publish it.');
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to upload hero image.'));
    } finally {
      setIsUploadingHero(false);
    }
  }

  const isBusy = isSaving || isUploadingHero;

  return (
    <AppShell title="Community Stories">
      <section className="space-y-5 p-6">
        <ContentPageHeader
          breadcrumbs={[{ label: 'Content' }, { label: 'Community Stories' }]}
          title="Community Stories"
          description="Manage activity photos shown in the public Community Stories gallery."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isLoading || !pageForm}
                onClick={() => setIsContentModalOpen(true)}
              >
                <Settings size={15} />
                Manage Content
              </Button>

              <Button
                type="button"
                size="sm"
                disabled={isLoading}
                onClick={handleAddPhotoClick}
              >
                <Plus size={15} />
                Add Photo
              </Button>
            </div>
          }
        />

        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] px-5 py-4">
            <div>
              <h2 className="font-semibold text-[#1C2434]">Activity Photos</h2>

              <p className="mt-0.5 text-sm text-[#64748B]">
                {selectedGallery
                  ? `${activityImages.length} ${
                      activityImages.length === 1 ? 'photo' : 'photos'
                    } from ${selectedGallery.title}`
                  : 'Choose an activity gallery from Manage Content first.'}
              </p>
            </div>

            {pageForm ? (
              <span
                className={
                  'inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ' +
                  statusClassName(pageForm.isPublished)
                }
              >
                Page {pageForm.isPublished ? 'Published' : 'Hidden'}
              </span>
            ) : null}
          </div>

          <div className="border-b border-[#E2E8F0] bg-[#F1F5F9] px-5 py-4">
            <SearchInput
              className="max-w-xs"
              placeholder="Search activity photo..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {message ? (
            <div className="border-b border-[#E2E8F0] bg-white px-5 py-3">
              <StatusMessage>{message}</StatusMessage>
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F1F5F9] text-left">
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
                    Photo
                  </th>

                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
                    Caption
                  </th>

                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
                    Order
                  </th>

                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
                    Updated
                  </th>

                  <th className="px-5 py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredImages.map((image) => (
                  <tr key={image.id} className="transition-colors hover:bg-[#F1F5F9]/50">
                    <td className="px-5 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <img
                          className="h-14 w-14 shrink-0 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] object-cover"
                          src={adminApi.galleryImageUrl(image)}
                          alt={image.title || image.caption || 'Activity photo'}
                        />

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-[#1C2434]">
                            {image.title || 'Untitled photo'}
                          </h3>

                          <p className="mt-1 truncate text-xs text-[#64748B]">{image.path}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="max-w-[360px] truncate text-sm text-[#64748B]">
                        {image.caption || '-'}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-[#64748B]">{image.sortOrder}</td>

                    <td className="px-5 py-4 text-sm text-[#64748B]">
                      {formatDate(image.updatedAt)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          aria-label={`Delete ${image.title || 'activity photo'}`}
                          className="h-90 w-90 rounded-md p-0"
                          disabled={deletingId === image.id || isBusy}
                          size="sm"
                          type="button"
                          variant="danger"
                          onClick={() => void deleteImage(image)}
                        >
                          <Trash2 size={14} />
                        </Button>

                        <button
                          type="button"
                          aria-label={`Edit ${image.title || 'activity photo'}`}
                          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#E2E8F0] px-3 text-xs font-semibold text-[#475569] transition hover:bg-[#F8FAFC] hover:text-[#1C2434] disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={isBusy}
                          onClick={() => openEditImage(image)}
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isLoading ? (
            <div className="p-10 text-center">
              <p className="font-medium text-[#1C2434]">Loading community stories...</p>
            </div>
          ) : null}

          {!isLoading && !selectedGallery ? (
            <div className="p-10 text-center">
              <p className="font-medium text-[#1C2434]">No activity gallery selected.</p>

              <p className="mt-1 text-sm text-[#64748B]">
                Use Manage Content to choose the gallery for the public activity grid.
              </p>
            </div>
          ) : null}

          {!isLoading && selectedGallery && !filteredImages.length ? (
            <div className="p-10 text-center">
              <p className="font-medium text-[#1C2434]">No activity photos found.</p>

              <p className="mt-1 text-sm text-[#64748B]">Try adjusting your search.</p>
            </div>
          ) : null}
        </div>
      </section>

      {isContentModalOpen && pageForm ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isBusy) {
              closeContentModal();
            }
          }}
        >
          <div
            className="max-h-[calc(100dvh-32px)] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="community-content-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2
                  id="community-content-modal-title"
                  className="text-lg font-semibold text-gray-900"
                >
                  Manage Content
                </h2>

                <p className="mt-0.5 text-sm text-gray-500">
                  Update hero, intro, and public activity gallery content.
                </p>
              </div>

              <button
                type="button"
                onClick={closeContentModal}
                disabled={isBusy}
                className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={savePage}>
              <div className="max-h-[calc(100dvh-180px)] space-y-5 overflow-y-auto px-6 py-5">
                <Field label="Title">
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7e1518] focus:ring-1 focus:ring-[#7e1518] disabled:bg-gray-50"
                    disabled={isBusy}
                    required
                    value={pageForm.title}
                    onChange={(event) =>
                      setPageForm((current) =>
                        current ? { ...current, title: event.target.value } : current,
                      )
                    }
                  />
                </Field>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Hero Image
                  </label>

                  <div className="rounded-lg border border-gray-200 p-3">
                    {pageForm.heroImagePath ? (
                      <img
                        className="aspect-video w-full rounded-md bg-gray-50 object-cover"
                        src={adminApi.publicAssetUrl(pageForm.heroImagePath)}
                        alt={pageForm.heroImageAlt || 'Community Stories hero'}
                      />
                    ) : (
                      <div className="grid aspect-video place-items-center rounded-md bg-gray-50 text-sm text-gray-400">
                        No image selected.
                      </div>
                    )}

                    <div className="mt-3 flex min-w-0 items-center justify-between gap-3">
                      <p className="min-w-0 truncate text-xs text-gray-400">
                        {pageForm.heroImagePath || 'No image selected.'}
                      </p>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => setIsHeroAssetPickerOpen(true)}
                        className="text-sm font-medium text-[#7e1518] hover:text-[#681215] disabled:opacity-50"
                      >
                        Choose Image
                      </button>
                    </div>
                  </div>
                </div>

                <Field label="Hero Image Alt">
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7e1518] focus:ring-1 focus:ring-[#7e1518] disabled:bg-gray-50"
                    disabled={isBusy}
                    value={pageForm.heroImageAlt}
                    onChange={(event) =>
                      setPageForm((current) =>
                        current ? { ...current, heroImageAlt: event.target.value } : current,
                      )
                    }
                  />
                </Field>

                <Field label="Intro Title">
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7e1518] focus:ring-1 focus:ring-[#7e1518] disabled:bg-gray-50"
                    disabled={isBusy}
                    value={pageForm.introTitle}
                    onChange={(event) =>
                      setPageForm((current) =>
                        current ? { ...current, introTitle: event.target.value } : current,
                      )
                    }
                  />
                </Field>

                <Field label="Intro Body">
                  <textarea
                    className="min-h-32 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7e1518] focus:ring-1 focus:ring-[#7e1518] disabled:bg-gray-50"
                    disabled={isBusy}
                    value={pageForm.introBody}
                    onChange={(event) =>
                      setPageForm((current) =>
                        current ? { ...current, introBody: event.target.value } : current,
                      )
                    }
                  />
                </Field>

                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Activity Gallery</h3>

                      <p className="mt-0.5 text-sm text-gray-500">
                        These images are rendered in the public gallery grid.
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isBusy}
                      onClick={() => setIsGalleryPickerOpen(true)}
                    >
                      Choose Gallery
                    </Button>
                  </div>

                  {selectedGallery ? (
                    <div className="flex items-center gap-3">
                      <GalleryThumb gallery={selectedGallery} />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {selectedGallery.title}
                        </p>

                        <p className="truncate text-sm text-gray-500">
                          {selectedGallery.images.length}{' '}
                          {selectedGallery.images.length === 1 ? 'photo' : 'photos'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No gallery selected.</p>
                  )}
                </div>

                <Field label="Activity Title">
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7e1518] focus:ring-1 focus:ring-[#7e1518] disabled:bg-gray-50"
                    disabled={isBusy}
                    value={pageForm.activityTitle}
                    onChange={(event) =>
                      setPageForm((current) =>
                        current ? { ...current, activityTitle: event.target.value } : current,
                      )
                    }
                  />
                </Field>

                <Field label="Activity Description">
                  <textarea
                    className="min-h-24 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7e1518] focus:ring-1 focus:ring-[#7e1518] disabled:bg-gray-50"
                    disabled={isBusy}
                    value={pageForm.activityDescription}
                    onChange={(event) =>
                      setPageForm((current) =>
                        current
                          ? { ...current, activityDescription: event.target.value }
                          : current,
                      )
                    }
                  />
                </Field>

                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    checked={pageForm.isPublished}
                    className="h-4 w-4 accent-[#7e1518]"
                    disabled={isBusy}
                    type="checkbox"
                    onChange={(event) =>
                      setPageForm((current) =>
                        current ? { ...current, isPublished: event.target.checked } : current,
                      )
                    }
                  />
                  Published on public page
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
                <button
                  type="button"
                  onClick={closeContentModal}
                  disabled={isBusy}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isBusy || !pageForm.title.trim()}
                  className="rounded-lg bg-[#7e1518] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#681215] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploadingHero ? 'Uploading...' : isSaving ? 'Saving...' : 'Save Content'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isImageModalOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSaving) {
              closeImageModal();
            }
          }}
        >
          <div
            className="max-h-[calc(100dvh-32px)] w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="activity-photo-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 id="activity-photo-modal-title" className="text-lg font-semibold text-gray-900">
                  {editingImage ? 'Edit Activity Photo' : 'Add Activity Photo'}
                </h2>

                <p className="mt-0.5 text-sm text-gray-500">
                  {editingImage
                    ? 'Update caption and display order.'
                    : 'Upload a photo into the selected activity gallery.'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeImageModal}
                disabled={isSaving}
                className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveImage}>
              <div className="max-h-[calc(100dvh-180px)] space-y-5 overflow-y-auto px-6 py-5">
                {editingImage ? (
                  <img
                    className="aspect-video w-full rounded-lg border border-gray-200 object-cover"
                    src={adminApi.galleryImageUrl(editingImage)}
                    alt={editingImage.title || editingImage.caption || 'Activity photo'}
                  />
                ) : (
                  <Field label="Image File">
                    <input
                      accept="image/*"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700"
                      disabled={isSaving}
                      required
                      type="file"
                      onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                    />
                  </Field>
                )}

                <Field label="Title">
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7e1518] focus:ring-1 focus:ring-[#7e1518] disabled:bg-gray-50"
                    disabled={isSaving}
                    value={imageForm.title}
                    onChange={(event) =>
                      setImageForm((current) => ({ ...current, title: event.target.value }))
                    }
                  />
                </Field>

                <Field label="Caption">
                  <textarea
                    className="min-h-28 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7e1518] focus:ring-1 focus:ring-[#7e1518] disabled:bg-gray-50"
                    disabled={isSaving}
                    value={imageForm.caption}
                    onChange={(event) =>
                      setImageForm((current) => ({ ...current, caption: event.target.value }))
                    }
                  />
                </Field>

                <Field label="Sort Order">
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7e1518] focus:ring-1 focus:ring-[#7e1518] disabled:bg-gray-50"
                    disabled={isSaving}
                    type="number"
                    value={imageForm.sortOrder}
                    onChange={(event) =>
                      setImageForm((current) => ({ ...current, sortOrder: event.target.value }))
                    }
                  />
                </Field>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
                <button
                  type="button"
                  onClick={closeImageModal}
                  disabled={isSaving}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving || (!editingImage && !imageFile)}
                  className="rounded-lg bg-[#7e1518] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#681215] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingImage ? 'Save Changes' : 'Add Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <GalleryPickerModal
        galleries={galleries}
        open={isGalleryPickerOpen}
        selectedGalleryId={pageForm?.galleryId ?? null}
        onClose={() => setIsGalleryPickerOpen(false)}
        onSelect={(galleryId) =>
          setPageForm((current) => (current ? { ...current, galleryId } : current))
        }
      />
      <CoverImagePickerModal
        galleries={galleries}
        open={isHeroAssetPickerOpen}
        title="Choose Hero Image"
        onClose={() => setIsHeroAssetPickerOpen(false)}
        onSelect={(asset) =>
          setPageForm((current) =>
            current
              ? {
                  ...current,
                  galleryId: current.galleryId ?? asset.galleryId,
                  heroImageAlt: asset.alt,
                  heroImagePath: asset.path,
                }
              : current,
          )
        }
        onSelectLocalFile={(file) => void uploadPageHeroImage(file)}
      />
    </AppShell>
  );
}
