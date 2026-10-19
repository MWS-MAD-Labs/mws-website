import { Image, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  adminApi,
  type VirtualTourDetail,
  type VirtualTourListItem,
  type VirtualTourScene,
} from '@/admin/api/adminApi';
import AppShell from '@/admin/components/layout/AppShell';
import Button from '@/admin/components/ui/Button';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';
import Select from '@/admin/components/ui/Select';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import { useToast } from '@/admin/components/ui/toastContext';
import { formatAdminDateTime } from '@/admin/utils/dateFormat';

function sceneStatus(scene: VirtualTourScene) {
  return scene.isActive
    ? 'bg-[#10B981]/10 text-[#047857] ring-[#10B981]/20'
    : 'bg-[#64748B]/10 text-[#475569] ring-[#64748B]/20';
}

export default function VirtualScenePage() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTourId = searchParams.get('tourId');
  const [tours, setTours] = useState<VirtualTourListItem[]>([]);
  const [tour, setTour] = useState<VirtualTourDetail | null>(null);
  const [isLoadingTours, setIsLoadingTours] = useState(true);
  const [isLoadingScenes, setIsLoadingScenes] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);

  const selectedTourId = useMemo(() => {
    if (requestedTourId && tours.some((item) => item.id === requestedTourId)) {
      return requestedTourId;
    }
    return tours[0]?.id ?? null;
  }, [requestedTourId, tours]);

  const reload = useCallback(() => setReloadVersion((value) => value + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function loadTours() {
      setIsLoadingTours(true);
      setLoadError(null);
      try {
        const nextTours = await adminApi.virtualTours();
        if (!cancelled) {
          setTours(nextTours);
          if (!nextTours.length) setTour(null);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load virtual tours.');
        }
      } finally {
        if (!cancelled) setIsLoadingTours(false);
      }
    }

    void loadTours();
    return () => {
      cancelled = true;
    };
  }, [reloadVersion]);

  useEffect(() => {
    if (!selectedTourId) return;

    if (requestedTourId !== selectedTourId) {
      setSearchParams({ tourId: selectedTourId }, { replace: true });
    }

    let cancelled = false;
    async function loadScenes() {
      setIsLoadingScenes(true);
      setLoadError(null);
      try {
        const nextTour = await adminApi.virtualTour(selectedTourId!);
        if (!cancelled) setTour(nextTour);
      } catch (error) {
        if (!cancelled) {
          setTour(null);
          setLoadError(error instanceof Error ? error.message : 'Failed to load tour scenes.');
        }
      } finally {
        if (!cancelled) setIsLoadingScenes(false);
      }
    }

    void loadScenes();
    return () => {
      cancelled = true;
    };
  }, [requestedTourId, selectedTourId, setSearchParams, reloadVersion]);

  function editScene(scene: VirtualTourScene) {
    navigate(
      `/admin/virtual/scene/${encodeURIComponent(scene.id)}/edit?tourId=${encodeURIComponent(scene.tourId)}`,
    );
  }

  async function makeMainScene(scene: VirtualTourScene) {
    if (!tour || tour.startSceneId === scene.id) return;
    setActionId(scene.id);
    try {
      await adminApi.updateVirtualTour(tour.id, { startSceneId: scene.id });
      showToast(`${scene.name} is now the Main Scene.`, 'success');
      reload();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to set the Main Scene.', 'error');
    } finally {
      setActionId(null);
    }
  }

  async function deleteScene(scene: VirtualTourScene) {
    if (!window.confirm(`Delete scene "${scene.name}" and all of its hotspots?`)) return;
    setActionId(scene.id);
    try {
      await adminApi.deleteVirtualTourScene(scene.tourId, scene.id);
      showToast('Scene deleted.', 'success');
      reload();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to delete scene.', 'error');
    } finally {
      setActionId(null);
    }
  }

  const isLoading = isLoadingTours || isLoadingScenes;

  return (
    <AppShell title="Virtual Tour Scenes">
      <section className="space-y-5 p-6">
        <ContentPageHeader
          breadcrumbs={[
            { label: 'Virtual Tour', path: '/admin/virtual-tour' },
            { label: 'Scenes' },
          ]}
          title="Virtual Tour Scenes"
          description="Manage panorama scenes, choose the Main Scene, and configure navigation hotspots."
          action={
            <Button
              disabled={!selectedTourId || isLoading}
              onClick={() =>
                navigate(
                  `/admin/virtual/scene/new?tourId=${encodeURIComponent(selectedTourId ?? '')}`,
                )
              }
            >
              <Plus size={15} /> Add scene
            </Button>
          }
        />

        <section className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
          <div className="grid gap-2 border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-4 md:grid-cols-[180px_minmax(0,420px)] md:items-center">
            <label className="text-sm font-semibold text-[#1C2434]" htmlFor="scene-tour">
              Virtual tour
            </label>
            <Select
              id="scene-tour"
              disabled={isLoadingTours || !tours.length}
              value={selectedTourId ?? ''}
              onChange={(event) => setSearchParams({ tourId: event.target.value })}
            >
              {!tours.length ? <option value="">No virtual tours available</option> : null}
              {tours.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </Select>
          </div>

          {isLoading ? (
            <div className="p-10 text-center text-sm text-[#64748B]">Loading scenes...</div>
          ) : loadError ? (
            <div className="grid justify-items-center gap-3 p-10 text-center">
              <StatusMessage tone="error">{loadError}</StatusMessage>
              <Button size="sm" variant="outline" onClick={reload}>
                Try again
              </Button>
            </div>
          ) : !tours.length ? (
            <div className="p-10 text-center">
              <p className="font-medium text-[#1C2434]">Create a virtual tour first.</p>
              <p className="mt-1 text-sm text-[#64748B]">
                Scenes must belong to an existing virtual tour.
              </p>
            </div>
          ) : !tour?.scenes.length ? (
            <div className="p-10 text-center">
              <p className="font-medium text-[#1C2434]">No scenes in this tour yet.</p>
              <p className="mt-1 text-sm text-[#64748B]">
                Add the first panorama scene to make it the Main Scene automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="border-b border-[#E2E8F0] bg-white">
                  <tr>
                    {['Scene', 'Status', 'Main Scene', 'Hotspots', 'Updated', 'Actions'].map(
                      (label) => (
                        <th
                          className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748B]"
                          key={label}
                        >
                          {label}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {tour.scenes.map((scene) => {
                    const isMain = tour.startSceneId === scene.id;
                    return (
                      <tr className="transition-colors hover:bg-[#F8FAFC]" key={scene.id}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="grid h-10 w-14 shrink-0 place-items-center overflow-hidden rounded bg-[#E2E8F0] text-[#64748B]">
                              <Image size={17} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-[#1C2434]">{scene.name}</p>
                              <p className="max-w-[280px] truncate text-xs text-[#64748B]">
                                {scene.description || scene.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${sceneStatus(scene)}`}
                          >
                            {scene.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#475569]">
                          {isMain ? (
                            <span className="inline-flex items-center gap-1.5 font-semibold text-[#92400E]">
                              <Star fill="currentColor" size={14} /> Main
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm tabular-nums text-[#475569]">
                          {scene.outgoingLinks.length}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-[#64748B]">
                          {formatAdminDateTime(scene.updatedAt)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            {!isMain ? (
                              <Button
                                aria-label={`Set ${scene.name} as Main Scene`}
                                className="h-11 w-11"
                                disabled={actionId === scene.id || !scene.isActive}
                                iconOnly
                                size="sm"
                                title="Set as Main Scene"
                                variant="ghost"
                                onClick={() => void makeMainScene(scene)}
                              >
                                <Star size={15} />
                              </Button>
                            ) : null}
                            <Button
                              aria-label={`Edit ${scene.name}`}
                              className="h-11 w-11"
                              disabled={actionId === scene.id}
                              iconOnly
                              size="sm"
                              title="Edit scene"
                              variant="ghost"
                              onClick={() => editScene(scene)}
                            >
                              <Pencil size={15} />
                            </Button>
                            <Button
                              aria-label={`Delete ${scene.name}`}
                              className="h-11 w-11"
                              disabled={actionId === scene.id}
                              iconOnly
                              size="sm"
                              title="Delete scene"
                              variant="ghost"
                              onClick={() => void deleteScene(scene)}
                            >
                              <Trash2 className="text-[#DC2626]" size={15} />
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
