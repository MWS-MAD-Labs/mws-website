import { ExternalLink, Image, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { adminApi, type GalleryItem, type PopupPromoted } from '@/admin/api/adminApi';
import AppShell from '@/admin/components/layout/AppShell';
import Button from '@/admin/components/ui/Button';
import SearchInput from '@/admin/components/ui/SearchInput';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import { useToastState } from '@/admin/components/ui/toastContext';
import { getErrorMessage } from '@/admin/features/news/newsUtils';
import { formatAdminDateTime } from '@/admin/utils/dateFormat';
import ModalCreateUpdate, {
  type PopupPromotedFormData,
} from './components/ModalCreateUpdate';
import { findShowingPopupId, getPopupDisplayStatus } from './popupPromotedStatus';

function formatTarget(popup: PopupPromoted) {
  return [popup.targetType, popup.targetId].filter(Boolean).join(': ') || 'Custom';
}

function formatDate(value: string | null) {
  return formatAdminDateTime(value);
}

function toDateTimeLocal(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function formFromPopup(popup: PopupPromoted): PopupPromotedFormData {
  return {
    title: popup.title,
    description: popup.description ?? '',
    posterImagePath: popup.posterImagePath ?? '',
    posterImageAlt: popup.posterImageAlt ?? '',
    buttonText: popup.buttonText ?? '',
    buttonUrl: popup.buttonUrl ?? '',
    targetType: popup.targetType ?? 'CUSTOM',
    targetId: popup.targetId ?? '',
    openInNewTab: popup.openInNewTab,
    sortOrder: String(popup.sortOrder),
    isActive: popup.isActive,
    activeFrom: toDateTimeLocal(popup.activeFrom),
    activeUntil: toDateTimeLocal(popup.activeUntil),
  };
}

export default function PopupPromotedPage() {
  const [popups, setPopups] = useState<PopupPromoted[]>([]);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useToastState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'update'>('create');
  const [selectedPopup, setSelectedPopup] = useState<PopupPromoted | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const showingPopupId = useMemo(() => findShowingPopupId(popups), [popups]);

  const filteredPopups = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return popups;

    return popups.filter((popup) =>
      [
        popup.title,
        popup.description ?? '',
        popup.buttonText ?? '',
        popup.buttonUrl ?? '',
        popup.targetType ?? '',
        popup.targetId ?? '',
        popup.isActive ? 'active' : 'inactive',
        getPopupDisplayStatus(popup, { isShowing: popup.id === showingPopupId }).searchText,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [popups, search, showingPopupId]);

  async function loadPopups() {
    setPopups(await adminApi.popupPromoted());
  }

  useEffect(() => {
    let isCurrent = true;

    queueMicrotask(() => {
      Promise.all([adminApi.popupPromoted(), adminApi.galleries()])
        .then(([items, galleryItems]) => {
          if (!isCurrent) return;
          setPopups(items);
          setGalleries(galleryItems);
        })
        .catch((error) => {
          if (!isCurrent) return;
          setMessage(getErrorMessage(error, 'Failed to load popup promoted items.'));
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
    setSelectedPopup(null);
    setModalMode('create');
    setModalOpen(true);
  }

  function handleEdit(popup: PopupPromoted) {
    setSelectedPopup(popup);
    setModalMode('update');
    setModalOpen(true);
  }

  function handleCloseModal() {
    if (isSaving) return;
    setModalOpen(false);
    setSelectedPopup(null);
  }

  async function deletePopup(popup: PopupPromoted) {
    const confirmed = window.confirm('Delete "' + popup.title + '"?');
    if (!confirmed) return;

    setDeletingId(popup.id);
    setMessage(null);

    try {
      await adminApi.deletePopupPromoted(popup.id);
      await loadPopups();
      setMessage('Popup promoted deleted.');
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to delete popup promoted item.'));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSubmit(data: Parameters<typeof adminApi.createPopupPromoted>[0]) {
    setIsSaving(true);
    setMessage(null);

    try {
      if (modalMode === 'create') {
        await adminApi.createPopupPromoted(data);
        setMessage('Popup promoted created.');
      } else if (selectedPopup) {
        await adminApi.updatePopupPromoted(selectedPopup.id, data);
        setMessage('Popup promoted updated.');
      }

      setModalOpen(false);
      setSelectedPopup(null);
      await loadPopups();
    } catch (error) {
      setMessage(
        getErrorMessage(
          error,
          modalMode === 'create'
            ? 'Failed to create popup promoted item.'
            : 'Failed to update popup promoted item.',
        ),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell title="Popup Promoted">
      <section className="space-y-5 p-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#1C2434]">Popup Promoted</h1>
          <p className="mt-1 text-sm text-[#475569]">
            Manage homepage popup promotions, posters, action links, and schedules.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] px-5 py-4">
            <div>
              <h2 className="font-semibold text-[#1C2434]">Promotions</h2>
              <p className="mt-0.5 text-sm text-[#64748B]">
                {popups.length} {popups.length === 1 ? 'item' : 'items'}
              </p>
            </div>

            <Button type="button" size="sm" onClick={handleCreate}>
              <Plus size={15} />
              Add Popup
            </Button>
          </div>

          <div className="border-b border-[#E2E8F0] bg-[#F1F5F9] px-5 py-4">
            <SearchInput
              className="max-w-xs"
              placeholder="Search popup..."
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
                    Popup
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
                    Action
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
                    Schedule
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
                {filteredPopups.map((popup) => (
                  <PopupRow
                    deletingId={deletingId}
                    isShowing={popup.id === showingPopupId}
                    key={popup.id}
                    popup={popup}
                    onDelete={() => void deletePopup(popup)}
                    onEdit={() => handleEdit(popup)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {isLoading ? (
            <div className="p-10 text-center">
              <p className="font-medium text-[#1C2434]">Loading popup promoted items...</p>
            </div>
          ) : null}

          {!isLoading && !filteredPopups.length ? (
            <div className="p-10 text-center">
              <p className="font-medium text-[#1C2434]">No popup promoted items found.</p>
              <p className="mt-1 text-sm text-[#64748B]">Create a popup or adjust your search.</p>
            </div>
          ) : null}
        </div>
      </section>

      {modalOpen ? (
        <ModalCreateUpdate
          galleries={galleries}
          initialData={selectedPopup ? formFromPopup(selectedPopup) : undefined}
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

function PopupRow({
  deletingId,
  isShowing,
  popup,
  onDelete,
  onEdit,
}: {
  deletingId: string | null;
  isShowing: boolean;
  popup: PopupPromoted;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const status = getPopupDisplayStatus(popup, { isShowing });

  return (
    <tr className="transition-colors hover:bg-[#F1F5F9]/50">
      <td className="px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <PosterPreview popup={popup} />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-[#1C2434]">{popup.title}</h3>
            <p className="mt-1 max-w-[360px] truncate text-xs text-[#64748B]">
              {popup.description || '-'}
            </p>
            <p className="mt-1 text-xs text-[#94A3B8]">
              Sort {popup.sortOrder} · {formatTarget(popup)}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-[#1C2434]">
          {popup.buttonText || 'No button text'}
        </p>
        {popup.buttonUrl ? (
          <a
            className="mt-1 inline-flex max-w-[260px] items-center gap-1 truncate text-xs font-medium text-[#3C50E0] hover:underline"
            href={popup.buttonUrl}
            rel="noreferrer"
            target="_blank"
          >
            <span className="truncate">{popup.buttonUrl}</span>
            <ExternalLink size={12} />
          </a>
        ) : (
          <p className="mt-1 text-xs text-[#94A3B8]">No URL</p>
        )}
      </td>

      <td className="px-5 py-4 text-xs text-[#64748B]">
        <p>From: {formatDate(popup.activeFrom)}</p>
        <p className="mt-1">Until: {formatDate(popup.activeUntil)}</p>
      </td>

      <td className="px-5 py-4">
        <span
          className={
            'inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ' + status.className
          }
        >
          {status.label}
        </span>
        <p className="mt-1 max-w-[180px] text-[11px] leading-4 text-[#64748B]">
          {status.description}
        </p>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-1.5">
          <Button
            aria-label={'Delete ' + popup.title}
            className="rounded-md"
            disabled={deletingId === popup.id}
            iconOnly
            size="sm"
            type="button"
            variant="danger"
            onClick={onDelete}
          >
            <Trash2 size={14} />
          </Button>
          <button
            type="button"
            aria-label={'Edit ' + popup.title}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#E2E8F0] px-3 text-xs font-semibold text-[#475569] transition hover:bg-[#F8FAFC] hover:text-[#1C2434]"
            onClick={onEdit}
          >
            <Pencil size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function PosterPreview({ popup }: { popup: PopupPromoted }) {
  if (!popup.posterImagePath) {
    return (
      <div className="grid h-20 w-16 shrink-0 place-items-center rounded-md border border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8]">
        <Image aria-hidden="true" size={18} />
      </div>
    );
  }

  return (
    <img
      src={adminApi.publicAssetUrl(popup.posterImagePath)}
      alt={popup.posterImageAlt || popup.title}
      className="h-20 w-16 shrink-0 rounded-md border border-[#E2E8F0] bg-white object-cover"
    />
  );
}
