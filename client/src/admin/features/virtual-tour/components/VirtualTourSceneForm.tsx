import { useMemo, useState, type FormEvent } from 'react';
import {
  adminApi,
  type GalleryItem,
  type VirtualTourScene,
  type VirtualTourScenePayload,
} from '@/admin/api/adminApi';
import Button from '@/admin/components/ui/Button';
import Field from '@/admin/components/ui/Field';
import SearchInput from '@/admin/components/ui/SearchInput';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import { FIELD_CLASS, optionalText, toVirtualTourSlug } from '../virtualTourUtils';

type Props = {
  galleries: GalleryItem[];
  galleryError: string | null;
  isGalleryLoading: boolean;
  isSaving: boolean;
  scene: VirtualTourScene | null;
  onCancel: () => void;
  onDirtyChange: (dirty: boolean) => void;
  onSubmit: (payload: VirtualTourScenePayload) => void;
};

type SceneForm = {
  panoramaImageId: string;
  name: string;
  slug: string;
  description: string;
  initialYaw: string;
  initialPitch: string;
  sortOrder: string;
  isActive: boolean;
};

const emptyForm: SceneForm = {
  panoramaImageId: '',
  name: '',
  slug: '',
  description: '',
  initialYaw: '0',
  initialPitch: '0',
  sortOrder: '0',
  isActive: true,
};

export default function VirtualTourSceneForm({
  galleries,
  galleryError,
  isGalleryLoading,
  isSaving,
  scene,
  onCancel,
  onDirtyChange,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<SceneForm>(() =>
    scene
      ? {
          panoramaImageId: scene.panoramaImageId,
          name: scene.name,
          slug: scene.slug,
          description: scene.description ?? '',
          initialYaw: String(scene.initialYaw),
          initialPitch: String(scene.initialPitch),
          sortOrder: String(scene.sortOrder),
          isActive: scene.isActive,
        }
      : emptyForm,
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(scene));
  const [imageSearch, setImageSearch] = useState('');
  const [panoramaRatio, setPanoramaRatio] = useState<number | null>(null);

  const images = useMemo(
    () => galleries.flatMap((gallery) => gallery.images.map((image) => ({ gallery, image }))),
    [galleries],
  );
  const filteredImages = useMemo(() => {
    const query = imageSearch.trim().toLowerCase();
    if (!query) return images;
    return images.filter(({ gallery, image }) =>
      [gallery.title, image.title ?? '', image.caption ?? '', image.path]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [imageSearch, images]);
  const selectedImage = images.find(({ image }) => image.id === form.panoramaImageId)?.image;
  const panoramaLooksValid = panoramaRatio !== null && Math.abs(panoramaRatio - 2) <= 0.15;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      panoramaImageId: form.panoramaImageId,
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: optionalText(form.description),
      initialYaw: Number(form.initialYaw),
      initialPitch: Number(form.initialPitch),
      sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
      isActive: form.isActive,
    });
  }

  return (
    <form className="grid gap-5" onChange={() => onDirtyChange(true)} onSubmit={submit}>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid content-start gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Scene name" required>
              <input
                className={FIELD_CLASS}
                disabled={isSaving}
                maxLength={255}
                required
                value={form.name}
                onChange={(event) => {
                  const name = event.target.value;
                  setForm((current) => ({
                    ...current,
                    name,
                    slug: slugTouched ? current.slug : toVirtualTourSlug(name),
                  }));
                }}
              />
            </Field>
            <Field label="Slug" required>
              <input
                className={FIELD_CLASS}
                disabled={isSaving}
                maxLength={255}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                required
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setForm((current) => ({ ...current, slug: toVirtualTourSlug(event.target.value) }));
                }}
              />
            </Field>
          </div>

          <Field
            as="div"
            label="Panorama image"
            hint="Choose a 2:1 equirectangular image from Gallery. The preview checks its proportions."
            required
          >
            <div className="grid gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
              <SearchInput
                aria-label="Search Gallery images"
                disabled={isSaving || isGalleryLoading || Boolean(galleryError)}
                placeholder="Search Gallery images..."
                value={imageSearch}
                onChange={(event) => {
                  event.stopPropagation();
                  setImageSearch(event.target.value);
                }}
              />

              {isGalleryLoading ? (
                <div className="p-6 text-center text-sm text-[#475569]">Loading Gallery images...</div>
              ) : galleryError ? (
                <StatusMessage tone="error">{galleryError}</StatusMessage>
              ) : !filteredImages.length ? (
                <div className="p-6 text-center text-sm text-[#475569]">
                  {images.length ? 'No Gallery images match this search.' : 'No Gallery images available.'}
                </div>
              ) : (
                <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
                  {filteredImages.map(({ gallery, image }) => {
                    const selected = image.id === form.panoramaImageId;
                    return (
                      <button
                        aria-pressed={selected}
                        className={`overflow-hidden rounded-lg border bg-white text-left transition focus:outline-none focus:ring-2 focus:ring-[#3C50E0]/30 ${
                          selected ? 'border-[#3C50E0] ring-1 ring-[#3C50E0]' : 'border-[#E2E8F0] hover:border-[#94A3B8]'
                        }`}
                        disabled={isSaving}
                        key={image.id}
                        type="button"
                        onClick={() => {
                          onDirtyChange(true);
                          setPanoramaRatio(null);
                          setForm((current) => ({ ...current, panoramaImageId: image.id }));
                        }}
                      >
                        <img
                          alt=""
                          className="aspect-video w-full bg-[#E2E8F0] object-cover"
                          loading="lazy"
                          src={adminApi.galleryImageUrl(image)}
                        />
                        <span className="block truncate px-2 pt-2 text-xs font-semibold text-[#1C2434]">
                          {image.title || image.caption || 'Untitled image'}
                        </span>
                        <span className="block truncate px-2 pb-2 text-[11px] text-[#475569]">
                          {gallery.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Field>

          <Field label="Description">
            <textarea
              className={`${FIELD_CLASS} min-h-24 resize-y`}
              disabled={isSaving}
              maxLength={5000}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Initial yaw" hint="-180 to 180 degrees" optional={false}>
              <input
                className={FIELD_CLASS}
                disabled={isSaving}
                max={180}
                min={-180}
                required
                step="0.1"
                type="number"
                value={form.initialYaw}
                onChange={(event) =>
                  setForm((current) => ({ ...current, initialYaw: event.target.value }))
                }
              />
            </Field>
            <Field label="Initial pitch" hint="-90 to 90 degrees" optional={false}>
              <input
                className={FIELD_CLASS}
                disabled={isSaving}
                max={90}
                min={-90}
                required
                step="0.1"
                type="number"
                value={form.initialPitch}
                onChange={(event) =>
                  setForm((current) => ({ ...current, initialPitch: event.target.value }))
                }
              />
            </Field>
            <Field label="Sort order" optional={false}>
              <input
                className={FIELD_CLASS}
                disabled={isSaving}
                required
                type="number"
                value={form.sortOrder}
                onChange={(event) =>
                  setForm((current) => ({ ...current, sortOrder: event.target.value }))
                }
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-[#1C2434]">
            <input
              checked={form.isActive}
              disabled={isSaving}
              type="checkbox"
              onChange={(event) =>
                setForm((current) => ({ ...current, isActive: event.target.checked }))
              }
            />
            Active in the public tour
          </label>
        </div>

        <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="aspect-video bg-[#E2E8F0]">
            {selectedImage ? (
              <img
                alt={selectedImage.title || selectedImage.caption || 'Selected panorama'}
                className="h-full w-full object-cover"
                src={adminApi.galleryImageUrl(selectedImage)}
                onLoad={(event) => {
                  const image = event.currentTarget;
                  setPanoramaRatio(image.naturalWidth / image.naturalHeight);
                }}
              />
            ) : (
              <div className="grid h-full place-items-center px-6 text-center text-sm text-[#64748B]">
                Select a Gallery image to preview the panorama.
              </div>
            )}
          </div>
          <div className="px-4 py-3">
            <p className="text-sm font-semibold text-[#1C2434]">
              {selectedImage?.title || selectedImage?.caption || 'No image selected'}
            </p>
            <p className="mt-1 truncate text-xs text-[#64748B]">
              {selectedImage?.path || 'Gallery panorama preview'}
            </p>
            {selectedImage && panoramaRatio !== null ? (
              <p className={`mt-2 text-xs font-medium ${panoramaLooksValid ? 'text-[#047857]' : 'text-[#92400E]'}`}>
                {panoramaLooksValid
                  ? `2:1 panorama ratio detected (${panoramaRatio.toFixed(2)}:1).`
                  : `Image ratio is ${panoramaRatio.toFixed(2)}:1; a 2:1 panorama is recommended.`}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-[#E2E8F0] pt-4">
        <Button disabled={isSaving} type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          disabled={isSaving || !form.name.trim() || !form.slug.trim() || !form.panoramaImageId}
          type="submit"
        >
          {isSaving ? 'Saving...' : scene ? 'Update scene' : 'Create scene'}
        </Button>
      </div>
    </form>
  );
}
