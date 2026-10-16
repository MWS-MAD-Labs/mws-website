import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import type {
  VirtualTourListItem,
  VirtualTourPayload,
  VirtualTourStatus,
} from '@/admin/api/adminApi';
import AppShell from '@/admin/components/layout/AppShell';
import Button from '@/admin/components/ui/Button';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';
import Modal from '@/admin/components/ui/Modal';
import SearchInput from '@/admin/components/ui/SearchInput';
import Select from '@/admin/components/ui/Select';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import { useToast } from '@/admin/components/ui/toastContext';
import type { StatusTone } from '@/admin/components/ui/statusTone';
import VirtualTourFormModal from './components/VirtualTourFormModal';
import VirtualTourManagerModal from './components/VirtualTourManagerModal';
import VirtualTourTable from './components/VirtualTourTable';
import { useVirtualTours } from './hooks/useVirtualTours';

export default function VirtualPage() {
  const data = useVirtualTours();
  const showToast = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<VirtualTourStatus | ''>('');
  const [editingTour, setEditingTour] = useState<VirtualTourListItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [managerTourId, setManagerTourId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VirtualTourListItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; tone: StatusTone } | null>(null);

  function notify(text: string, tone: StatusTone) {
    setMessage({ text, tone });
    showToast(text, tone);
  }

  const visibleTours = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.tours.filter((tour) => {
      if (status && tour.status !== status) return false;
      if (!query) return true;
      return [tour.title, tour.slug, tour.description ?? '', tour.startScene?.name ?? '']
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [data.tours, search, status]);

  function openCreate() {
    setEditingTour(null);
    setIsFormOpen(true);
  }

  function openEdit(tour: VirtualTourListItem) {
    setEditingTour(tour);
    setIsFormOpen(true);
  }

  function closeForm() {
    if (isSaving) return;
    setIsFormOpen(false);
    setEditingTour(null);
  }

  async function saveTour(payload: VirtualTourPayload) {
    setIsSaving(true);
    setMessage(null);
    try {
      const result = await data.saveTour(editingTour?.id ?? null, payload);
      if (result.refreshFailed) {
        notify(
          'Virtual tour saved. Refresh the list with Try again before editing it further.',
          'warning',
        );
      } else {
        notify(editingTour ? 'Virtual tour updated.' : 'Virtual tour created.', 'success');
      }
      setIsFormOpen(false);
      setEditingTour(null);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Failed to save virtual tour.', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteTour() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    setMessage(null);
    try {
      const result = await data.deleteTour(deleteTarget.id);
      if (result.refreshFailed) {
        notify('Virtual tour deleted. Refresh the list with Try again.', 'warning');
      } else {
        notify('Virtual tour deleted.', 'success');
      }
      setDeleteTarget(null);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Failed to delete virtual tour.', 'error');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AppShell title="Virtual Tour">
      <section className="space-y-5 p-6">
        <ContentPageHeader
          breadcrumbs={[{ label: 'Gallery', path: '/admin/gallery' }, { label: 'Virtual Tour' }]}
          title="Virtual Tour"
          description="Build campus tours from Gallery panoramas and connect scenes with navigation links."
          action={
            <Button disabled={data.isLoading || isSaving} onClick={openCreate}>
              <Plus size={15} /> New tour
            </Button>
          }
        />

        {message ? (
          <div className="rounded-lg border border-[#E2E8F0] bg-white px-5 py-3">
            <StatusMessage tone={message.tone}>{message.text}</StatusMessage>
          </div>
        ) : null}

        <section className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
          <div className="grid gap-3 border-b border-[#E2E8F0] bg-[#F1F5F9] px-5 py-4 md:grid-cols-[minmax(0,1fr)_180px]">
            <SearchInput
              aria-label="Search virtual tours"
              placeholder="Search title, slug, or start scene..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select
              aria-label="Filter by status"
              value={status}
              onChange={(event) => setStatus(event.target.value as VirtualTourStatus | '')}
            >
              <option value="">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
          </div>

          {data.isLoading ? (
            <div className="p-10 text-center text-sm text-[#64748B]">Loading virtual tours...</div>
          ) : data.loadError ? (
            <div className="grid justify-items-center gap-3 p-10 text-center">
              <StatusMessage tone="error">{data.loadError}</StatusMessage>
              <Button size="sm" variant="outline" onClick={() => void data.retry()}>
                Try again
              </Button>
            </div>
          ) : !visibleTours.length ? (
            <div className="p-10 text-center">
              <p className="font-medium text-[#1C2434]">
                {data.tours.length ? 'No tours match these filters.' : 'No virtual tours yet.'}
              </p>
              <p className="mt-1 text-sm text-[#64748B]">
                {data.tours.length
                  ? 'Adjust the search or status filter.'
                  : 'Create a tour, then add panorama scenes from Gallery.'}
              </p>
            </div>
          ) : (
            <VirtualTourTable
              deletingId={deletingId}
              tours={visibleTours}
              onDelete={setDeleteTarget}
              onEdit={openEdit}
              onManage={(tour) => setManagerTourId(tour.id)}
            />
          )}
        </section>
      </section>

      <VirtualTourFormModal
        key={editingTour?.id ?? (isFormOpen ? 'new-tour' : 'closed-tour')}
        canPublish={Boolean(editingTour?.startScene?.isActive)}
        isSaving={isSaving}
        open={isFormOpen}
        tour={editingTour}
        onClose={closeForm}
        onSubmit={(payload) => void saveTour(payload)}
      />

      <VirtualTourManagerModal
        key={managerTourId ?? 'closed-manager'}
        galleries={data.galleries}
        galleryError={data.galleryError}
        isGalleryLoading={data.isGalleryLoading}
        open={Boolean(managerTourId)}
        tourId={managerTourId}
        onClose={() => setManagerTourId(null)}
        onRetryGalleries={data.retryGalleries}
        onTourChanged={data.reload}
      />

      <Modal
        closeDisabled={Boolean(deletingId)}
        open={Boolean(deleteTarget)}
        title="Delete virtual tour?"
        onClose={() => !deletingId && setDeleteTarget(null)}
      >
        <div className="grid gap-4">
          <p className="text-sm leading-6 text-[#64748B]">
            Delete <strong className="text-[#1C2434]">{deleteTarget?.title}</strong> and all of
            its scenes and links? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button disabled={Boolean(deletingId)} variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button disabled={Boolean(deletingId)} variant="danger" onClick={() => void deleteTour()}>
              {deletingId ? 'Deleting...' : 'Delete tour'}
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
