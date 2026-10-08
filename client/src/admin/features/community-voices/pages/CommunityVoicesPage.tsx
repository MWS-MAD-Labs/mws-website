import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import {
  adminApi,
  type AdminCommunityVoice,
  type AdminCommunityVoicePayload,
  type GalleryItem,
} from '@/admin/api/adminApi';
import AppShell from '@/admin/components/layout/AppShell';
import Button from '@/admin/components/ui/Button';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';
import SearchInput from '@/admin/components/ui/SearchInput';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import { useToastState } from '@/admin/components/ui/toastContext';
import { getErrorMessage } from '@/admin/features/news/newsUtils';
import ModalCreateUpdate from './components/ModalCreateUpdate';
import VoiceMediaPreview from './components/VoiceMediaPreview';
import type { VoiceForm } from './voiceFormModel';

type ModalMode = 'create' | 'update';

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function voiceToForm(voice: AdminCommunityVoice): VoiceForm {
  return {
    grade: voice.grade ?? '',
    homeSortOrder: String(voice.homeSortOrder),
    imagePath: voice.imagePath,
    isActive: voice.isActive,
    name: voice.name,
    quote: voice.quote,
    role: voice.role,
    showOnHome: voice.showOnHome,
    sortOrder: String(voice.sortOrder),
  };
}

function voicePayload(form: VoiceForm): AdminCommunityVoicePayload {
  return {
    grade: optionalText(form.grade),
    homeSortOrder: Number.parseInt(form.homeSortOrder, 10) || 0,
    imagePath: form.imagePath.trim(),
    isActive: form.isActive,
    name: form.name.trim(),
    quote: form.quote.trim(),
    role: form.role.trim(),
    showOnHome: form.showOnHome,
    sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
  };
}

function statusClassName(isActive: boolean) {
  return isActive ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#F1F5F9] text-[#64748B]';
}

export default function CommunityVoicesPage() {
  const [voices, setVoices] = useState<AdminCommunityVoice[]>([]);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useToastState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [selectedVoice, setSelectedVoice] = useState<AdminCommunityVoice | null>(null);

  const filteredVoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return voices.filter((voice) => {
      if (!query) return true;

      return [voice.name, voice.role, voice.grade ?? '', voice.quote]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [search, voices]);

  async function loadData() {
    const [voiceData, galleryData] = await Promise.all([
      adminApi.communityVoices(),
      adminApi.galleries(),
    ]);

    setVoices(voiceData);
    setGalleries(galleryData);
  }

  useEffect(() => {
    let isCurrent = true;

    queueMicrotask(() => {
      loadData()
        .catch((error) => {
          if (!isCurrent) return;
          setMessage(getErrorMessage(error, 'Failed to load community voices.'));
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
    setSelectedVoice(null);
    setModalMode('create');
    setModalOpen(true);
  }

  function handleEdit(voice: AdminCommunityVoice) {
    setSelectedVoice(voice);
    setModalMode('update');
    setModalOpen(true);
  }

  function handleCloseModal() {
    if (isSaving) return;

    setModalOpen(false);
    setSelectedVoice(null);
  }

  async function saveVoice(form: VoiceForm) {
    setIsSaving(true);
    setMessage(null);

    try {
      if (modalMode === 'create') {
        await adminApi.createCommunityVoice(voicePayload(form));
        setMessage('Community voice created.');
      } else if (selectedVoice) {
        await adminApi.updateCommunityVoice(selectedVoice.id, voicePayload(form));
        setMessage('Community voice updated.');
      }

      setModalOpen(false);
      setSelectedVoice(null);

      await loadData();
    } catch (error) {
      setMessage(
        getErrorMessage(
          error,
          modalMode === 'create'
            ? 'Failed to create community voice.'
            : 'Failed to update community voice.',
        ),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteVoice(voice: AdminCommunityVoice) {
    const confirmed = window.confirm(`Delete "${voice.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(voice.id);
    setMessage(null);

    try {
      await adminApi.deleteCommunityVoice(voice.id);
      await loadData();
      setMessage('Community voice deleted.');
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to delete community voice.'));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AppShell title="Community Voices">
      <section className="space-y-5 p-6">
        <ContentPageHeader
          breadcrumbs={[{ label: 'Content' }, { label: 'Community Voices' }]}
          title="Community Voices"
          description="Manage parent, student, teacher, staff, alumni, and community voices. Select up to 5 for Home."
        />

        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] px-5 py-4">
            <div>
              <h2 className="font-semibold text-[#1C2434]">Voices</h2>

              <p className="mt-0.5 text-sm text-[#64748B]">
                {voices.length} {voices.length === 1 ? 'voice' : 'voices'}
              </p>
            </div>

            <Button type="button" size="sm" onClick={handleCreate}>
              <Plus size={15} />
              Add Voice
            </Button>
          </div>

          <div className="border-b border-[#E2E8F0] bg-[#F1F5F9] px-5 py-4">
            <SearchInput
              className="max-w-xs"
              placeholder="Search voice..."
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
            <table className="w-full min-w-[980px] border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F1F5F9] text-left">
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
                    Voice
                  </th>

                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
                    Quote
                  </th>

                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
                    Order
                  </th>

                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
                    Home
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
                {filteredVoices.map((voice) => (
                  <tr key={voice.id} className="transition-colors hover:bg-[#F1F5F9]/50">
                    <td className="px-5 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <VoiceMediaPreview
                          className="h-14 w-14 shrink-0 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] object-cover"
                          alt={voice.name}
                          path={voice.imagePath}
                        />

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-[#1C2434]">
                            {voice.name}
                          </h3>

                          <p className="mt-1 truncate text-xs text-[#64748B]">
                            {voice.role}
                            {voice.grade ? ` - ${voice.grade}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="max-w-[420px] truncate text-sm text-[#64748B]">
                        {voice.quote}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-[#64748B]">{voice.sortOrder}</td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          'inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ' +
                          (voice.showOnHome
                            ? 'bg-[#DBEAFE] text-[#1D4ED8]'
                            : 'bg-[#F1F5F9] text-[#64748B]')
                        }
                      >
                        {voice.showOnHome ? `Home #${voice.homeSortOrder}` : 'Stories only'}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          'inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ' +
                          statusClassName(voice.isActive)
                        }
                      >
                        {voice.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          aria-label={`Delete ${voice.name}`}
                          className="h-90 w-90 rounded-md p-0"
                          disabled={deletingId === voice.id || isSaving}
                          size="sm"
                          type="button"
                          variant="danger"
                          onClick={() => void deleteVoice(voice)}
                        >
                          <Trash2 size={14} />
                        </Button>

                        <button
                          type="button"
                          aria-label={`Edit ${voice.name}`}
                          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#E2E8F0] px-3 text-xs font-semibold text-[#475569] transition hover:bg-[#F8FAFC] hover:text-[#1C2434]"
                          disabled={isSaving}
                          onClick={() => handleEdit(voice)}
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
              <p className="font-medium text-[#1C2434]">Loading community voices...</p>
            </div>
          ) : null}

          {!isLoading && !filteredVoices.length ? (
            <div className="p-10 text-center">
              <p className="font-medium text-[#1C2434]">No community voices found.</p>

              <p className="mt-1 text-sm text-[#64748B]">Try adjusting your search.</p>
            </div>
          ) : null}
        </div>
      </section>

      {modalOpen ? (
        <ModalCreateUpdate
          galleries={galleries}
          initialData={selectedVoice ? voiceToForm(selectedVoice) : undefined}
          loading={isSaving}
          mode={modalMode}
          onClose={handleCloseModal}
          onSubmit={saveVoice}
          open={modalOpen}
        />
      ) : null}
    </AppShell>
  );
}
