import { ArrowLeft, Link2, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  adminApi,
  type GalleryItem,
  type VirtualTourLink,
  type VirtualTourLinkPayload,
  type VirtualTourScene,
  type VirtualTourScenePayload,
} from '@/admin/api/adminApi';
import Button from '@/admin/components/ui/Button';
import Modal from '@/admin/components/ui/Modal';
import StatusBadge from '@/admin/components/ui/StatusBadge';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import { useToast } from '@/admin/components/ui/toastContext';
import { useVirtualTourDetail } from '../hooks/useVirtualTours';
import { sceneImagePath } from '../virtualTourUtils';
import VirtualTourLinks from './VirtualTourLinks';
import VirtualTourSceneForm from './VirtualTourSceneForm';

type Props = {
  galleries: GalleryItem[];
  galleryError: string | null;
  isGalleryLoading: boolean;
  open: boolean;
  tourId: string | null;
  onClose: () => void;
  onRetryGalleries: () => Promise<void>;
  onTourChanged: () => Promise<void>;
};

type View = 'scenes' | 'scene-form' | 'links';

export default function VirtualTourManagerModal({
  galleries,
  galleryError,
  isGalleryLoading,
  open,
  tourId,
  onClose,
  onRetryGalleries,
  onTourChanged,
}: Props) {
  const showToast = useToast();
  const detail = useVirtualTourDetail(open ? tourId : null, onTourChanged);
  const [view, setView] = useState<View>('scenes');
  const [editingScene, setEditingScene] = useState<VirtualTourScene | null>(null);
  const [linkSceneId, setLinkSceneId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isEditorDirty, setIsEditorDirty] = useState(false);

  const linkScene = detail.tour?.scenes.find((scene) => scene.id === linkSceneId) ?? null;

  function openCreateScene() {
    setEditingScene(null);
    setView('scene-form');
    setIsEditorDirty(false);
  }

  function openEditScene(scene: VirtualTourScene) {
    setEditingScene(scene);
    setView('scene-form');
    setIsEditorDirty(false);
  }

  function openLinks(scene: VirtualTourScene) {
    setLinkSceneId(scene.id);
    setView('links');
    setIsEditorDirty(false);
  }

  function returnToScenes() {
    if (isEditorDirty && !window.confirm('Discard unsaved changes?')) return;
    setIsEditorDirty(false);
    setView('scenes');
  }

  function requestClose() {
    if (isEditorDirty && !window.confirm('Discard unsaved changes?')) return;
    onClose();
  }

  async function saveScene(payload: VirtualTourScenePayload) {
    setIsSaving(true);
    try {
      const refreshFailed = await detail.saveScene(editingScene, payload);
      showToast(editingScene ? 'Scene updated.' : 'Scene created.', 'success');
      if (refreshFailed) showToast('Scene saved, but current data could not be refreshed.', 'warning');
      setView('scenes');
      setEditingScene(null);
      setIsEditorDirty(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save scene.', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteScene(scene: VirtualTourScene) {
    if (!window.confirm(`Delete scene "${scene.name}" and all of its links?`)) return;
    setDeletingId(scene.id);
    try {
      const refreshFailed = await detail.deleteScene(scene.id);
      showToast('Scene deleted.', 'success');
      if (refreshFailed) showToast('Scene deleted, but current data could not be refreshed.', 'warning');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to delete scene.', 'error');
    } finally {
      setDeletingId(null);
    }
  }

  async function setStartScene(scene: VirtualTourScene) {
    setIsSaving(true);
    try {
      const refreshFailed = await detail.setStartScene(scene.id);
      showToast(`${scene.name} is now the start scene.`, 'success');
      if (refreshFailed) showToast('Start scene changed, but current data could not be refreshed.', 'warning');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to set start scene.', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  async function saveLink(link: VirtualTourLink | null, payload: VirtualTourLinkPayload) {
    if (!linkScene) return false;
    setIsSaving(true);
    try {
      const refreshFailed = await detail.saveLink(linkScene.id, link, payload);
      showToast(link ? 'Scene link updated.' : 'Scene link created.', 'success');
      if (refreshFailed) showToast('Link saved, but current data could not be refreshed.', 'warning');
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save scene link.', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteLink(link: VirtualTourLink) {
    if (!linkScene || !window.confirm(`Delete the link to "${link.toScene.name}"?`)) return;
    setIsSaving(true);
    try {
      const refreshFailed = await detail.deleteLink(linkScene.id, link.id);
      showToast('Scene link deleted.', 'success');
      if (refreshFailed) showToast('Link deleted, but current data could not be refreshed.', 'warning');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to delete scene link.', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  const title = detail.tour ? `Scenes: ${detail.tour.title}` : 'Virtual tour scenes';

  return (
    <Modal closeDisabled={isSaving || Boolean(deletingId)} open={open} size="xl" title={title} onClose={requestClose}>
      {detail.isLoading ? (
        <div className="p-10 text-center text-sm text-[#64748B]">Loading tour scenes...</div>
      ) : detail.loadError ? (
        <div className="grid justify-items-center gap-3 p-10 text-center">
          <StatusMessage tone="error">{detail.loadError}</StatusMessage>
          <Button size="sm" variant="outline" onClick={() => void detail.retry()}>
            Try again
          </Button>
        </div>
      ) : !detail.tour ? null : view === 'scene-form' ? (
        <div className="grid gap-5">
          <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
            <Button aria-label="Back to scenes" className="h-11 w-11" iconOnly size="sm" variant="outline" onClick={returnToScenes}>
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h3 className="font-semibold text-[#1C2434]">
                {editingScene ? `Edit ${editingScene.name}` : 'Add scene'}
              </h3>
              <p className="text-sm text-[#64748B]">Configure the panorama and initial camera position.</p>
            </div>
          </div>
          <VirtualTourSceneForm
            key={editingScene?.id ?? 'new-scene'}
            galleries={galleries}
            galleryError={galleryError}
            isGalleryLoading={isGalleryLoading}
            isSaving={isSaving}
            scene={editingScene}
            onCancel={returnToScenes}
            onDirtyChange={setIsEditorDirty}
            onSubmit={(payload) => void saveScene(payload)}
          />
        </div>
      ) : view === 'links' && linkScene ? (
        <VirtualTourLinks
          key={linkScene.id}
          isSaving={isSaving}
          scene={linkScene}
          scenes={detail.tour.scenes}
          onBack={returnToScenes}
          onDelete={(link) => void deleteLink(link)}
          onDirtyChange={setIsEditorDirty}
          onSave={saveLink}
        />
      ) : (
        <div className="grid gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={detail.tour.status} />
              <p className="text-sm text-[#64748B]">
                {detail.tour.scenes.length} {detail.tour.scenes.length === 1 ? 'scene' : 'scenes'}
              </p>
            </div>
            <Button disabled={isSaving || isGalleryLoading || Boolean(galleryError) || !galleries.some((gallery) => gallery.images.length)} size="sm" onClick={openCreateScene}>
              <Plus size={15} /> Add scene
            </Button>
          </div>

          {galleryError ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#F59E0B]/30 bg-[#FFFBEB] px-4 py-3">
              <StatusMessage tone="warning">Gallery images could not be loaded: {galleryError}</StatusMessage>
              <Button size="sm" variant="outline" onClick={() => void onRetryGalleries()}>
                Try Gallery again
              </Button>
            </div>
          ) : !isGalleryLoading && !galleries.some((gallery) => gallery.images.length) ? (
            <div className="rounded-lg border border-[#F59E0B]/30 bg-[#FFFBEB] px-4 py-3">
              <StatusMessage tone="warning">
                Upload a panorama image to Gallery before creating a scene.
              </StatusMessage>
            </div>
          ) : null}

          {!detail.tour.scenes.length ? (
            <div className="rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-10 text-center">
              <p className="font-medium text-[#1C2434]">No scenes in this tour.</p>
              <p className="mt-1 text-sm text-[#64748B]">Add the first panorama to begin building the route.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-[#E2E8F0]">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-[#F1F5F9] text-xs font-semibold uppercase text-[#475569]">
                  <tr>
                    <th className="px-4 py-3">Scene</th>
                    <th className="px-4 py-3">View</th>
                    <th className="px-4 py-3">Links</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {detail.tour.scenes.map((scene) => {
                    const isStart = detail.tour?.startSceneId === scene.id;
                    const imageUrl = adminApi.publicAssetUrl(
                      sceneImagePath(scene.panoramaImage.path, scene.panoramaImage.id),
                    );

                    return (
                      <tr className="hover:bg-[#F8FAFC]" key={scene.id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img alt="" className="h-12 w-20 rounded-md bg-[#E2E8F0] object-cover" src={imageUrl} />
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-[#1C2434]">{scene.name}</p>
                                {isStart ? <span className="rounded-md bg-[#3C50E0]/10 px-2 py-0.5 text-[11px] font-semibold text-[#3C50E0]">Start</span> : null}
                              </div>
                              <p className="mt-0.5 text-xs text-[#64748B]">{scene.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums text-[#64748B]">{scene.initialYaw}° / {scene.initialPitch}°</td>
                        <td className="px-4 py-3 text-[#64748B]">{scene.outgoingLinks.length}</td>
                        <td className="px-4 py-3"><span className={scene.isActive ? 'rounded-md bg-[#10B981]/10 px-2 py-1 text-xs font-semibold text-[#047857]' : 'rounded-md bg-[#64748B]/10 px-2 py-1 text-xs font-semibold text-[#475569]'}>{scene.isActive ? 'Active' : 'Inactive'}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Button aria-label={`Set ${scene.name} as start scene`} className="h-11 w-11" disabled={isSaving || isStart || !scene.isActive} iconOnly size="sm" title="Set as start scene" variant="ghost" onClick={() => void setStartScene(scene)}><Star className={isStart ? 'fill-[#3C50E0] text-[#3C50E0]' : ''} size={15} /></Button>
                            <Button aria-label={`Manage links from ${scene.name}`} className="h-11 w-11" iconOnly size="sm" title="Manage links" variant="ghost" onClick={() => openLinks(scene)}><Link2 size={15} /></Button>
                            <Button aria-label={`Edit ${scene.name}`} className="h-11 w-11" iconOnly size="sm" title="Edit scene" variant="ghost" onClick={() => openEditScene(scene)}><Pencil size={15} /></Button>
                            <Button aria-label={`Delete ${scene.name}`} className="h-11 w-11" disabled={isSaving || deletingId === scene.id} iconOnly size="sm" title="Delete scene" variant="ghost" onClick={() => void deleteScene(scene)}><Trash2 className="text-[#DC2626]" size={15} /></Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end border-t border-[#E2E8F0] pt-4">
            <Button disabled={isSaving} variant="outline" onClick={requestClose}>Close</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
