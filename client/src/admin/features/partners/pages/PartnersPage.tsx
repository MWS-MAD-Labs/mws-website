import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { adminApi, type GalleryItem, type Partner } from '@/admin/api/adminApi';
import AppShell from '@/admin/components/layout/AppShell';
import Button from '@/admin/components/ui/Button';
import SearchInput from '@/admin/components/ui/SearchInput';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import { getErrorMessage } from '@/admin/features/news/newsUtils';
import ModalCreateUpdate from './components/ModalCreateUpdate';

function formatStatus(status: string) {
  const normalized = status.trim().toLowerCase();
  if (!normalized) return 'Unknown';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function isPublishedStatus(status: string) {
  return status.trim().toLowerCase() === 'active';
}

function statusClassName(status: string) {
  return isPublishedStatus(status) ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#F1F5F9] text-[#64748B]';
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'update'>('create');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function handleCreate() {
    setSelectedPartner(null);
    setModalMode('create');
    setModalOpen(true);
  }

  function handleEdit(partner: Partner) {
    setSelectedPartner(partner);
    setModalMode('update');
    setModalOpen(true);
  }

  function handleCloseModal() {
    if (isSaving) return;

    setModalOpen(false);
    setSelectedPartner(null);
  }

  const filteredPartners = useMemo(() => {
    const query = search.trim().toLowerCase();

    return partners.filter((partner) => {
      if (!query) return true;

      return [partner.name, partner.description, partner.link ?? '']
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [partners, search]);

  async function loadPartners() {
    setPartners(await adminApi.partners());
  }

  useEffect(() => {
    let isCurrent = true;

    queueMicrotask(() => {
      Promise.all([adminApi.partners(), adminApi.galleries()])
        .then(([items, galleryItems]) => {
          if (!isCurrent) return;

          setPartners(items);
          setGalleries(galleryItems);
        })
        .catch((error) => {
          if (!isCurrent) return;
          setMessage(getErrorMessage(error, 'Failed to load partners.'));
        })
        .finally(() => {
          if (isCurrent) setIsLoading(false);
        });
    });

    return () => {
      isCurrent = false;
    };
  }, []);

  async function deletePartner(partner: Partner) {
    const confirmed = window.confirm('Delete "' + partner.name + '"?');
    if (!confirmed) return;

    setDeletingId(partner.id);
    setMessage(null);

    try {
      await adminApi.deletePartner(partner.id);
      await loadPartners();
      setMessage('Partner deleted.');
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to delete partner.'));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSubmit(data: {
    name: string;
    description: string;
    logo: string;
    link: string;
    status: string;
  }) {
    setIsSaving(true);
    setMessage(null);

    try {
      if (modalMode === 'create') {
        await adminApi.createPartner(data);
        setMessage('Partner created.');
      } else if (selectedPartner) {
        await adminApi.updatePartner(selectedPartner.id, data);
        setMessage('Partner updated.');
      }

      setModalOpen(false);
      setSelectedPartner(null);

      await loadPartners();
    } catch (error) {
      setMessage(
        getErrorMessage(
          error,
          modalMode === 'create' ? 'Failed to create partner.' : 'Failed to update partner.',
        ),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell title="Partners">
      <section className="space-y-5 p-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#1C2434]">Partners</h1>

          <p className="mt-1 text-sm text-[#475569]">
            Manage the partners that are displayed on the website.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] px-5 py-4">
            <div>
              <h2 className="font-semibold text-[#1C2434]">Partners</h2>

              <p className="mt-0.5 text-sm text-[#64748B]">
                {partners.length} {partners.length === 1 ? 'partner' : 'partners'}
              </p>
            </div>

            <Button type="button" size="sm" onClick={handleCreate}>
              <Plus size={15} />
              Add Partner
            </Button>
          </div>

          <div className="border-b border-[#E2E8F0] bg-[#F1F5F9] px-5 py-4">
            <SearchInput
              className="max-w-xs"
              placeholder="Search partner..."
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
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F1F5F9] text-left">
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
                    Partner
                  </th>

                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
                    Website
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
                {filteredPartners.map((partner) => (
                  <tr key={partner.id} className="transition-colors hover:bg-[#F1F5F9]/50">
                    <td className="px-5 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <PartnerLogo partner={partner} />

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-[#1C2434]">
                            {partner.name}
                          </h3>

                          <p className="mt-1 max-w-[360px] truncate text-xs text-[#64748B]">
                            {partner.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {partner.link ? (
                        <a
                          className="text-sm font-medium text-[#3C50E0] hover:underline"
                          href={partner.link}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {partner.link}
                        </a>
                      ) : (
                        <span className="text-sm text-[#94A3B8]">-</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          'inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ' +
                          statusClassName(partner.status)
                        }
                      >
                        {formatStatus(partner.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          aria-label={'Delete ' + partner.name}
                          className="h-90 w-90 rounded-md p-0"
                          disabled={deletingId === partner.id}
                          size="sm"
                          type="button"
                          variant="danger"
                          onClick={() => void deletePartner(partner)}
                        >
                          <Trash2 size={14} />
                        </Button>

                        <button
                          type="button"
                          aria-label={'Edit ' + partner.name}
                          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#E2E8F0] px-3 text-xs font-semibold text-[#475569] transition hover:bg-[#F8FAFC] hover:text-[#1C2434]"
                          onClick={() => handleEdit(partner)}
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
              <p className="font-medium text-[#1C2434]">Loading partners...</p>
            </div>
          ) : null}

          {!isLoading && !filteredPartners.length ? (
            <div className="p-10 text-center">
              <p className="font-medium text-[#1C2434]">No partners found.</p>

              <p className="mt-1 text-sm text-[#64748B]">Try adjusting your search.</p>
            </div>
          ) : null}
        </div>
      </section>

      {modalOpen ? (
        <ModalCreateUpdate
          galleries={galleries}
          open={modalOpen}
          mode={modalMode}
          initialData={
            selectedPartner
              ? {
                  name: selectedPartner.name,
                  description: selectedPartner.description,
                  logo: selectedPartner.logo,
                  link: selectedPartner.link ?? '',
                  status: selectedPartner.status,
                }
              : undefined
          }
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          loading={isSaving}
        />
      ) : null}
    </AppShell>
  );
}

function PartnerLogo({ partner }: { partner: Partner }) {
  if (!partner.logo) {
    return (
      <div className="grid h-14 w-20 shrink-0 place-items-center rounded-md border border-[#E2E8F0] bg-[#F8FAFC] text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">
        Logo
      </div>
    );
  }

  return (
    <img
      src={adminApi.publicAssetUrl(partner.logo)}
      alt={partner.name + ' logo'}
      className="h-14 w-20 shrink-0 rounded-md border border-[#E2E8F0] bg-white object-contain p-2"
    />
  );
}
