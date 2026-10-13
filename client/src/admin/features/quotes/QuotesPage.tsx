import { ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  adminApi,
  type CampusSpotlightItem,
  type CampusSpotlightPayload,
  type GalleryItem,
} from '@/admin/api/adminApi';
import AppShell from '@/admin/components/layout/AppShell';
import Button from '@/admin/components/ui/Button';
import SearchInput from '@/admin/components/ui/SearchInput';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import { useToastState } from '@/admin/components/ui/toastContext';
import ModalCreateUpdate, { type QuoteFormData } from './components/ModalCreateUpdate';

function formFromSpotlight(spotlight: CampusSpotlightItem): QuoteFormData {
  return {
    cite: spotlight.cite,
    imageAlt: spotlight.imageAlt ?? '',
    imagePath: spotlight.imagePath ?? '',
    isActive: spotlight.isActive,
    sortOrder: String(spotlight.sortOrder),
    text: spotlight.text,
  };
}

function statusClassName(isActive: boolean) {
  return isActive ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#F1F5F9] text-[#64748B]';
}

export default function QuotesPage() {
  const [spotlights, setSpotlights] = useState<CampusSpotlightItem[]>([]);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useToastState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'update'>('create');
  const [selectedSpotlight, setSelectedSpotlight] = useState<CampusSpotlightItem | null>(null);

  const filteredSpotlights = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return spotlights;

    return spotlights.filter((spotlight) =>
      [
        spotlight.cite,
        spotlight.text,
        spotlight.imageAlt ?? '',
        spotlight.imagePath ?? '',
        spotlight.isActive ? 'active' : 'hidden',
        String(spotlight.sortOrder),
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [spotlights, search]);

  async function loadSpotlights() {
    const data = await adminApi.homeContent();
    setSpotlights(data.spotlights);
  }

  useEffect(() => {
    let isCurrent = true;

    queueMicrotask(() => {
      Promise.all([adminApi.homeContent(), adminApi.galleries()])
        .then(([homeContent, galleryItems]) => {
          if (!isCurrent) return;
          setSpotlights(homeContent.spotlights);
          setGalleries(galleryItems);
        })
        .catch((error) => {
          if (!isCurrent) return;
          setMessage(error instanceof Error ? error.message : 'Failed to load campus spotlight.');
        })
        .finally(() => {
          if (isCurrent) setIsLoading(false);
        });
    });

    return () => {
      isCurrent = false;
    };
  }, [setMessage]);

  function handleCreate() {
    setSelectedSpotlight(null);
    setModalMode('create');
    setModalOpen(true);
  }

  function handleEdit(spotlight: CampusSpotlightItem) {
    setSelectedSpotlight(spotlight);
    setModalMode('update');
    setModalOpen(true);
  }

  function handleCloseModal() {
    if (isSaving) return;

    setModalOpen(false);
    setSelectedSpotlight(null);
  }

  async function handleSubmit(data: CampusSpotlightPayload) {
    setIsSaving(true);
    setMessage(null);

    try {
      if (modalMode === 'create') {
        await adminApi.createCampusSpotlight(data);
        setMessage('Campus spotlight created.');
      } else if (selectedSpotlight) {
        await adminApi.updateCampusSpotlight(selectedSpotlight.id, data);
        setMessage('Campus spotlight updated.');
      }

      setModalOpen(false);
      setSelectedSpotlight(null);
      await loadSpotlights();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save campus spotlight.');
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteSpotlight(spotlight: CampusSpotlightItem) {
    const confirmed = window.confirm(
      `Delete "${spotlight.cite || 'this campus spotlight'}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(spotlight.id);
    setMessage(null);

    try {
      await adminApi.deleteCampusSpotlight(spotlight.id);
      await loadSpotlights();
      setMessage('Campus spotlight deleted.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete campus spotlight.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AppShell title="Quotes">
      <section className="space-y-5 p-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#1C2434]">Quotes</h1>
          <p className="mt-1 text-sm text-[#475569]">
            Manage Campus Spotlight content shown on Home.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] px-5 py-4">
            <div>
              <h2 className="font-semibold text-[#1C2434]">Campus Spotlight List</h2>
              <p className="mt-0.5 text-sm text-[#64748B]">
                {spotlights.length} {spotlights.length === 1 ? 'quote' : 'quotes'}
              </p>
            </div>

            <Button disabled={isLoading} size="sm" type="button" onClick={handleCreate}>
              <Plus size={15} />
              Add Quote
            </Button>
          </div>

          <div className="border-b border-[#E2E8F0] bg-[#F1F5F9] px-5 py-4">
            <SearchInput
              className="max-w-xs"
              placeholder="Search quote..."
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
            <table className="w-full min-w-[780px] border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F1F5F9] text-left">
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
                    Quote
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
                    Sort
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredSpotlights.map((spotlight) => (
                  <tr key={spotlight.id} className="transition-colors hover:bg-[#F1F5F9]/50">
                    <td className="px-5 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-14 w-24 shrink-0 overflow-hidden rounded-md bg-[#F1F5F9]">
                          {spotlight.imagePath ? (
                            <img
                              alt={spotlight.imageAlt ?? spotlight.cite}
                              className="h-full w-full object-cover"
                              src={adminApi.publicAssetUrl(spotlight.imagePath)}
                            />
                          ) : (
                            <div className="grid h-full place-items-center text-[#94A3B8]">
                              <ImagePlus size={16} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-[#1C2434]">
                            {spotlight.cite}
                          </h3>
                          <p className="mt-1 max-w-[420px] truncate text-xs text-[#64748B]">
                            {spotlight.text}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-[#64748B]">{spotlight.sortOrder}</td>

                    <td className="px-5 py-4">
                      <span
                        className={[
                          'inline-flex rounded-full px-2 py-1 text-[11px] font-semibold',
                          statusClassName(spotlight.isActive),
                        ].join(' ')}
                      >
                        {spotlight.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          aria-label={'Delete ' + spotlight.cite}
                          className="rounded-md"
                          disabled={deletingId === spotlight.id}
                          iconOnly
                          size="sm"
                          type="button"
                          variant="danger"
                          onClick={() => void deleteSpotlight(spotlight)}
                        >
                          <Trash2 size={14} />
                        </Button>

                        <button
                          type="button"
                          aria-label={'Edit ' + spotlight.cite}
                          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#E2E8F0] px-3 text-xs font-semibold text-[#475569] transition hover:bg-[#F8FAFC] hover:text-[#1C2434]"
                          onClick={() => handleEdit(spotlight)}
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
              <p className="font-medium text-[#1C2434]">Loading campus spotlight...</p>
            </div>
          ) : null}

          {!isLoading && !filteredSpotlights.length ? (
            <div className="p-10 text-center">
              <p className="font-medium text-[#1C2434]">
                {search ? 'No quote matches your search.' : 'No campus spotlight content yet.'}
              </p>
              <p className="mt-1 text-sm text-[#64748B]">
                {search ? 'Try adjusting your search.' : 'Add a quote to show it on Home.'}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {modalOpen ? (
        <ModalCreateUpdate
          galleries={galleries}
          initialData={selectedSpotlight ? formFromSpotlight(selectedSpotlight) : undefined}
          loading={isSaving}
          mode={modalMode}
          open={modalOpen}
          onClose={handleCloseModal}
          onGalleriesChange={setGalleries}
          onSubmit={handleSubmit}
        />
      ) : null}
    </AppShell>
  );
}
