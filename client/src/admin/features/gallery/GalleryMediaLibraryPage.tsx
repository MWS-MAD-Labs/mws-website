import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  adminApi,
  type GalleryImageItem,
  type GalleryItem,
  type GalleryVideoItem,
} from '@/admin/api/adminApi';
import AppShell from '@/admin/components/layout/AppShell';
import Button from '@/admin/components/ui/Button';
import Field from '@/admin/components/ui/Field';
import Modal from '@/admin/components/ui/Modal';
import SearchInput from '@/admin/components/ui/SearchInput';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import { useToastState } from '@/admin/components/ui/toastContext';

type MediaKind = 'images' | 'videos';
type VideoType = GalleryVideoItem['sourceType'];

type ImageRow = GalleryImageItem & {
  gallery: GalleryItem;
};

type VideoRow = GalleryVideoItem & {
  gallery: GalleryItem;
};

type ImageFormState = {
  caption: string;
  galleryId: string;
  pathUrl: string;
  sortOrder: string;
  title: string;
};

type VideoFormState = ImageFormState & {
  sourceType: VideoType;
};

const FIELD_CLASS =
  'w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm outline-none transition focus:border-[#3C50E0] focus:ring-2 focus:ring-[#3C50E0]/10';

function emptyImageForm(galleryId = ''): ImageFormState {
  return { caption: '', galleryId, pathUrl: '', sortOrder: '0', title: '' };
}

function emptyVideoForm(galleryId = ''): VideoFormState {
  return { ...emptyImageForm(galleryId), sourceType: 'YOUTUBE' };
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

function toSortOrder(value: string) {
  return Number(value || 0);
}

function galleryOptions(galleries: GalleryItem[]) {
  return galleries.map((gallery) => (
    <option key={gallery.id} value={gallery.id}>
      {gallery.title}
    </option>
  ));
}

function youtubeVideoId(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') return parsed.pathname.split('/').filter(Boolean)[0] ?? null;
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const watchId = parsed.searchParams.get('v');
      if (watchId) return watchId;

      const [kind, id] = parsed.pathname.split('/').filter(Boolean);
      if (kind === 'embed' || kind === 'shorts') return id ?? null;
    }
  } catch {
    return null;
  }

  return null;
}

function youtubeThumbnailUrl(url: string) {
  const id = youtubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

function youtubeEmbedUrl(url: string) {
  const id = youtubeVideoId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

export function GalleryImagesPage() {
  return <GalleryMediaLibraryPage kind="images" />;
}

export function GalleryVideosPage() {
  return <GalleryMediaLibraryPage kind="videos" />;
}

export default function GalleryMediaLibraryPage({ kind }: { kind: MediaKind }) {
  const isImages = kind === 'images';
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageForm, setImageForm] = useState<ImageFormState>(emptyImageForm);
  const [videoForm, setVideoForm] = useState<VideoFormState>(emptyVideoForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [editingImage, setEditingImage] = useState<ImageRow | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoRow | null>(null);
  const [previewImage, setPreviewImage] = useState<ImageRow | null>(null);
  const [previewVideo, setPreviewVideo] = useState<VideoRow | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useToastState<string | null>(null);

  const imageRows = useMemo<ImageRow[]>(
    () => galleries.flatMap((gallery) => gallery.images.map((image) => ({ ...image, gallery }))),
    [galleries],
  );
  const videoRows = useMemo<VideoRow[]>(
    () => galleries.flatMap((gallery) => gallery.videos.map((video) => ({ ...video, gallery }))),
    [galleries],
  );

  const filteredImageRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return imageRows.filter((image) => {
      if (!query) return true;
      return [image.title ?? '', image.caption ?? '', image.path, image.gallery.title]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [imageRows, searchQuery]);

  const filteredVideoRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return videoRows.filter((video) => {
      if (!query) return true;
      return [video.title ?? '', video.caption ?? '', video.source, video.sourceType, video.gallery.title]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [videoRows, searchQuery]);

  async function loadGalleries() {
    setGalleries(await adminApi.galleries());
  }

  useEffect(() => {
    queueMicrotask(() => {
      loadGalleries()
        .catch((error) =>
          setMessage(error instanceof Error ? error.message : 'Failed to load gallery data.'),
        )
        .finally(() => setIsLoading(false));
    });
  }, [setMessage]);

  function resetForm() {
    const firstGalleryId = galleries[0]?.id ?? '';
    setImageForm(emptyImageForm(firstGalleryId));
    setVideoForm(emptyVideoForm(firstGalleryId));
    setImageFile(null);
    setVideoFile(null);
    setEditingImage(null);
    setEditingVideo(null);
    setFormMode(null);
  }

  function closeForm() {
    if (isSaving) return;
    resetForm();
  }

  function openCreateForm() {
    const firstGalleryId = galleries[0]?.id ?? '';
    setImageForm(emptyImageForm(firstGalleryId));
    setVideoForm(emptyVideoForm(firstGalleryId));
    setImageFile(null);
    setVideoFile(null);
    setEditingImage(null);
    setEditingVideo(null);
    setFormMode('create');
  }

  function openEditImage(image: ImageRow) {
    setEditingImage(image);
    setEditingVideo(null);
    setImageFile(null);
    setImageForm({
      caption: image.caption ?? '',
      galleryId: image.galleryId,
      pathUrl: image.path,
      sortOrder: String(image.sortOrder ?? 0),
      title: image.title ?? '',
    });
    setFormMode('edit');
  }

  function openEditVideo(video: VideoRow) {
    setEditingVideo(video);
    setEditingImage(null);
    setVideoFile(null);
    setVideoForm({
      caption: video.caption ?? '',
      galleryId: video.galleryId,
      pathUrl: video.source,
      sortOrder: String(video.sortOrder ?? 0),
      sourceType: video.sourceType,
      title: video.title ?? '',
    });
    setFormMode('edit');
  }

  async function submitImageForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      if (editingImage) {
        await adminApi.updateGalleryImage(editingImage.id, {
          caption: optionalText(imageForm.caption),
          sortOrder: toSortOrder(imageForm.sortOrder),
          title: optionalText(imageForm.title),
        });
        setMessage('Gambar galeri updated.');
      } else if (imageFile && imageForm.galleryId) {
        await adminApi.uploadGalleryImage(imageForm.galleryId, {
          caption: imageForm.caption.trim(),
          file: imageFile,
          sortOrder: imageForm.sortOrder,
          title: imageForm.title.trim(),
        });
        setMessage('Gambar galeri created.');
      }

      resetForm();
      await loadGalleries();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save image.');
    } finally {
      setIsSaving(false);
    }
  }

  async function submitVideoForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      if (editingVideo) {
        await adminApi.updateGalleryVideo(editingVideo.id, {
          caption: optionalText(videoForm.caption),
          sortOrder: toSortOrder(videoForm.sortOrder),
          title: optionalText(videoForm.title),
        });
        setMessage('Video galeri updated.');
      } else if (videoForm.galleryId) {
        if (videoForm.sourceType === 'YOUTUBE') {
          await adminApi.createYoutubeGalleryVideo(videoForm.galleryId, {
            caption: optionalText(videoForm.caption),
            sortOrder: toSortOrder(videoForm.sortOrder),
            title: optionalText(videoForm.title),
            url: videoForm.pathUrl.trim(),
          });
        } else if (videoFile) {
          await adminApi.uploadGalleryVideo(videoForm.galleryId, {
            caption: videoForm.caption.trim(),
            file: videoFile,
            sortOrder: videoForm.sortOrder,
            title: videoForm.title.trim(),
          });
        }
        setMessage('Video galeri created.');
      }

      resetForm();
      await loadGalleries();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save video.');
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteImage(image: ImageRow) {
    const confirmed = window.confirm(`Delete "${image.title || image.path}"?`);
    if (!confirmed) return;

    setIsSaving(true);
    setMessage(null);

    try {
      await adminApi.deleteGalleryImage(image.id);
      await loadGalleries();
      setMessage('Gambar galeri deleted.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete image.');
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteVideo(video: VideoRow) {
    const confirmed = window.confirm(`Delete "${video.title || video.source}"?`);
    if (!confirmed) return;

    setIsSaving(true);
    setMessage(null);

    try {
      await adminApi.deleteGalleryVideo(video.id);
      await loadGalleries();
      setMessage('Video galeri deleted.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete video.');
    } finally {
      setIsSaving(false);
    }
  }

  const title = isImages ? 'Photo Galeri' : 'Video Galeri';
  const createLabel = isImages ? 'Tambah gambar galeri' : 'Tambah video galeri';

  return (
    <AppShell title={title}>
      <section className="space-y-5 p-6">
        <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] px-5 py-4">
            <div>
              <h1 className="text-lg font-semibold text-[#1C2434]">{title}</h1>
              <p className="mt-0.5 text-sm text-[#64748B]">
                {isImages ? imageRows.length : videoRows.length} item
              </p>
            </div>

            <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
              <SearchInput
                className="max-w-xs"
                placeholder={isImages ? 'Cari gambar...' : 'Cari video...'}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <Button className="gap-2" size="sm" type="button" onClick={openCreateForm}>
                <Plus size={15} />
                {createLabel}
              </Button>
            </div>
          </div>

          {message ? (
            <div className="border-b border-[#E2E8F0] bg-[#F1F5F9] px-5 py-3">
              <StatusMessage>{message}</StatusMessage>
            </div>
          ) : null}

          {isImages ? (
            <ImageTable
              images={filteredImageRows}
              isLoading={isLoading}
              isSaving={isSaving}
              onDelete={deleteImage}
              onEdit={openEditImage}
              onPreview={setPreviewImage}
            />
          ) : (
            <VideoTable
              isLoading={isLoading}
              isSaving={isSaving}
              videos={filteredVideoRows}
              onDelete={deleteVideo}
              onEdit={openEditVideo}
              onPreview={setPreviewVideo}
            />
          )}
        </div>
      </section>

      {isImages ? (
        <ImageFormModal
          editingImage={editingImage}
          form={imageForm}
          galleries={galleries}
          imageFile={imageFile}
          isSaving={isSaving}
          open={formMode !== null}
          onClose={closeForm}
          onFileChange={(file) => {
            setImageFile(file);
            setImageForm((current) => ({
              ...current,
              pathUrl: file?.name ?? '',
              title: current.title || file?.name.replace(/\.[^.]+$/, '') || '',
            }));
          }}
          onFormChange={setImageForm}
          onSubmit={submitImageForm}
        />
      ) : (
        <VideoFormModal
          editingVideo={editingVideo}
          form={videoForm}
          galleries={galleries}
          isSaving={isSaving}
          open={formMode !== null}
          videoFile={videoFile}
          onClose={closeForm}
          onFileChange={(file) => {
            setVideoFile(file);
            setVideoForm((current) => ({
              ...current,
              pathUrl: file?.name ?? '',
              title: current.title || file?.name.replace(/\.[^.]+$/, '') || '',
            }));
          }}
          onFormChange={setVideoForm}
          onSubmit={submitVideoForm}
        />
      )}

      <ImagePreviewModal image={previewImage} onClose={() => setPreviewImage(null)} />
      <VideoPreviewModal video={previewVideo} onClose={() => setPreviewVideo(null)} />
    </AppShell>
  );
}

function ImageTable({
  images,
  isLoading,
  isSaving,
  onDelete,
  onEdit,
  onPreview,
}: {
  images: ImageRow[];
  isLoading: boolean;
  isSaving: boolean;
  onDelete: (image: ImageRow) => void;
  onEdit: (image: ImageRow) => void;
  onPreview: (image: ImageRow) => void;
}) {
  if (isLoading) return <div className="p-10 text-center text-sm text-[#64748B]">Loading images...</div>;
  if (!images.length) return <div className="p-10 text-center text-sm text-[#64748B]">No images found.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[#E2E8F0] text-sm">
        <thead className="bg-[#F1F5F9] text-left text-xs font-semibold uppercase text-[#64748B]">
          <tr>
            <th className="px-5 py-3">Preview</th>
            <th className="px-5 py-3">Title</th>
            <th className="px-5 py-3">Gallery</th>
            <th className="px-5 py-3">Path/URL</th>
            <th className="px-5 py-3">Created</th>
            <th className="px-5 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0] bg-white">
          {images.map((image) => (
            <tr className="hover:bg-[#F1F5F9]" key={image.id}>
              <td className="px-5 py-4">
                <img
                  alt={image.title || image.caption || 'Gallery image preview'}
                  className="h-12 w-16 rounded-md border border-[#E2E8F0] object-cover"
                  src={adminApi.galleryImageUrl(image)}
                />
              </td>
              <td className="px-5 py-4 font-semibold text-[#1C2434]">{image.title || '-'}</td>
              <td className="px-5 py-4 text-[#64748B]">{image.gallery.title}</td>
              <td className="max-w-sm truncate px-5 py-4 text-[#64748B]">{image.path}</td>
              <td className="px-5 py-4 text-[#64748B]">{formatDate(image.createdAt)}</td>
              <td className="px-5 py-4">
                <RowActions
                  disabled={isSaving}
                  onDelete={() => onDelete(image)}
                  onEdit={() => onEdit(image)}
                  onPreview={() => onPreview(image)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VideoTable({
  isLoading,
  isSaving,
  onDelete,
  onEdit,
  onPreview,
  videos,
}: {
  isLoading: boolean;
  isSaving: boolean;
  onDelete: (video: VideoRow) => void;
  onEdit: (video: VideoRow) => void;
  onPreview: (video: VideoRow) => void;
  videos: VideoRow[];
}) {
  if (isLoading) return <div className="p-10 text-center text-sm text-[#64748B]">Loading videos...</div>;
  if (!videos.length) return <div className="p-10 text-center text-sm text-[#64748B]">No videos found.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[#E2E8F0] text-sm">
        <thead className="bg-[#F1F5F9] text-left text-xs font-semibold uppercase text-[#64748B]">
          <tr>
            <th className="px-5 py-3">Preview</th>
            <th className="px-5 py-3">Title</th>
            <th className="px-5 py-3">Gallery</th>
            <th className="px-5 py-3">Type</th>
            <th className="px-5 py-3">URL/Path</th>
            <th className="px-5 py-3">Created</th>
            <th className="px-5 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0] bg-white">
          {videos.map((video) => (
            <tr className="hover:bg-[#F1F5F9]" key={video.id}>
              <td className="px-5 py-4">
                <VideoThumbnail video={video} />
              </td>
              <td className="px-5 py-4 font-semibold text-[#1C2434]">{video.title || '-'}</td>
              <td className="px-5 py-4 text-[#64748B]">{video.gallery.title}</td>
              <td className="px-5 py-4">
                <TypeBadge sourceType={video.sourceType} />
              </td>
              <td className="max-w-sm truncate px-5 py-4 text-[#64748B]">{video.source}</td>
              <td className="px-5 py-4 text-[#64748B]">{formatDate(video.createdAt)}</td>
              <td className="px-5 py-4">
                <RowActions
                  disabled={isSaving}
                  onDelete={() => onDelete(video)}
                  onEdit={() => onEdit(video)}
                  onPreview={() => onPreview(video)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RowActions({
  disabled,
  onDelete,
  onEdit,
  onPreview,
}: {
  disabled: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onPreview: () => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button disabled={disabled} size="sm" type="button" variant="outline" onClick={onPreview}>
        <Eye size={14} />
      </Button>
      <Button disabled={disabled} size="sm" type="button" variant="outline" onClick={onEdit}>
        <Pencil size={14} />
      </Button>
      <Button disabled={disabled} size="sm" type="button" variant="danger" onClick={onDelete}>
        <Trash2 size={14} />
      </Button>
    </div>
  );
}

function VideoThumbnail({ video }: { video: VideoRow }) {
  if (video.sourceType === 'YOUTUBE') {
    const thumbnailUrl = youtubeThumbnailUrl(video.source);
    if (thumbnailUrl) {
      return (
        <img
          alt={video.title || video.caption || 'YouTube video preview'}
          className="h-12 w-16 rounded-md border border-[#E2E8F0] object-cover"
          src={thumbnailUrl}
        />
      );
    }
  }

  if (video.sourceType === 'UPLOAD') {
    return (
      <video
        className="h-12 w-16 rounded-md border border-[#E2E8F0] object-cover"
        muted
        preload="metadata"
        src={adminApi.galleryVideoUrl(video)}
      />
    );
  }

  return (
    <div className="grid h-12 w-16 place-items-center rounded-md border border-[#E2E8F0] bg-[#F1F5F9] text-xs font-semibold text-[#64748B]">
      Video
    </div>
  );
}

function ImagePreviewModal({ image, onClose }: { image: ImageRow | null; onClose: () => void }) {
  if (!image) return null;

  return (
    <Modal open title={image.title || 'Preview gambar'} onClose={onClose}>
      <div className="space-y-4">
        <img
          alt={image.title || image.caption || 'Gallery image preview'}
          className="max-h-[65vh] w-full rounded-lg border border-[#E2E8F0] object-contain"
          src={adminApi.galleryImageUrl(image)}
        />
        <PreviewMeta title={image.title} caption={image.caption} path={image.path} />
      </div>
    </Modal>
  );
}

function VideoPreviewModal({ video, onClose }: { video: VideoRow | null; onClose: () => void }) {
  if (!video) return null;

  const embedUrl = video.sourceType === 'YOUTUBE' ? youtubeEmbedUrl(video.source) : null;

  return (
    <Modal open title={video.title || 'Preview video'} onClose={onClose}>
      <div className="space-y-4">
        {video.sourceType === 'YOUTUBE' && embedUrl ? (
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="aspect-video w-full rounded-lg border border-[#E2E8F0]"
            src={embedUrl}
            title={video.title || 'YouTube video preview'}
          />
        ) : video.sourceType === 'UPLOAD' ? (
          <video
            className="max-h-[65vh] w-full rounded-lg border border-[#E2E8F0]"
            controls
            src={adminApi.galleryVideoUrl(video)}
          />
        ) : (
          <div className="rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] p-6 text-sm text-[#64748B]">
            Preview tidak tersedia.
          </div>
        )}
        <PreviewMeta title={video.title} caption={video.caption} path={video.source} />
      </div>
    </Modal>
  );
}

function PreviewMeta({
  caption,
  path,
  title,
}: {
  caption: string | null;
  path: string;
  title: string | null;
}) {
  return (
    <div className="space-y-1 text-sm">
      <p className="font-semibold text-[#1C2434]">{title || '-'}</p>
      {caption ? <p className="text-[#64748B]">{caption}</p> : null}
      <p className="break-all text-xs text-[#64748B]">{path}</p>
    </div>
  );
}

function TypeBadge({ sourceType }: { sourceType: VideoType }) {
  return (
    <span className="inline-flex rounded-md bg-[#3C50E0]/10 px-2 py-1 text-xs font-semibold text-[#3C50E0]">
      {sourceType}
    </span>
  );
}

function ImageFormModal({
  editingImage,
  form,
  galleries,
  imageFile,
  isSaving,
  open,
  onClose,
  onFileChange,
  onFormChange,
  onSubmit,
}: {
  editingImage: ImageRow | null;
  form: ImageFormState;
  galleries: GalleryItem[];
  imageFile: File | null;
  isSaving: boolean;
  open: boolean;
  onClose: () => void;
  onFileChange: (file: File | null) => void;
  onFormChange: React.Dispatch<React.SetStateAction<ImageFormState>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Modal open={open} title={editingImage ? 'Ubah gambar galeri' : 'Tambah gambar galeri'} onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Judul">
            <input
              className={FIELD_CLASS}
              disabled={isSaving}
              value={form.title}
              onChange={(event) => onFormChange((current) => ({ ...current, title: event.target.value }))}
            />
          </Field>

          <Field label="Galeri">
            <select
              className={FIELD_CLASS}
              disabled={isSaving || Boolean(editingImage)}
              required
              value={form.galleryId}
              onChange={(event) => onFormChange((current) => ({ ...current, galleryId: event.target.value }))}
            >
              <option value="">Pilih galeri</option>
              {galleryOptions(galleries)}
            </select>
          </Field>

          <Field label="Path/URL">
            {editingImage ? (
              <input className={FIELD_CLASS} disabled value={form.pathUrl} />
            ) : (
              <input
                className={FIELD_CLASS}
                disabled={isSaving}
                required
                type="file"
                accept="image/*"
                onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
              />
            )}
          </Field>

          <Field label="Urutan">
            <input
              className={FIELD_CLASS}
              disabled={isSaving}
              type="number"
              value={form.sortOrder}
              onChange={(event) => onFormChange((current) => ({ ...current, sortOrder: event.target.value }))}
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Keterangan">
              <textarea
                className={`${FIELD_CLASS} min-h-28 resize-y`}
                disabled={isSaving}
                value={form.caption}
                onChange={(event) => onFormChange((current) => ({ ...current, caption: event.target.value }))}
              />
            </Field>
          </div>
        </div>

        {!editingImage && imageFile ? <p className="text-sm text-[#64748B]">{imageFile.name}</p> : null}

        <div className="flex justify-end gap-2 border-t border-[#E2E8F0] pt-4">
          <Button disabled={isSaving} type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={isSaving || (!editingImage && (!imageFile || !form.galleryId))}
            type="submit"
          >
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function VideoFormModal({
  editingVideo,
  form,
  galleries,
  isSaving,
  open,
  videoFile,
  onClose,
  onFileChange,
  onFormChange,
  onSubmit,
}: {
  editingVideo: VideoRow | null;
  form: VideoFormState;
  galleries: GalleryItem[];
  isSaving: boolean;
  open: boolean;
  videoFile: File | null;
  onClose: () => void;
  onFileChange: (file: File | null) => void;
  onFormChange: React.Dispatch<React.SetStateAction<VideoFormState>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Modal open={open} title={editingVideo ? 'Ubah video galeri' : 'Tambah video galeri'} onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Judul">
            <input
              className={FIELD_CLASS}
              disabled={isSaving}
              value={form.title}
              onChange={(event) => onFormChange((current) => ({ ...current, title: event.target.value }))}
            />
          </Field>

          <Field label="Galeri">
            <select
              className={FIELD_CLASS}
              disabled={isSaving || Boolean(editingVideo)}
              required
              value={form.galleryId}
              onChange={(event) => onFormChange((current) => ({ ...current, galleryId: event.target.value }))}
            >
              <option value="">Pilih galeri</option>
              {galleryOptions(galleries)}
            </select>
          </Field>

          <Field label="Tipe">
            <select
              className={FIELD_CLASS}
              disabled={isSaving || Boolean(editingVideo)}
              value={form.sourceType}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  pathUrl: '',
                  sourceType: event.target.value as VideoType,
                }))
              }
            >
              <option value="YOUTUBE">YOUTUBE</option>
              <option value="UPLOAD">UPLOAD</option>
            </select>
          </Field>

          <Field label="Urutan">
            <input
              className={FIELD_CLASS}
              disabled={isSaving}
              type="number"
              value={form.sortOrder}
              onChange={(event) => onFormChange((current) => ({ ...current, sortOrder: event.target.value }))}
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="URL/Path">
              {editingVideo ? (
                <input className={FIELD_CLASS} disabled value={form.pathUrl} />
              ) : form.sourceType === 'YOUTUBE' ? (
                <input
                  className={FIELD_CLASS}
                  disabled={isSaving}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                  value={form.pathUrl}
                  onChange={(event) => onFormChange((current) => ({ ...current, pathUrl: event.target.value }))}
                />
              ) : (
                <input
                  className={FIELD_CLASS}
                  disabled={isSaving}
                  required
                  type="file"
                  accept="video/*"
                  onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
                />
              )}
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Keterangan">
              <textarea
                className={`${FIELD_CLASS} min-h-28 resize-y`}
                disabled={isSaving}
                value={form.caption}
                onChange={(event) => onFormChange((current) => ({ ...current, caption: event.target.value }))}
              />
            </Field>
          </div>
        </div>

        {!editingVideo && videoFile ? <p className="text-sm text-[#64748B]">{videoFile.name}</p> : null}

        <div className="flex justify-end gap-2 border-t border-[#E2E8F0] pt-4">
          <Button disabled={isSaving} type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            disabled={
              isSaving ||
              (!editingVideo &&
                (!form.galleryId ||
                  (form.sourceType === 'UPLOAD' ? !videoFile : !form.pathUrl.trim())))
            }
            type="submit"
          >
            Simpan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
