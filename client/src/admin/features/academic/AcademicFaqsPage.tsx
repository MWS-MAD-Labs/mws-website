import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';

import {
  adminApi,
  type AcademicFaqItem,
  type AcademicFaqPayload,
} from '@/admin/api/adminApi';
import AppShell from '@/admin/components/layout/AppShell';
import Button from '@/admin/components/ui/Button';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';
import Field from '@/admin/components/ui/Field';
import Modal from '@/admin/components/ui/Modal';
import SearchInput from '@/admin/components/ui/SearchInput';
import StatusMessage from '@/admin/components/ui/StatusMessage';

type FaqForm = {
  question: string;
  answer: string;
  isActive: boolean;
};

const emptyForm: FaqForm = {
  question: '',
  answer: '',
  isActive: true,
};

const fieldClass =
  'rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#3C50E0]';

export default function AcademicFaqsPage() {
  const [items, setItems] = useState<AcademicFaqItem[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<FaqForm>(emptyForm);
  const [editingItem, setEditingItem] = useState<AcademicFaqItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      [item.question, item.answer, item.isActive ? 'active' : 'inactive']
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [items, search]);

  async function loadFaqs() {
    const faqs = await adminApi.academicFaqs();
    setItems(faqs);
  }

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      loadFaqs()
        .catch((error) => {
          if (!cancelled) {
            setMessage(error instanceof Error ? error.message : 'Failed to load FAQ.');
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  function openCreate() {
    setEditingItem(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  }

  function openEdit(item: AcademicFaqItem) {
    setEditingItem(item);
    setForm({
      question: item.question,
      answer: item.answer,
      isActive: item.isActive,
    });
    setIsFormOpen(true);
  }

  function closeForm() {
    if (savingId) return;
    setIsFormOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: AcademicFaqPayload = {
      question: form.question.trim(),
      answer: form.answer.trim(),
      isActive: form.isActive,
    };

    if (!payload.question || !payload.answer) {
      setMessage('Question and answer are required.');
      return;
    }

    setSavingId(editingItem?.id ?? 'create');
    setMessage(null);

    try {
      if (editingItem) {
        await adminApi.updateAcademicFaq(editingItem.id, payload);
        setMessage('FAQ updated.');
      } else {
        await adminApi.createAcademicFaq(payload);
        setMessage('FAQ created.');
      }
      await loadFaqs();
      closeForm();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save FAQ.');
    } finally {
      setSavingId(null);
    }
  }

  async function deleteFaq(item: AcademicFaqItem) {
    const usage =
      (item._count?.kindergartens ?? 0) +
      (item._count?.elementaries ?? 0) +
      (item._count?.juniorHighs ?? 0);
    const confirmed = window.confirm(
      `Delete this FAQ? It is attached to ${usage} academic level record(s).`,
    );
    if (!confirmed) return;

    setDeletingId(item.id);
    setMessage(null);

    try {
      await adminApi.deleteAcademicFaq(item.id);
      await loadFaqs();
      setMessage('FAQ deleted.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete FAQ.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AppShell title="Academic FAQ">
      <div className="grid gap-5 px-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <ContentPageHeader
            breadcrumbs={[{ label: 'Academic' }, { label: 'FAQ' }]}
            title="Academic FAQ"
            description="Manage reusable FAQ items for Kindergarten, Elementary, and Junior High."
          />
          <Button type="button" onClick={openCreate}>
            <Plus size={15} />
            New FAQ
          </Button>
        </div>

        {message ? (
          <div className="rounded-lg border border-[#E2E8F0] bg-white px-5 py-3">
            <StatusMessage>{message}</StatusMessage>
          </div>
        ) : null}

        <section className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
          <div className="border-b border-[#E2E8F0] bg-[#F1F5F9] px-5 py-4">
            <SearchInput
              placeholder="Search FAQ..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="p-10 text-center text-sm text-[#64748B]">Loading FAQ...</div>
          ) : filteredItems.length ? (
            <div className="divide-y divide-[#E2E8F0]">
              {filteredItems.map((item) => (
                <article
                  className="grid gap-3 px-5 py-4 transition-colors hover:bg-[#F1F5F9]"
                  key={item.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-[#1C2434]">
                          {item.question}
                        </h2>
                        <span
                          className={[
                            'rounded-md px-2 py-1 text-xs font-semibold',
                            item.isActive
                              ? 'bg-[#10B981]/10 text-[#047857]'
                              : 'bg-[#F1F5F9] text-[#64748B]',
                          ].join(' ')}
                        >
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#64748B]">{item.answer}</p>
                      <p className="mt-2 text-xs text-[#64748B]">
                        Attached:{' '}
                        {(item._count?.kindergartens ?? 0) +
                          (item._count?.elementaries ?? 0) +
                          (item._count?.juniorHighs ?? 0)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        aria-label="Edit FAQ"
                        size="sm"
                        type="button"
                        variant="outline"
                        onClick={() => openEdit(item)}
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        aria-label="Delete FAQ"
                        disabled={deletingId === item.id}
                        size="sm"
                        type="button"
                        variant="danger"
                        onClick={() => void deleteFaq(item)}
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center text-sm text-[#64748B]">No FAQ found.</div>
          )}
        </section>

        <Modal
          open={isFormOpen}
          title={editingItem ? 'Edit FAQ' : 'Create FAQ'}
          onClose={closeForm}
        >
          <form className="grid gap-4" onSubmit={submitForm}>
            <Field label="Question">
              <input
                className={fieldClass}
                disabled={Boolean(savingId)}
                maxLength={500}
                value={form.question}
                onChange={(event) =>
                  setForm((current) => ({ ...current, question: event.target.value }))
                }
              />
            </Field>
            <Field label="Answer">
              <textarea
                className={`${fieldClass} min-h-32`}
                disabled={Boolean(savingId)}
                value={form.answer}
                onChange={(event) =>
                  setForm((current) => ({ ...current, answer: event.target.value }))
                }
              />
            </Field>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                checked={form.isActive}
                disabled={Boolean(savingId)}
                type="checkbox"
                onChange={(event) =>
                  setForm((current) => ({ ...current, isActive: event.target.checked }))
                }
              />
              Active
            </label>
            <div className="flex justify-end gap-2 border-t border-[#E2E8F0] pt-4">
              <Button disabled={Boolean(savingId)} type="button" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button disabled={Boolean(savingId)} type="submit">
                {savingId ? 'Saving...' : 'Save FAQ'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
