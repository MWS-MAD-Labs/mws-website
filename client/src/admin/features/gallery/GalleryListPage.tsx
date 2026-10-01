import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { adminApi, type GalleryItem, type GalleryPayload } from '@/admin/api/adminApi';
import AppShell from '@/admin/components/layout/AppShell';
import Button from '@/admin/components/ui/Button';
import Field from '@/admin/components/ui/Field';
import Modal from '@/admin/components/ui/Modal';
import SearchInput from '@/admin/components/ui/SearchInput';
import StatusMessage from '@/admin/components/ui/StatusMessage';

type GalleryFormState = {
  description: string;
  title: string;
};

const FIELD_CLASS =
  'w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm outline-none transition focus:border-[#3C50E0] focus:ring-2 focus:ring-[#3C50E0]/10';

function emptyForm(): GalleryFormState {
  return { description: '', title: '' };
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export default function GalleryListPage() {
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<GalleryFormState>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const filteredGalleries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return galleries.filter((gallery) => {
      if (!query) return true;
      return [gallery.title, gallery.description ?? ''].join(' ').toLowerCase().includes(query);
    });
  }, [galleries, searchQuery]);

  async function loadGalleries() {
    setGalleries(await adminApi.galleries());
  }

  useEffect(() => {
    queueMicrotask(() => {
      loadGalleries()
        .catch((error) =>
          setMessage(error instanceof Error ? error.message : 'Failed to load galleries.'),
        )
        .finally(() => setIsLoading(false));
    });
  }, []);

  function openCreateForm() {
    setEditingGallery(null);
    setForm(emptyForm());
    setFormMode('create');
  }

  function openEditForm(gallery: GalleryItem) {
    setEditingGallery(gallery);
    setForm({
      description: gallery.description ?? '',
      title: gallery.title,
    });
    setFormMode('edit');
  }

  function closeForm() {
    if (isSaving) return;
    setEditingGallery(null);
    setForm(emptyForm());
    setFormMode(null);
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const payload: GalleryPayload = {
      description: optionalText(form.description),
      title: form.title.trim(),
    };

    try {
      if (editingGallery) {
        await adminApi.updateGallery(editingGallery.id, payload);
        setMessage('Gallery updated.');
      } else {
        await adminApi.createGallery(payload);
        setMessage('Gallery created.');
      }

      setEditingGallery(null);
      setForm(emptyForm());
      setFormMode(null);
      await loadGalleries();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save gallery.');
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteGallery(gallery: GalleryItem) {
    const confirmed = window.confirm(`Delete "${gallery.title}"?`);
    if (!confirmed) return;

    setIsSaving(true);
    setMessage(null);

    try {
      await adminApi.deleteGallery(gallery.id);
      await loadGalleries();
      setMessage('Gallery deleted.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete gallery.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell title="Galeri">
      <section className="space-y-5 p-6">
        <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] px-5 py-4">
            <div>
              <h1 className="text-lg font-semibold text-[#1C2434]">Galeri</h1>
              <p className="mt-0.5 text-sm text-[#64748B]">{galleries.length} galeri</p>
            </div>

            <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
              <SearchInput
                className="max-w-xs"
                placeholder="Cari galeri..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <Button className="gap-2" size="sm" type="button" onClick={openCreateForm}>
                <Plus size={15} />
                Tambah
              </Button>
            </div>
          </div>

          {message ? (
            <div className="border-b border-[#E2E8F0] bg-[#F1F5F9] px-5 py-3">
              <StatusMessage>{message}</StatusMessage>
            </div>
          ) : null}

          <GalleryTable
            galleries={filteredGalleries}
            isLoading={isLoading}
            isSaving={isSaving}
            onDelete={deleteGallery}
            onEdit={openEditForm}
          />
        </div>
      </section>

      <Modal
        open={formMode !== null}
        title={editingGallery ? 'Ubah galeri' : 'Tambah galeri'}
        onClose={closeForm}
      >
        <form className="space-y-4" onSubmit={submitForm}>
          <Field label="Judul">
            <input
              className={FIELD_CLASS}
              disabled={isSaving}
              required
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            />
          </Field>

          <Field label="Keterangan">
            <textarea
              className={`${FIELD_CLASS} min-h-28 resize-y`}
              disabled={isSaving}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </Field>

          <div className="flex justify-end gap-2 border-t border-[#E2E8F0] pt-4">
            <Button disabled={isSaving} type="button" variant="outline" onClick={closeForm}>
              Batal
            </Button>
            <Button disabled={isSaving} type="submit">
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

function GalleryTable({
  galleries,
  isLoading,
  isSaving,
  onDelete,
  onEdit,
}: {
  galleries: GalleryItem[];
  isLoading: boolean;
  isSaving: boolean;
  onDelete: (gallery: GalleryItem) => void;
  onEdit: (gallery: GalleryItem) => void;
}) {
  if (isLoading) {
    return <div className="p-10 text-center text-sm text-[#64748B]">Loading galleries...</div>;
  }

  if (!galleries.length) {
    return <div className="p-10 text-center text-sm text-[#64748B]">No galleries found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[#E2E8F0] text-sm">
        <thead className="bg-[#F1F5F9] text-left text-xs font-semibold uppercase text-[#64748B]">
          <tr>
            <th className="px-5 py-3">Title</th>
            <th className="px-5 py-3">Description</th>
            <th className="px-5 py-3">Image</th>
            <th className="px-5 py-3">Video</th>
            <th className="px-5 py-3">Created</th>
            <th className="px-5 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0] bg-white">
          {galleries.map((gallery) => (
            <tr className="hover:bg-[#F1F5F9]" key={gallery.id}>
              <td className="px-5 py-4 font-semibold text-[#1C2434]">{gallery.title}</td>
              <td className="max-w-xs truncate px-5 py-4 text-[#64748B]">
                {gallery.description || '-'}
              </td>
              <td className="px-5 py-4 text-[#64748B]">{gallery.images.length}</td>
              <td className="px-5 py-4 text-[#64748B]">{gallery.videos.length}</td>
              <td className="px-5 py-4 text-[#64748B]">{formatDate(gallery.createdAt)}</td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <Button
                    disabled={isSaving}
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() => onEdit(gallery)}
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    disabled={isSaving}
                    size="sm"
                    type="button"
                    variant="danger"
                    onClick={() => onDelete(gallery)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
