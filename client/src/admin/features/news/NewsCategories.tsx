import { FolderOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { NewsCategory, NewsCategoryPayload } from '@/admin/api/adminApi';
import Button from '@/admin/components/ui/Button';
import Modal from '@/admin/components/ui/Modal';
import SearchInput from '@/admin/components/ui/SearchInput';

type CategoryFormState = {
  description: string;
  isActive: boolean;
  name: string;
  slug: string;
};

type CategoryFormErrors = Partial<Record<keyof CategoryFormState, string>>;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FIELD_CLASS =
  'w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm outline-none transition focus:border-[#3C50E0] focus:ring-2 focus:ring-[#3C50E0]/10';

export default function NewsCategories({
  categories,
  deletingId,
  isLoading,
  savingId,
  search,
  onCreate,
  onDelete,
  onSearchChange,
  onUpdate,
}: {
  categories: NewsCategory[];
  deletingId: string | null;
  isLoading: boolean;
  savingId: string | null;
  search: string;
  onCreate: (payload: NewsCategoryPayload) => Promise<boolean>;
  onDelete: (category: NewsCategory) => Promise<void>;
  onSearchChange: (value: string) => void;
  onUpdate: (category: NewsCategory, payload: NewsCategoryPayload) => Promise<boolean>;
}) {
  const [editingCategory, setEditingCategory] = useState<NewsCategory | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<CategoryFormState>(createEmptyForm);
  const [errors, setErrors] = useState<CategoryFormErrors>({});
  const isFormOpen = formMode !== null;
  const isSaving = savingId === (editingCategory?.id ?? 'create');

  function openCreateForm() {
    setEditingCategory(null);
    setFormMode('create');
    setForm(createEmptyForm());
    setErrors({});
  }

  function openEditForm(category: NewsCategory) {
    setEditingCategory(category);
    setFormMode('edit');
    setForm({
      description: category.description ?? '',
      isActive: category.isActive,
      name: category.name,
      slug: category.slug,
    });
    setErrors({});
  }

  function closeForm() {
    if (isSaving) return;
    resetForm();
  }

  function resetForm() {
    setEditingCategory(null);
    setFormMode(null);
    setForm(createEmptyForm());
    setErrors({});
  }

  function updateForm<Key extends keyof CategoryFormState>(
    key: Key,
    value: CategoryFormState[Key],
  ) {
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

    const nextErrors = validateCategoryForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const payload: NewsCategoryPayload = {
      description: form.description.trim() || null,
      isActive: form.isActive,
      name: form.name.trim(),
      slug: form.slug.trim(),
    };

    const saved = editingCategory
      ? await onUpdate(editingCategory, payload)
      : await onCreate(payload);

    if (saved) resetForm();
  }

  async function deleteCategory(category: NewsCategory) {
    const articleLabel = category._count.posts === 1 ? 'article' : 'articles';
    const confirmed = window.confirm(
      `Delete "${category.name}"? ${category._count.posts} ${articleLabel} will become uncategorized.`,
    );

    if (!confirmed) return;
    await onDelete(category);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      <ListHeader total={categories.length} onCreateClick={openCreateForm} />

      <FilterBar search={search} onSearchChange={onSearchChange} />

      <CategoryRows
        categories={categories}
        deletingId={deletingId}
        isLoading={isLoading}
        search={search}
        onDelete={deleteCategory}
        onEdit={openEditForm}
      />

      <Modal
        open={isFormOpen}
        title={editingCategory ? 'Edit category' : 'Create category'}
        onClose={closeForm}
      >
        <form className="space-y-4" onSubmit={submitForm}>
          <FormField error={errors.name} label="Name">
            <input
              className={FIELD_CLASS}
              disabled={isSaving}
              maxLength={100}
              value={form.name}
              onChange={(event) => updateName(event.target.value)}
            />
          </FormField>

          <FormField error={errors.slug} label="Slug">
            <input
              className={FIELD_CLASS}
              disabled={isSaving}
              maxLength={100}
              value={form.slug}
              onChange={(event) => updateForm('slug', event.target.value)}
            />
          </FormField>

          <FormField error={errors.description} label="Description">
            <textarea
              className={`${FIELD_CLASS} min-h-28 resize-y`}
              disabled={isSaving}
              maxLength={2000}
              value={form.description}
              onChange={(event) => updateForm('description', event.target.value)}
            />
          </FormField>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#1C2434]">
            <input
              className="h-4 w-4 accent-[#3C50E0]"
              disabled={isSaving}
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => updateForm('isActive', event.target.checked)}
            />
            Active
          </label>

          <div className="flex justify-end gap-2 border-t border-[#E2E8F0] pt-4">
            <Button disabled={isSaving} type="button" variant="outline" onClick={closeForm}>
              Cancel
            </Button>

            <Button disabled={isSaving} type="submit">
              {isSaving ? 'Saving...' : 'Save category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function ListHeader({ total, onCreateClick }: { total: number; onCreateClick: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] px-5 py-4">
      <div>
        <h2 className="font-semibold text-[#1C2434]">News categories</h2>

        <p className="mt-0.5 text-sm text-[#64748B]">
          {total} {total === 1 ? 'category' : 'categories'}
        </p>
      </div>

      <Button className="gap-2" size="sm" type="button" onClick={onCreateClick}>
        <Plus size={15} />
        New category
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
    <div className="border-b border-[#E2E8F0] bg-[#F1F5F9] px-5 py-4">
      <SearchInput
        placeholder="Search category..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </div>
  );
}

function CategoryRows({
  categories,
  deletingId,
  isLoading,
  search,
  onDelete,
  onEdit,
}: {
  categories: NewsCategory[];
  deletingId: string | null;
  isLoading: boolean;
  search: string;
  onDelete: (category: NewsCategory) => void;
  onEdit: (category: NewsCategory) => void;
}) {
  if (isLoading) {
    return <div className="p-10 text-center text-sm text-[#64748B]">Loading categories...</div>;
  }

  if (!categories.length) {
    return (
      <div className="p-10 text-center">
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-md bg-[#F1F5F9] text-[#64748B]">
          <FolderOpen size={18} />
        </div>

        <p className="mt-3 font-medium text-[#1C2434]">No categories found.</p>

        <p className="mt-1 text-sm text-[#64748B]">
          {search ? 'Try a different search term.' : 'There are no news categories to display.'}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile */}
      <div className="divide-y divide-[#E2E8F0] lg:hidden">
        {categories.map((category) => (
          <MobileCategoryRow
            category={category}
            deletingId={deletingId}
            key={category.id}
            onDelete={() => onDelete(category)}
            onEdit={() => onEdit(category)}
          />
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[700px] border-collapse">
          <TableHeader />

          <tbody className="divide-y divide-[#E2E8F0]">
            {categories.map((category) => (
              <CategoryTableRow
                category={category}
                deletingId={deletingId}
                key={category.id}
                onDelete={() => onDelete(category)}
                onEdit={() => onEdit(category)}
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
      <tr className="border-y border-[#E2E8F0] bg-[#F1F5F9] text-left">
        <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
          Category
        </th>

        <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
          Slug
        </th>

        <th className="px-5 py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
          Articles
        </th>

        <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
          Status
        </th>

        <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
          Actions
        </th>
      </tr>
    </thead>
  );
}

function CategoryTableRow({
  category,
  deletingId,
  onDelete,
  onEdit,
}: {
  category: NewsCategory;
  deletingId: string | null;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <tr className="transition-colors hover:bg-[#F1F5F9]/50">
      {/* Category */}
      <td className="px-5 py-4 align-middle">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#1C2434]">{category.name}</p>

          {category.description ? (
            <p className="mt-1 line-clamp-1 text-xs text-[#64748B]">{category.description}</p>
          ) : null}
        </div>
      </td>

      {/* Slug */}
      <td className="px-5 py-4 align-middle">
        <span className="text-sm text-[#64748B]">/{category.slug}</span>
      </td>

      {/* Articles */}
      <td className="px-5 py-4 text-center align-middle">
        <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-[#F1F5F9] px-2 py-1 text-xs font-semibold text-[#64748B]">
          {category._count.posts}
        </span>
      </td>

      {/* Status */}
      <td className="px-5 py-4 text-right align-middle">
        <span
          className={[
            'inline-flex rounded-md px-2 py-1 text-[11px] font-semibold',
            category.isActive ? 'bg-[#10B981]/10 text-[#047857]' : 'bg-[#F1F5F9] text-[#64748B]',
          ].join(' ')}
        >
          {category.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-4 align-middle">
        <div className="flex items-center justify-end gap-1.5">
          <Button
            aria-label={`Edit ${category.name}`}
            className="h-9 w-9 rounded-md p-0"
            size="sm"
            type="button"
            variant="outline"
            onClick={onEdit}
          >
            <Pencil size={14} />
          </Button>

          <Button
            aria-label={`Delete ${category.name}`}
            className="h-9 w-9 rounded-md p-0"
            disabled={deletingId === category.id}
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

function MobileCategoryRow({
  category,
  deletingId,
  onDelete,
  onEdit,
}: {
  category: NewsCategory;
  deletingId: string | null;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <article className="p-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-[#1C2434]">{category.name}</h3>

          <p className="mt-1 truncate text-xs text-[#64748B]">/{category.slug}</p>

          {category.description ? (
            <p className="mt-1 line-clamp-2 text-xs text-[#64748B]">{category.description}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className={[
              'rounded-md px-2 py-1 text-[11px] font-semibold',
              category.isActive ? 'bg-[#10B981]/10 text-[#047857]' : 'bg-[#F1F5F9] text-[#64748B]',
            ].join(' ')}
          >
            {category.isActive ? 'Active' : 'Inactive'}
          </span>

          <Button
            aria-label={`Edit ${category.name}`}
            className="h-8 w-8 rounded-md p-0"
            size="sm"
            type="button"
            variant="outline"
            onClick={onEdit}
          >
            <Pencil size={14} />
          </Button>

          <Button
            aria-label={`Delete ${category.name}`}
            className="h-8 w-8 rounded-md p-0"
            disabled={deletingId === category.id}
            size="sm"
            type="button"
            variant="danger"
            onClick={onDelete}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#E2E8F0] pt-3">
        <span className="text-xs text-[#64748B]">Articles</span>

        <span className="text-xs font-semibold text-[#64748B]">{category._count.posts}</span>
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
      <span className="text-sm font-semibold text-[#1C2434]">{label}</span>

      <div className="mt-1">{children}</div>

      {error ? <p className="mt-1 text-xs text-[#EF4444]">{error}</p> : null}
    </label>
  );
}

function createEmptyForm(): CategoryFormState {
  return {
    description: '',
    isActive: true,
    name: '',
    slug: '',
  };
}

function validateCategoryForm(form: CategoryFormState) {
  const errors: CategoryFormErrors = {};

  if (!form.name.trim()) {
    errors.name = 'Name is required.';
  } else if (form.name.trim().length > 100) {
    errors.name = 'Name must be 100 characters or fewer.';
  }

  if (!form.slug.trim()) {
    errors.slug = 'Slug is required.';
  } else if (!SLUG_PATTERN.test(form.slug.trim())) {
    errors.slug = 'Use lowercase letters, numbers, and hyphens only.';
  } else if (form.slug.trim().length > 100) {
    errors.slug = 'Slug must be 100 characters or fewer.';
  }

  if (form.description.trim().length > 2000) {
    errors.description = 'Description must be 2000 characters or fewer.';
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
