import { moveItem, slugify } from '../../utils/contactPageEditorUtils';
import {
  AddRowButton,
  RowActions,
  SectionCard,
  TextAreaField,
  TextField,
} from './ContactEditorControls';
import type { ContactEditorSectionProps } from './types';

export default function ContactForm({
  content,
  isBusy = false,
  updateContent,
}: ContactEditorSectionProps) {
  const categories = content.form.categories;

  function setCategories(next: typeof categories) {
    updateContent((current) => ({ ...current, form: { ...current.form, categories: next } }));
  }

  function renameCategory(index: number, label: string) {
    setCategories(
      categories.map((category, categoryIndex) => {
        if (categoryIndex !== index) return category;
        // Keep a stored value (e.g. "hr") unless it was generated from the old label.
        const followsLabel = !category.value || category.value === slugify(category.label);
        return { label, value: followsLabel ? slugify(label) : category.value };
      }),
    );
  }

  return (
    <SectionCard
      number="02"
      title="Contact Form"
      description="The message form visitors fill in. Messages arrive in Inquiries."
    >
      <TextField
        label="Form title"
        disabled={isBusy}
        value={content.form.title}
        placeholder="Send us a message"
        onChange={(value) =>
          updateContent((current) => ({ ...current, form: { ...current.form, title: value } }))
        }
      />

      <TextAreaField
        label="Message after sending"
        hint="Shown to the visitor after their message is sent."
        disabled={isBusy}
        rows={3}
        value={content.form.successMessage}
        onChange={(value) =>
          updateContent((current) => ({
            ...current,
            form: { ...current.form, successMessage: value },
          }))
        }
      />

      <div>
        <p className="text-sm font-semibold text-[#1C2434]">Categories</p>
        <p className="mt-0.5 text-xs text-[#64748B]">
          Visitors pick one of these. The order here is the order in the dropdown.
        </p>

        <ol className="mt-3 space-y-2">
          {categories.map((category, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-right text-xs tabular-nums text-[#94A3B8]">
                {index + 1}
              </span>
              <input
                aria-label={`Category ${index + 1}`}
                disabled={isBusy}
                value={category.label}
                placeholder="e.g. Admissions & Tours"
                onChange={(event) => renameCategory(index, event.currentTarget.value)}
                className="h-10 min-w-0 flex-1 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#3C50E0]"
              />
              <RowActions
                index={index}
                count={categories.length}
                label={`category ${index + 1}`}
                disabled={isBusy}
                onMove={(direction) => setCategories(moveItem(categories, index, direction))}
                onRemove={() =>
                  setCategories(categories.filter((_, categoryIndex) => categoryIndex !== index))
                }
              />
            </li>
          ))}
        </ol>

        <div className="mt-3">
          <AddRowButton
            label="Add category"
            disabled={isBusy}
            onClick={() => setCategories([...categories, { label: '', value: '' }])}
          />
        </div>
      </div>
    </SectionCard>
  );
}
