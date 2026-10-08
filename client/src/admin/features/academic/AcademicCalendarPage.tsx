import { useCallback, useEffect, useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';

import {
  adminApi,
  type AcademicCalendarEvent,
  type AcademicCalendarEventList,
  type AcademicCalendarEventPayload,
  type AcademicCalendarEventType,
} from '@/admin/api/adminApi';
import AppShell from '@/admin/components/layout/AppShell';
import Button from '@/admin/components/ui/Button';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';
import Field from '@/admin/components/ui/Field';
import Modal from '@/admin/components/ui/Modal';
import SearchInput from '@/admin/components/ui/SearchInput';
import Select from '@/admin/components/ui/Select';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import { useToastState } from '@/admin/components/ui/toastContext';

const PAGE_SIZE = 20;
const EMPTY_RESULT: AcademicCalendarEventList = {
  items: [],
  pagination: { page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 0 },
};
const fieldClass =
  'rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#3C50E0]';

type EventForm = {
  title: string;
  description: string;
  type: AcademicCalendarEventType;
  startDate: string;
  endDate: string;
  eventTime: string;
  location: string;
  isActive: boolean;
  sortOrder: string;
};

const emptyForm: EventForm = {
  title: '',
  description: '',
  type: 'EVENT',
  startDate: '',
  endDate: '',
  eventTime: '',
  location: '',
  isActive: true,
  sortOrder: '0',
};

function formFromItem(item: AcademicCalendarEvent): EventForm {
  return {
    title: item.title,
    description: item.description ?? '',
    type: item.type,
    startDate: item.startDate,
    endDate: item.endDate ?? '',
    eventTime: item.eventTime ?? '',
    location: item.location ?? '',
    isActive: item.isActive,
    sortOrder: String(item.sortOrder),
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

export default function AcademicCalendarPage() {
  const [result, setResult] = useState<AcademicCalendarEventList>(EMPTY_RESULT);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<AcademicCalendarEventType | ''>('');
  const [isActive, setIsActive] = useState<boolean | ''>('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [editingItem, setEditingItem] = useState<AcademicCalendarEvent | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useToastState<string | null>(null);

  const loadEvents = useCallback(async () => {
    const next = await adminApi.academicCalendarEvents({
      page,
      pageSize: PAGE_SIZE,
      search,
      type,
      isActive,
    });
    setResult(next);
  }, [isActive, page, search, type]);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      setIsLoading(true);
      setLoadError(null);
      loadEvents()
        .catch((error) => {
          if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Failed to load calendar.');
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [loadEvents]);

  const visibleItems = useMemo(() => result.items, [result.items]);

  function changeFilter<T>(setter: Dispatch<SetStateAction<T>>, value: T) {
    setter(value);
    setPage(1);
  }

  function openCreate() {
    setEditingItem(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  }

  function openEdit(item: AcademicCalendarEvent) {
    setEditingItem(item);
    setForm(formFromItem(item));
    setIsFormOpen(true);
  }

  function closeForm(force = false) {
    if (savingId && !force) return;
    setIsFormOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: AcademicCalendarEventPayload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      type: form.type,
      startDate: form.startDate,
      endDate: form.endDate || null,
      eventTime: form.eventTime.trim() || null,
      location: form.location.trim() || null,
      isActive: form.isActive,
      sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
    };

    if (!payload.title || !payload.startDate) {
      setMessage('Title and start date are required.');
      return;
    }
    if (payload.endDate && payload.endDate < payload.startDate) {
      setMessage('End date cannot be before start date.');
      return;
    }

    setSavingId(editingItem?.id ?? 'create');
    setMessage(null);
    try {
      if (editingItem) {
        await adminApi.updateAcademicCalendarEvent(editingItem.id, payload);
        setMessage('Calendar event updated.');
      } else {
        await adminApi.createAcademicCalendarEvent(payload);
        setMessage('Calendar event created.');
      }
      await loadEvents();
      closeForm(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save calendar event.');
    } finally {
      setSavingId(null);
    }
  }

  async function deleteEvent(item: AcademicCalendarEvent) {
    if (!window.confirm(`Delete “${item.title}” from the academic calendar?`)) return;
    setDeletingId(item.id);
    setMessage(null);
    try {
      await adminApi.deleteAcademicCalendarEvent(item.id);
      await loadEvents();
      setMessage('Calendar event deleted.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete calendar event.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AppShell title="Academic Calendar">
      <section className="space-y-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <ContentPageHeader
            breadcrumbs={[{ label: 'Academic' }, { label: 'Calendar' }]}
            title="Academic Calendar"
            description="Manage academic events and holidays shown on the public calendar."
          />
          <Button disabled={isLoading || Boolean(savingId) || Boolean(deletingId)} onClick={openCreate}>
            <Plus size={15} />
            New event
          </Button>
        </div>

        {message ? (
          <div className="rounded-lg border border-[#E2E8F0] bg-white px-5 py-3">
            <StatusMessage>{message}</StatusMessage>
          </div>
        ) : null}

        <section className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
          <div className="grid gap-3 border-b border-[#E2E8F0] bg-[#F1F5F9] px-5 py-4 md:grid-cols-[minmax(0,1fr)_180px_150px]">
            <SearchInput
              placeholder="Search title, description, or location..."
              value={search}
              onChange={(event) => changeFilter(setSearch, event.target.value)}
            />
            <Select value={type} onChange={(event) => changeFilter(setType, event.target.value as AcademicCalendarEventType | '')}>
              <option value="">All types</option>
              <option value="EVENT">Event</option>
              <option value="HOLIDAY">Holiday</option>
            </Select>
            <Select
              value={isActive === '' ? '' : String(isActive)}
              onChange={(event) =>
                changeFilter(setIsActive, event.target.value === '' ? '' : event.target.value === 'true')
              }
            >
              <option value="">All statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
          </div>

          {isLoading ? (
            <div className="p-10 text-center text-sm text-[#64748B]">Loading calendar...</div>
          ) : loadError ? (
            <div className="grid justify-items-center gap-3 p-10 text-center">
              <StatusMessage tone="error">{loadError}</StatusMessage>
              <Button size="sm" variant="outline" onClick={() => void loadEvents()}>Try again</Button>
            </div>
          ) : !visibleItems.length ? (
            <div className="p-10 text-center">
              <p className="font-medium text-[#1C2434]">No calendar events found.</p>
              <p className="mt-1 text-sm text-[#64748B]">Create an event or adjust the filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left">
                <thead className="border-b border-[#E2E8F0] bg-white">
                  <tr>
                    {['Event', 'Date', 'Type', 'Status', 'Actions'].map((label) => (
                      <th key={label} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748B]">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {visibleItems.map((item) => (
                    <tr key={item.id} className="transition-colors hover:bg-[#F8FAFC]">
                      <td className="px-5 py-4 align-top">
                        <p className="text-sm font-semibold text-[#1C2434]">{item.title}</p>
                        <p className="mt-1 max-w-[360px] text-sm text-[#64748B]">{item.description || item.location || 'No description'}</p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 align-top text-sm text-[#64748B]">
                        {formatDate(item.startDate)}{item.endDate ? ` – ${formatDate(item.endDate)}` : ''}
                      </td>
                      <td className="px-5 py-4 align-top"><span className="rounded-md bg-[#F1F5F9] px-2 py-1 text-xs font-semibold text-[#64748B]">{item.type === 'HOLIDAY' ? 'Holiday' : 'Event'}</span></td>
                      <td className="px-5 py-4 align-top"><span className={item.isActive ? 'rounded-md bg-[#10B981]/10 px-2 py-1 text-xs font-semibold text-[#047857]' : 'rounded-md bg-[#F1F5F9] px-2 py-1 text-xs font-semibold text-[#64748B]'}>{item.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td className="px-5 py-4 align-top"><div className="flex justify-end gap-1"><Button aria-label={`Edit ${item.title}`} size="sm" variant="ghost" onClick={() => openEdit(item)}><Pencil size={15} /></Button><Button aria-label={`Delete ${item.title}`} disabled={Boolean(savingId) || Boolean(deletingId)} size="sm" variant="ghost" onClick={() => void deleteEvent(item)}><Trash2 size={15} className="text-[#EF4444]" /></Button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.pagination.totalPages > 1 ? (
            <div className="flex items-center justify-between gap-3 border-t border-[#E2E8F0] bg-[#F1F5F9]/30 px-5 py-4">
              <p className="text-sm text-[#64748B]">Page {result.pagination.page} of {result.pagination.totalPages}</p>
              <div className="flex gap-2"><Button size="sm" variant="outline" disabled={isLoading || page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button><Button size="sm" variant="outline" disabled={isLoading || page >= result.pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button></div>
            </div>
          ) : null}
        </section>

        <Modal open={isFormOpen} onClose={() => closeForm()} title={editingItem ? 'Edit calendar event' : 'New calendar event'}>
          <form className="grid gap-4" onSubmit={submitForm}>
            <Field label="Title"><input className={fieldClass} required maxLength={255} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} /></Field>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Type"><Select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as AcademicCalendarEventType }))}><option value="EVENT">Event</option><option value="HOLIDAY">Holiday</option></Select></Field><Field label="Sort order"><input className={fieldClass} min={0} type="number" value={form.sortOrder} onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))} /></Field></div>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Start date"><input className={fieldClass} required type="date" value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} /></Field><Field label="End date"><input className={fieldClass} type="date" value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} /></Field></div>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Time"><input className={fieldClass} maxLength={100} placeholder="08:00 - 10:00" value={form.eventTime} onChange={(event) => setForm((current) => ({ ...current, eventTime: event.target.value }))} /></Field><Field label="Location"><input className={fieldClass} maxLength={255} value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} /></Field></div>
            <Field label="Description"><textarea className={`${fieldClass} min-h-24 resize-y`} maxLength={5000} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></Field>
            <label className="flex items-center gap-2 text-sm font-medium text-[#1C2434]"><input checked={form.isActive} type="checkbox" onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} /> Active on public calendar</label>
            <div className="flex justify-end gap-2 border-t border-[#E2E8F0] pt-4"><Button type="button" variant="outline" disabled={Boolean(savingId)} onClick={() => closeForm()}>Cancel</Button><Button type="submit" disabled={Boolean(savingId)}>{savingId ? 'Saving...' : editingItem ? 'Update event' : 'Create event'}</Button></div>
          </form>
        </Modal>
      </section>
    </AppShell>
  );
}
