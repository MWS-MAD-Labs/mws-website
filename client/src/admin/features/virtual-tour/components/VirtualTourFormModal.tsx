import { useState, type FormEvent } from 'react';
import type {
  VirtualTourListItem,
  VirtualTourPayload,
  VirtualTourStatus,
} from '@/admin/api/adminApi';
import Button from '@/admin/components/ui/Button';
import Field from '@/admin/components/ui/Field';
import Modal from '@/admin/components/ui/Modal';
import Select from '@/admin/components/ui/Select';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import { FIELD_CLASS, optionalText, toVirtualTourSlug } from '../virtualTourUtils';

type Props = {
  canPublish: boolean;
  isSaving: boolean;
  open: boolean;
  tour: VirtualTourListItem | null;
  onClose: () => void;
  onSubmit: (payload: VirtualTourPayload) => void;
};

type FormState = {
  title: string;
  slug: string;
  description: string;
  status: VirtualTourStatus;
};

const emptyForm: FormState = { title: '', slug: '', description: '', status: 'DRAFT' };

export default function VirtualTourFormModal({ canPublish, isSaving, open, tour, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<FormState>(() =>
    tour
      ? {
          title: tour.title,
          slug: tour.slug,
          description: tour.description ?? '',
          status: tour.status,
        }
      : emptyForm,
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(tour));
  const initialForm = tour
    ? {
        title: tour.title,
        slug: tour.slug,
        description: tour.description ?? '',
        status: tour.status,
      }
    : emptyForm;
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  function requestClose() {
    if (isDirty && !window.confirm('Discard unsaved virtual tour changes?')) return;
    onClose();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      title: form.title.trim(),
      slug: form.slug.trim(),
      description: optionalText(form.description),
      status: tour ? form.status : 'DRAFT',
    });
  }

  return (
    <Modal closeDisabled={isSaving} open={open} title={tour ? 'Edit virtual tour' : 'New virtual tour'} onClose={requestClose}>
      <form className="grid gap-4" onSubmit={submit}>
        <Field label="Title" required>
          <input
            className={FIELD_CLASS}
            disabled={isSaving}
            maxLength={255}
            required
            value={form.title}
            onChange={(event) => {
              const title = event.target.value;
              setForm((current) => ({
                ...current,
                title,
                slug: slugTouched ? current.slug : toVirtualTourSlug(title),
              }));
            }}
          />
        </Field>

        <Field label="Slug" hint="Lowercase letters, numbers, and hyphens only." required>
          <input
            className={FIELD_CLASS}
            disabled={isSaving}
            maxLength={255}
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            required
            value={form.slug}
            onChange={(event) => {
              setSlugTouched(true);
              setForm((current) => ({ ...current, slug: toVirtualTourSlug(event.target.value) }));
            }}
          />
        </Field>

        <Field label="Description">
          <textarea
            className={`${FIELD_CLASS} min-h-28 resize-y`}
            disabled={isSaving}
            maxLength={5000}
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
          />
        </Field>

        {tour ? (
          <Field label="Status" optional={false}>
            <Select
              disabled={isSaving}
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value as VirtualTourStatus,
                }))
              }
            >
              <option value="DRAFT">Draft</option>
              <option disabled={!canPublish} value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
          </Field>
        ) : null}

        {tour && !canPublish ? (
          <StatusMessage tone="warning">
            Add at least one active scene before publishing this tour.
          </StatusMessage>
        ) : null}

        <div className="flex justify-end gap-2 border-t border-[#E2E8F0] pt-4">
          <Button disabled={isSaving} type="button" variant="outline" onClick={requestClose}>
            Cancel
          </Button>
          <Button
            disabled={
              isSaving ||
              !form.title.trim() ||
              !form.slug.trim() ||
              (form.status === 'PUBLISHED' && !canPublish)
            }
            type="submit"
          >
            {isSaving ? 'Saving...' : tour ? 'Update tour' : 'Create tour'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
