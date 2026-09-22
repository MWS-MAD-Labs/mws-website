import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { NewsTag, NewsTagPayload } from '@/admin/api/adminApi';
import Button from '@/admin/components/ui/Button';
import Modal from '@/admin/components/ui/Modal';
import SearchInput from '@/admin/components/ui/SearchInput';

type TagFormState = {
  name: string;
  slug: string;
};

type TagFormErrors = Partial<Record<keyof TagFormState, string>>;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FIELD_CLASS =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#7e1518] focus:ring-2 focus:ring-[#7e1518]/10';

export default function NewsTags({
  deletingId,
  isLoading,
  savingId,
  search,
  tags,
  onCreate,
  onDelete,
  onSearchChange,
  onUpdate,
}: {
  deletingId: string | null;
  isLoading: boolean;
  savingId: string | null;
  search: string;
  tags: NewsTag[];
  onCreate: (payload: NewsTagPayload) => Promise<boolean>;
  onDelete: (tag: NewsTag) => Promise<void>;
  onSearchChange: (value: string) => void;
  onUpdate: (tag: NewsTag, payload: NewsTagPayload) => Promise<boolean>;
}) {
  const [editingTag, setEditingTag] = useState<NewsTag | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<TagFormState>(createEmptyForm);
  const [errors, setErrors] = useState<TagFormErrors>({});
  const isFormOpen = formMode !== null;
  const isSaving = savingId === (editingTag?.id ?? 'create');

  function openCreateForm() {
    setEditingTag(null);
    setFormMode('create');
    setForm(createEmptyForm());
    setErrors({});
  }

  function openEditForm(tag: NewsTag) {
    setEditingTag(tag);
    setFormMode('edit');
    setForm({
      name: tag.name,
      slug: tag.slug,
    });
    setErrors({});
  }

  function closeForm() {
    if (isSaving) return;
    resetForm();
  }

  function resetForm() {
    setEditingTag(null);
    setFormMode(null);
    setForm(createEmptyForm());
    setErrors({});
  }

  function updateForm<Key extends keyof TagFormState>(key: Key, value: TagFormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function updateName(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: current.slug ? current.slug : slugify(value),
    }));
    setErrors((current) => ({ ...current, name: undefined }));
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateTagForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const payload: NewsTagPayload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
    };

    const saved = editingTag ? await onUpdate(editingTag, payload) : await onCreate(payload);
    if (saved) resetForm();
  }

  async function deleteTag(tag: NewsTag) {
    const articleLabel = tag._count.postTags === 1 ? 'article' : 'articles';
    const confirmed = window.confirm(
      `Delete "${tag.name}"? It is currently used by ${tag._count.postTags} ${articleLabel}.`,
    );

    if (!confirmed) return;
    await onDelete(tag);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <ListHeader total={tags.length} onCreateClick={openCreateForm} />

      <FilterBar search={search} onSearchChange={onSearchChange} />

      <TagRows
        deletingId={deletingId}
        isLoading={isLoading}
        search={search}
        tags={tags}
        onDelete={deleteTag}
        onEdit={openEditForm}
      />

      <Modal open={isFormOpen} title={editingTag ? 'Edit tag' : 'Create tag'} onClose={closeForm}>
        <form className="space-y-4" onSubmit={submitForm}>
          <FormField error={errors.name} label="Name">
            <input
              className={FIELD_CLASS}
              disabled={isSaving}
              maxLength={80}
              value={form.name}
              onChange={(event) => updateName(event.target.value)}
            />
          </FormField>

          <FormField error={errors.slug} label="Slug">
            <input
              className={FIELD_CLASS}
              disabled={isSaving}
              maxLength={80}
              value={form.slug}
              onChange={(event) => updateForm('slug', event.target.value)}
            />
          </FormField>

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <Button disabled={isSaving} type="button" variant="outline" onClick={closeForm}>
              Cancel
            </Button>

            <Button disabled={isSaving} type="submit">
              {isSaving ? 'Saving...' : 'Save tag'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function ListHeader({ total, onCreateClick }: { total: number; onCreateClick: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-5 py-4">
      <div>
        <h2 className="font-semibold text-gray-900">News tags</h2>

        <p className="mt-0.5 text-sm text-gray-500">
          {total} {total === 1 ? 'tag' : 'tags'}
        </p>
      </div>

      <Button className="gap-2" size="sm" type="button" onClick={onCreateClick}>
        <Plus size={15} />
        New tag
      </Button>
    </div>
  );
}

function FilterBar({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="border-b border-gray-200 bg-gray-50/60 px-5 py-4">
      <SearchInput
        placeholder="Search tag..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </div>
  );
}

function TagRows({
  deletingId,
  isLoading,
  search,
  tags,
  onDelete,
  onEdit,
}: {
  deletingId: string | null;
  isLoading: boolean;
  search: string;
  tags: NewsTag[];
  onDelete: (tag: NewsTag) => void;
  onEdit: (tag: NewsTag) => void;
}) {
  if (isLoading) {
    return <div className="p-10 text-center text-sm text-gray-500">Loading tags...</div>;
  }

  if (!tags.length) {
    return (
      <div className="p-10 text-center">
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-md bg-gray-100 text-gray-400">
          <Tags size={18} />
        </div>

        <p className="mt-3 font-medium text-gray-700">No tags found.</p>

        <p className="mt-1 text-sm text-gray-500">
          {search ? 'Try a different search term.' : 'There are no news tags to display.'}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile */}
      <div className="divide-y divide-gray-200 lg:hidden">
        {tags.map((tag) => (
          <MobileTagRow
            deletingId={deletingId}
            key={tag.id}
            tag={tag}
            onDelete={() => onDelete(tag)}
            onEdit={() => onEdit(tag)}
          />
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[700px] border-collapse">
          <TableHeader />

          <tbody className="divide-y divide-gray-200">
            {tags.map((tag) => (
              <TagTableRow
                deletingId={deletingId}
                key={tag.id}
                tag={tag}
                onDelete={() => onDelete(tag)}
                onEdit={() => onEdit(tag)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function TableHeader() {
  return (
    <thead>
      <tr className="border-y border-[#e8e2e2] bg-[#faf8f7] text-left">
        <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6f6262]">
          Tag
        </th>

        <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6f6262]">
          Slug
        </th>

        <th className="px-5 py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#6f6262]">
          Articles
        </th>

        <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#6f6262]">
          Actions
        </th>
      </tr>
    </thead>
  );
}

function TagTableRow({
  deletingId,
  tag,
  onDelete,
  onEdit,
}: {
  deletingId: string | null;
  tag: NewsTag;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <tr className="transition-colors hover:bg-gray-50/50">
      {/* Tag */}
      <td className="px-5 py-4 align-middle">
        <p className="truncate text-sm font-semibold text-gray-900">{tag.name}</p>
      </td>

      {/* Slug */}
      <td className="px-5 py-4 align-middle">
        <span className="text-sm text-gray-500">/{tag.slug}</span>
      </td>

      {/* Articles */}
      <td className="px-5 py-4 text-center align-middle">
        <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
          {tag._count.postTags}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-4 align-middle">
        <div className="flex items-center justify-end gap-1.5">
          <Button
            aria-label={`Edit ${tag.name}`}
            className="h-9 w-9 rounded-md p-0"
            size="sm"
            type="button"
            variant="outline"
            onClick={onEdit}
          >
            <Pencil size={14} />
          </Button>

          <Button
            aria-label={`Delete ${tag.name}`}
            className="h-9 w-9 rounded-md p-0"
            disabled={deletingId === tag.id}
            size="sm"
            type="button"
            variant="danger"
            onClick={onDelete}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function MobileTagRow({
  deletingId,
  tag,
  onDelete,
  onEdit,
}: {
  deletingId: string | null;
  tag: NewsTag;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <article className="p-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-gray-900">{tag.name}</h3>

          <p className="mt-1 truncate text-xs text-gray-500">/{tag.slug}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            aria-label={`Edit ${tag.name}`}
            className="h-8 w-8 rounded-md p-0"
            size="sm"
            type="button"
            variant="outline"
            onClick={onEdit}
          >
            <Pencil size={14} />
          </Button>

          <Button
            aria-label={`Delete ${tag.name}`}
            className="h-8 w-8 rounded-md p-0"
            disabled={deletingId === tag.id}
            size="sm"
            type="button"
            variant="danger"
            onClick={onDelete}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-xs text-gray-400">Articles</span>

        <span className="text-xs font-semibold text-gray-600">{tag._count.postTags}</span>
      </div>
    </article>
  );
}

function FormField({
  children,
  error,
  label,
}: {
  children: ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-700">{label}</span>

      <div className="mt-1">{children}</div>

      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </label>
  );
}

function createEmptyForm(): TagFormState {
  return {
    name: '',
    slug: '',
  };
}

function validateTagForm(form: TagFormState) {
  const errors: TagFormErrors = {};

  if (!form.name.trim()) {
    errors.name = 'Name is required.';
  } else if (form.name.trim().length > 80) {
    errors.name = 'Name must be 80 characters or fewer.';
  }

  if (!form.slug.trim()) {
    errors.slug = 'Slug is required.';
  } else if (!SLUG_PATTERN.test(form.slug.trim())) {
    errors.slug = 'Use lowercase letters, numbers, and hyphens only.';
  } else if (form.slug.trim().length > 80) {
    errors.slug = 'Slug must be 80 characters or fewer.';
  }

  return errors;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
