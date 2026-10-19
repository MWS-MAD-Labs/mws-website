import { Save } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  adminApi,
  type GalleryItem,
  type VirtualTourDetail,
  type VirtualTourListItem,
  type VirtualTourScene,
  type VirtualTourScenePayload,
} from '@/admin/api/adminApi';
import type { GalleryAssetSelection } from '@/admin/features/gallery/components/GalleryAssetPickerModal';
import AppShell from '@/admin/components/layout/AppShell';
import Button from '@/admin/components/ui/Button';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import { useToast } from '@/admin/components/ui/toastContext';
import { uploadImageForPicker } from '@/admin/features/gallery/utils/uploadImageForPicker';
import { useUnsavedChangesGuard } from '@/admin/hooks/useUnsavedChangesGuard';
import { optionalText, sceneImagePath } from '../virtualTourUtils';
import PanoramaPick from './components/PanoramaPick';
import SceneDetailsForm from './components/SceneDetailsForm';
import SceneHotspotTable from './SceneHotspotTable';
import {
  createHotspotForm,
  hotspotRowFromLink,
  roundedCoordinate,
  sceneFormFromScene,
  type HotspotForm,
  type HotspotRow,
  type SceneForm,
} from './sceneEditorModel';

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
        setHotspots(selectedScene?.outgoingLinks.map(hotspotRowFromLink) ?? []);
        setForm(sceneFormFromScene(selectedTour.id, selectedScene, isMain));
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

  const selectedImage = useMemo(
    () =>
      galleries
        .flatMap((gallery) => gallery.images)
        .find((image) => image.id === form?.panoramaImageId),
    [form?.panoramaImageId, galleries],
  );

  const targetScenes = tour?.scenes.filter((item) => item.id !== scene?.id) ?? [];

  function updateForm<K extends keyof SceneForm>(key: K, value: SceneForm[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setIsDirty(true);
  }

  function updateSceneDetails(changes: Partial<SceneForm>) {
    setForm((current) => (current ? { ...current, ...changes } : current));
    setIsDirty(true);
  }

  function changeTour(tourId: string) {
    if (isDirty && !window.confirm('Discard changes and switch virtual tour?')) return;
    setSearchParams({ tourId });
  }

  function cancelPage() {
    if (isDirty && !window.confirm('Discard unsaved scene changes?')) return;
    navigate(
      `/admin/virtual/scene?tourId=${encodeURIComponent(form?.tourId ?? requestedTourId ?? '')}`,
    );
  }

  function selectPanorama(asset: GalleryAssetSelection) {
    if (asset.kind !== 'IMAGE') return;
    updateForm('panoramaImageId', asset.id);
    setHotspotForm(null);
  }

  async function uploadPanorama(file: File) {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const uploaded = await uploadImageForPicker({
        fallbackGalleryDescription: 'Panorama images uploaded from the Virtual Tour scene editor.',
        fallbackGalleryTitle: 'Virtual Tour Uploads',
        file,
        galleries,
      });

      setGalleries(uploaded.galleries);
      selectPanorama({
        alt: uploaded.alt,
        galleryId: uploaded.galleryId,
        id: uploaded.image.id,
        kind: 'IMAGE',
        label: uploaded.alt,
        path: uploaded.path,
      });
      showToast('Panorama uploaded and selected.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to upload panorama.', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  function chooseCoordinate(yaw: number, pitch: number) {
    if (!form?.panoramaImageId || isSaving) return;
    const firstTarget = targetScenes[0]?.id ?? '';
    setHotspotForm({
      id: null,
      toSceneId: firstTarget,
      label: '',
      yaw: roundedCoordinate(yaw),
      pitch: roundedCoordinate(pitch),
    });
  }

  function editHotspot(row: HotspotRow) {
    setHotspotForm(createHotspotForm(row));
  }

  async function refreshTour(tourId: string, currentSceneId: string) {
    const nextTour = await adminApi.virtualTour(tourId);
    const nextScene = nextTour.scenes.find((item) => item.id === currentSceneId) ?? null;
    setTour(nextTour);
    setScene(nextScene);
    setHotspots(nextScene?.outgoingLinks.map(hotspotRowFromLink) ?? []);
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
    if (!form || !tour || !form.tourId || !form.panoramaImageId || !form.name.trim()) return;

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
    ? adminApi.publicAssetUrl(adminApi.galleryImagePublicPath(selectedImage))
    : scene
      ? adminApi.publicAssetUrl(sceneImagePath(scene.panoramaImage.path, scene.panoramaImage.id))
      : '';
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

        <SceneDetailsForm
          form={form}
          isSaving={isSaving}
          scene={scene}
          tour={tour}
          tours={tours}
          onTourChange={changeTour}
          onUpdate={updateSceneDetails}
        />

        <PanoramaPick
          galleries={galleries}
          hotspotForm={hotspotForm}
          isImagePickerOpen={isImagePickerOpen}
          isSaving={isSaving}
          previewUrl={previewUrl}
          scene={scene}
          selectedImage={selectedImage}
          targetScenes={targetScenes}
          onCancelHotspot={() => setHotspotForm(null)}
          onChooseCoordinate={chooseCoordinate}
          onCloseImagePicker={() => setIsImagePickerOpen(false)}
          onHotspotChange={(changes) =>
            setHotspotForm((current) => (current ? { ...current, ...changes } : current))
          }
          onSaveHotspot={(event) => void saveHotspot(event)}
          onSelectPanorama={selectPanorama}
          onToggleImagePicker={() => setIsImagePickerOpen((open) => !open)}
          onUploadLocalImage={(file) => void uploadPanorama(file)}
        />

        <SceneHotspotTable
          hotspots={hotspots}
          isSaving={isSaving}
          targetScenes={targetScenes}
          onDelete={(hotspot) => void deleteHotspot(hotspot)}
          onEdit={editHotspot}
        />
      </section>
    </AppShell>
  );
}
