import { Check, ImagePlus, MapPin, Pencil, Save, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent, type MouseEvent } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  adminApi,
  type GalleryImageItem,
  type GalleryItem,
  type VirtualTourDetail,
  type VirtualTourLink,
  type VirtualTourListItem,
  type VirtualTourScene,
  type VirtualTourScenePayload,
} from '@/admin/api/adminApi';
import AppShell from '@/admin/components/layout/AppShell';
import Button from '@/admin/components/ui/Button';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';
import Field from '@/admin/components/ui/Field';
import SearchInput from '@/admin/components/ui/SearchInput';
import Select from '@/admin/components/ui/Select';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import { useToast } from '@/admin/components/ui/toastContext';
import { useUnsavedChangesGuard } from '@/admin/hooks/useUnsavedChangesGuard';
import { FIELD_CLASS, optionalText, sceneImagePath, toVirtualTourSlug } from '../virtualTourUtils';

type SceneForm = {
  tourId: string;
  panoramaImageId: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  setAsMain: boolean;
};

type HotspotRow = {
  id: string;
  persisted: boolean;
  toSceneId: string;
  label: string;
  yaw: number;
  pitch: number;
  sortOrder: number;
};

type HotspotForm = {
  id: string | null;
  toSceneId: string;
  label: string;
  yaw: number;
  pitch: number;
};

function linkToRow(link: VirtualTourLink): HotspotRow {
  return {
    id: link.id,
    persisted: true,
    toSceneId: link.toSceneId,
    label: link.label ?? '',
    yaw: link.yaw,
    pitch: link.pitch,
    sortOrder: link.sortOrder,
  };
}

function roundedCoordinate(value: number) {
  return Math.round(value * 10) / 10;
}

export default function VirtualSceneCreateUpdate() {
  const navigate = useNavigate();
  const showToast = useToast();
  const { sceneId } = useParams<{ sceneId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTourId = searchParams.get('tourId');
  const [tours, setTours] = useState<VirtualTourListItem[]>([]);
  const [tour, setTour] = useState<VirtualTourDetail | null>(null);
  const [scene, setScene] = useState<VirtualTourScene | null>(null);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [form, setForm] = useState<SceneForm | null>(null);
  const [hotspots, setHotspots] = useState<HotspotRow[]>([]);
  const [hotspotForm, setHotspotForm] = useState<HotspotForm | null>(null);
  const [imageSearch, setImageSearch] = useState('');
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(!sceneId);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useUnsavedChangesGuard(isDirty && !isSaving);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [nextTours, nextGalleries] = await Promise.all([
          adminApi.virtualTours(),
          adminApi.galleries(),
        ]);
        if (cancelled) return;

        setTours(nextTours);
        setGalleries(nextGalleries);

        let selectedTour: VirtualTourDetail | null = null;
        if (requestedTourId && nextTours.some((item) => item.id === requestedTourId)) {
          selectedTour = await adminApi.virtualTour(requestedTourId);
        } else if (sceneId) {
          const details = await Promise.all(nextTours.map((item) => adminApi.virtualTour(item.id)));
          selectedTour =
            details.find((item) => item.scenes.some((entry) => entry.id === sceneId)) ?? null;
        } else if (nextTours[0]) {
          selectedTour = await adminApi.virtualTour(nextTours[0].id);
        }

        if (cancelled) return;
        if (!selectedTour) {
          throw new Error(
            sceneId ? 'Scene was not found.' : 'Create a virtual tour before adding scenes.',
          );
        }

        const selectedScene = sceneId
          ? (selectedTour.scenes.find((item) => item.id === sceneId) ?? null)
          : null;
        if (sceneId && !selectedScene) throw new Error('Scene was not found in this virtual tour.');

        const isMain = selectedScene
          ? selectedTour.startSceneId === selectedScene.id
          : selectedTour.scenes.length === 0;
        setTour(selectedTour);
        setScene(selectedScene);
        setHotspots(selectedScene?.outgoingLinks.map(linkToRow) ?? []);
        setForm({
          tourId: selectedTour.id,
          panoramaImageId: selectedScene?.panoramaImageId ?? '',
          name: selectedScene?.name ?? '',
          slug: selectedScene?.slug ?? '',
          description: selectedScene?.description ?? '',
          isActive: selectedScene?.isActive ?? true,
          setAsMain: isMain,
        });
        setIsImagePickerOpen(!selectedScene);
        setIsDirty(false);

        if (requestedTourId !== selectedTour.id) {
          setSearchParams({ tourId: selectedTour.id }, { replace: true });
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load scene data.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [requestedTourId, sceneId, setSearchParams]);

  const images = useMemo(
    () => galleries.flatMap((gallery) => gallery.images.map((image) => ({ gallery, image }))),
    [galleries],
  );
  const selectedImage = images.find(({ image }) => image.id === form?.panoramaImageId)?.image;
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

  const isMainScene = Boolean(
    form &&
    (form.setAsMain || (!scene && tour?.scenes.length === 0) || tour?.startSceneId === scene?.id),
  );
  const targetScenes = tour?.scenes.filter((item) => item.id !== scene?.id) ?? [];

  function updateForm<K extends keyof SceneForm>(key: K, value: SceneForm[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setIsDirty(true);
  }

  function cancelPage() {
    if (isDirty && !window.confirm('Discard unsaved scene changes?')) return;
    navigate(
      `/admin/virtual/scene?tourId=${encodeURIComponent(form?.tourId ?? requestedTourId ?? '')}`,
    );
  }

  function selectImage(image: GalleryImageItem) {
    updateForm('panoramaImageId', image.id);
    setIsImagePickerOpen(false);
    setHotspotForm(null);
  }

  function chooseCoordinate(event: MouseEvent<HTMLImageElement>) {
    if (!form?.panoramaImageId || isSaving) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.min(Math.max((event.clientX - bounds.left) / bounds.width, 0), 1);
    const y = Math.min(Math.max((event.clientY - bounds.top) / bounds.height, 0), 1);
    const yaw = roundedCoordinate(x * 360 - 180);
    const pitch = roundedCoordinate(90 - y * 180);
    const firstTarget = targetScenes[0]?.id ?? '';
    setHotspotForm({ id: null, toSceneId: firstTarget, label: '', yaw, pitch });
  }

  function editHotspot(row: HotspotRow) {
    setHotspotForm({
      id: row.id,
      toSceneId: row.toSceneId,
      label: row.label,
      yaw: row.yaw,
      pitch: row.pitch,
    });
  }

  async function refreshTour(tourId: string, currentSceneId: string) {
    const nextTour = await adminApi.virtualTour(tourId);
    const nextScene = nextTour.scenes.find((item) => item.id === currentSceneId) ?? null;
    setTour(nextTour);
    setScene(nextScene);
    setHotspots(nextScene?.outgoingLinks.map(linkToRow) ?? []);
  }

  async function saveHotspot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hotspotForm || !hotspotForm.toSceneId) return;

    const existing = hotspotForm.id
      ? (hotspots.find((item) => item.id === hotspotForm.id) ?? null)
      : null;
    const payload = {
      toSceneId: hotspotForm.toSceneId,
      label: optionalText(hotspotForm.label),
      yaw: hotspotForm.yaw,
      pitch: hotspotForm.pitch,
      sortOrder: existing?.sortOrder ?? hotspots.length,
    };

    setIsSaving(true);
    try {
      if (scene && tour) {
        if (existing?.persisted) {
          await adminApi.updateVirtualTourLink(tour.id, scene.id, existing.id, payload);
        } else {
          await adminApi.createVirtualTourLink(tour.id, scene.id, payload);
        }
        await refreshTour(tour.id, scene.id);
        showToast(existing ? 'Hotspot updated.' : 'Hotspot saved.', 'success');
      } else {
        const id = existing?.id ?? `draft-${crypto.randomUUID()}`;
        const row: HotspotRow = {
          id,
          persisted: false,
          ...payload,
          label: hotspotForm.label.trim(),
        };
        setHotspots((current) =>
          existing
            ? current.map((item) => (item.id === existing.id ? row : item))
            : [...current, row],
        );
        setIsDirty(true);
      }
      setHotspotForm(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save hotspot.', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteHotspot(row: HotspotRow) {
    if (!window.confirm('Delete this hotspot?')) return;
    setIsSaving(true);
    try {
      if (row.persisted && scene && tour) {
        await adminApi.deleteVirtualTourLink(tour.id, scene.id, row.id);
        await refreshTour(tour.id, scene.id);
        showToast('Hotspot deleted.', 'success');
      } else {
        setHotspots((current) => current.filter((item) => item.id !== row.id));
        setIsDirty(true);
      }
      if (hotspotForm?.id === row.id) setHotspotForm(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to delete hotspot.', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  async function saveScene() {
    if (!form || !form.tourId || !form.panoramaImageId || !form.name.trim()) return;

    const payload: VirtualTourScenePayload = {
      panoramaImageId: form.panoramaImageId,
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: optionalText(form.description),
      initialYaw: scene?.initialYaw ?? 0,
      initialPitch: scene?.initialPitch ?? 0,
      sortOrder: scene?.sortOrder ?? tour?.scenes.length ?? 0,
      isActive: form.isActive,
    };

    setIsSaving(true);
    try {
      const savedScene = scene
        ? await adminApi.updateVirtualTourScene(form.tourId, scene.id, payload)
        : await adminApi.createVirtualTourScene(form.tourId, payload);

      if (form.setAsMain && form.isActive && tour.startSceneId !== savedScene.id) {
        await adminApi.updateVirtualTour(form.tourId, { startSceneId: savedScene.id });
      }

      if (!scene) {
        for (const hotspot of hotspots) {
          await adminApi.createVirtualTourLink(form.tourId, savedScene.id, {
            toSceneId: hotspot.toSceneId,
            label: optionalText(hotspot.label),
            yaw: hotspot.yaw,
            pitch: hotspot.pitch,
            sortOrder: hotspot.sortOrder,
          });
        }
      }

      showToast(scene ? 'Scene updated.' : 'Scene created.', 'success');
      setIsDirty(false);
      navigate(`/admin/virtual/scene?tourId=${encodeURIComponent(form.tourId)}`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save scene.', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <AppShell title={sceneId ? 'Edit Scene' : 'Create Scene'}>
        <div className="p-10 text-center text-sm text-[#64748B]">Loading scene editor...</div>
      </AppShell>
    );
  }

  if (loadError || !form || !tour) {
    return (
      <AppShell title={sceneId ? 'Edit Scene' : 'Create Scene'}>
        <div className="grid justify-items-center gap-4 p-10 text-center">
          <StatusMessage tone="error">{loadError ?? 'Scene data is unavailable.'}</StatusMessage>
          <Button variant="outline" onClick={() => navigate('/admin/virtual-tour')}>
            Back to Virtual Tour
          </Button>
        </div>
      </AppShell>
    );
  }

  const previewUrl = selectedImage
    ? adminApi.galleryImagePublicPath(selectedImage)
    : scene
      ? sceneImagePath(scene.panoramaImage.path, scene.panoramaImage.id)
      : '';
  const activeMarker = hotspotForm
    ? {
        left: `${((hotspotForm.yaw + 180) / 360) * 100}%`,
        top: `${((90 - hotspotForm.pitch) / 180) * 100}%`,
      }
    : null;

  return (
    <AppShell title={scene ? 'Edit Scene' : 'Create Scene'}>
      <section className="space-y-5 p-6">
        <ContentPageHeader
          breadcrumbs={[
            { label: 'Virtual Tour', path: '/admin/virtual-tour' },
            {
              label: 'Scenes',
              path: `/admin/virtual/scene?tourId=${encodeURIComponent(form.tourId)}`,
            },
            { label: scene ? 'Edit' : 'Create' },
          ]}
          title={scene ? `Edit ${scene.name}` : 'Create Scene'}
          description="Set the scene information, panorama, and navigation hotspots."
          action={
            <div className="flex gap-2">
              <Button disabled={isSaving} variant="outline" onClick={cancelPage}>
                Cancel
              </Button>
              <Button
                disabled={
                  isSaving || !form.name.trim() || !form.slug.trim() || !form.panoramaImageId
                }
                onClick={() => void saveScene()}
              >
                <Save size={15} /> {isSaving ? 'Saving...' : 'Save scene'}
              </Button>
            </div>
          }
        />

        <section className="grid gap-5 rounded-lg border border-[#E2E8F0] bg-white p-5 lg:grid-cols-2">
          <Field label="Virtual tour" required>
            <Select
              disabled={Boolean(scene) || isSaving}
              required
              value={form.tourId}
              onChange={(event) => {
                if (isDirty && !window.confirm('Discard changes and switch virtual tour?')) return;
                setSearchParams({ tourId: event.target.value });
              }}
            >
              {tours.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Scene name" required>
            <input
              className={FIELD_CLASS}
              disabled={isSaving}
              maxLength={255}
              required
              value={form.name}
              onChange={(event) => {
                const nextName = event.target.value;
                setForm((current) =>
                  current
                    ? {
                        ...current,
                        name: nextName,
                        slug: scene ? current.slug : toVirtualTourSlug(nextName),
                      }
                    : current,
                );
                setIsDirty(true);
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
              onChange={(event) => updateForm('slug', toVirtualTourSlug(event.target.value))}
            />
          </Field>
          <Field label="Status" optional={false}>
            <Select
              disabled={isSaving}
              value={form.isActive ? 'active' : 'inactive'}
              onChange={(event) => updateForm('isActive', event.target.value === 'active')}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </Field>
          <div className="lg:col-span-2">
            <Field label="Description">
              <textarea
                className={`${FIELD_CLASS} min-h-28 resize-y`}
                disabled={isSaving}
                maxLength={5000}
                value={form.description}
                onChange={(event) => updateForm('description', event.target.value)}
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-[#1C2434] lg:col-span-2">
            <input
              checked={form.setAsMain}
              disabled={isSaving || tour.startSceneId === scene?.id || tour.scenes.length === 0}
              type="checkbox"
              onChange={(event) => {
                updateForm('setAsMain', event.target.checked);
                if (event.target.checked) updateForm('isActive', true);
              }}
            />
            Set as Main Scene
            {tour.startSceneId === scene?.id ? (
              <span className="text-xs font-normal text-[#64748B]">(current Main Scene)</span>
            ) : null}
          </label>
        </section>

        <section className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] px-5 py-4">
            <div>
              <h2 className="font-semibold text-[#1C2434]">Panorama & hotspot position</h2>
              <p className="mt-1 text-sm text-[#64748B]">
                Click the panorama to select yaw and pitch, then complete the hotspot form.
              </p>
            </div>
            <Button
              disabled={isSaving}
              size="sm"
              variant="outline"
              onClick={() => setIsImagePickerOpen((open) => !open)}
            >
              <ImagePlus size={15} /> {form.panoramaImageId ? 'Change image' : 'Choose image'}
            </Button>
          </div>

          {isImagePickerOpen ? (
            <div className="grid gap-3 border-b border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <SearchInput
                aria-label="Search Gallery images"
                placeholder="Search Gallery images..."
                value={imageSearch}
                onChange={(event) => setImageSearch(event.target.value)}
              />
              {!filteredImages.length ? (
                <p className="p-5 text-center text-sm text-[#64748B]">
                  {images.length ? 'No images match this search.' : 'No Gallery images available.'}
                </p>
              ) : (
                <div className="grid max-h-72 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 lg:grid-cols-5">
                  {filteredImages.map(({ gallery, image }) => {
                    const selected = image.id === form.panoramaImageId;
                    return (
                      <button
                        aria-pressed={selected}
                        className={`overflow-hidden rounded-lg border bg-white text-left transition ${
                          selected
                            ? 'border-[#3C50E0] ring-2 ring-[#3C50E0]/20'
                            : 'border-[#E2E8F0] hover:border-[#94A3B8]'
                        }`}
                        key={image.id}
                        type="button"
                        onClick={() => selectImage(image)}
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
                        <span className="block truncate px-2 pb-2 text-[11px] text-[#64748B]">
                          {gallery.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}

          <div className="grid gap-0 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.7fr)]">
            <div className="relative min-h-64 overflow-hidden bg-[#0F172A]">
              {previewUrl ? (
                <>
                  <img
                    alt={selectedImage?.title || scene?.name || 'Scene panorama'}
                    className="block w-full cursor-crosshair select-none"
                    draggable={false}
                    src={previewUrl}
                    onClick={chooseCoordinate}
                  />
                  {activeMarker ? (
                    <span
                      aria-label={`Selected hotspot at yaw ${hotspotForm?.yaw}, pitch ${hotspotForm?.pitch}`}
                      className="pointer-events-none absolute -translate-x-1/2 -translate-y-full text-[#EF4444] drop-shadow"
                      style={activeMarker}
                    >
                      <MapPin fill="currentColor" size={30} />
                    </span>
                  ) : null}
                </>
              ) : (
                <div className="grid min-h-64 place-items-center p-8 text-center text-sm text-[#CBD5E1]">
                  Choose a panorama image to start placing hotspots.
                </div>
              )}
            </div>

            <div className="border-t border-[#E2E8F0] p-5 xl:border-l xl:border-t-0">
              {!hotspotForm ? (
                <div className="grid h-full min-h-52 place-items-center text-center">
                  <div>
                    <MapPin className="mx-auto text-[#94A3B8]" size={28} />
                    <p className="mt-2 font-medium text-[#1C2434]">Select a hotspot position</p>
                    <p className="mt-1 text-sm text-[#64748B]">
                      Click anywhere on the panorama or edit an existing hotspot.
                    </p>
                  </div>
                </div>
              ) : (
                <form className="grid gap-4" onSubmit={(event) => void saveHotspot(event)}>
                  <div className="grid grid-cols-2 gap-3 rounded-lg bg-[#F1F5F9] p-3 text-sm">
                    <div>
                      <span className="block text-xs text-[#64748B]">Yaw</span>
                      <strong className="tabular-nums text-[#1C2434]">{hotspotForm.yaw}°</strong>
                    </div>
                    <div>
                      <span className="block text-xs text-[#64748B]">Pitch</span>
                      <strong className="tabular-nums text-[#1C2434]">{hotspotForm.pitch}°</strong>
                    </div>
                  </div>
                  <Field label="Label">
                    <input
                      className={FIELD_CLASS}
                      disabled={isSaving}
                      maxLength={255}
                      placeholder="Example: Go to library"
                      value={hotspotForm.label}
                      onChange={(event) =>
                        setHotspotForm((current) =>
                          current ? { ...current, label: event.target.value } : current,
                        )
                      }
                    />
                  </Field>
                  <Field
                    label="Leads to Scene"
                    hint={isMainScene ? 'Disabled because this is the Main Scene.' : undefined}
                    required
                  >
                    <Select
                      disabled={isSaving || isMainScene}
                      required
                      value={hotspotForm.toSceneId}
                      onChange={(event) =>
                        setHotspotForm((current) =>
                          current ? { ...current, toSceneId: event.target.value } : current,
                        )
                      }
                    >
                      <option value="">Select destination</option>
                      {targetScenes.map((target) => (
                        <option key={target.id} value={target.id}>
                          {target.name}
                          {target.isActive ? '' : ' (inactive)'}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  {!targetScenes.length ? (
                    <StatusMessage tone="warning">
                      Add another scene before creating a navigation hotspot.
                    </StatusMessage>
                  ) : null}
                  <div className="flex justify-end gap-2">
                    <Button
                      disabled={isSaving}
                      size="sm"
                      variant="outline"
                      onClick={() => setHotspotForm(null)}
                    >
                      <X size={14} /> Cancel
                    </Button>
                    <Button
                      disabled={
                        isSaving || !hotspotForm.toSceneId || (isMainScene && !hotspotForm.id)
                      }
                      size="sm"
                      type="submit"
                    >
                      <Check size={14} /> Save
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
          <div className="border-b border-[#E2E8F0] px-5 py-4">
            <h2 className="font-semibold text-[#1C2434]">Hotspots</h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Navigation points configured for this scene.
            </p>
          </div>
          {!hotspots.length ? (
            <div className="p-8 text-center text-sm text-[#64748B]">No hotspots yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-[#F8FAFC] text-xs font-semibold uppercase text-[#475569]">
                  <tr>
                    <th className="px-5 py-3">Leads to</th>
                    <th className="px-5 py-3">Label</th>
                    <th className="px-5 py-3">Yaw</th>
                    <th className="px-5 py-3">Pitch</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {hotspots.map((row) => {
                    const target = targetScenes.find((item) => item.id === row.toSceneId);
                    return (
                      <tr key={row.id}>
                        <td className="px-5 py-3 font-medium text-[#1C2434]">
                          {target?.name ?? 'Unknown scene'}
                        </td>
                        <td className="px-5 py-3 text-[#64748B]">{row.label || '-'}</td>
                        <td className="px-5 py-3 tabular-nums text-[#64748B]">{row.yaw}°</td>
                        <td className="px-5 py-3 tabular-nums text-[#64748B]">{row.pitch}°</td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-1">
                            <Button
                              aria-label="Edit hotspot"
                              className="h-11 w-11"
                              disabled={isSaving}
                              iconOnly
                              size="sm"
                              title="Edit hotspot"
                              variant="ghost"
                              onClick={() => editHotspot(row)}
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              aria-label="Delete hotspot"
                              className="h-11 w-11"
                              disabled={isSaving}
                              iconOnly
                              size="sm"
                              title="Delete hotspot"
                              variant="ghost"
                              onClick={() => void deleteHotspot(row)}
                            >
                              <Trash2 className="text-[#DC2626]" size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </AppShell>
  );
}
