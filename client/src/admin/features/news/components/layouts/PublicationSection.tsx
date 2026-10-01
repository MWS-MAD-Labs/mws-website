import type { NewsCategory, NewsStatus, NewsTag } from '@/admin/api/adminApi';

import Field from '@/admin/components/ui/Field';
import Select from '@/admin/components/ui/Select';

import {
  NEWS_INPUT_CLASS,
  isCategorySelectable,
  type NewsForm,
  type UpdateNewsForm,
} from '@/admin/features/news/newsEditorModel';

import { NEWS_STATUS_OPTIONS } from '@/admin/features/news/newsUtils';

import EditorSection from './EditorSection';

export default function PublicationSection({
  categories,
  form,
  tags,
  onFieldChange,
  onToggleTag,
}: {
  categories: NewsCategory[];
  form: NewsForm;
  tags: NewsTag[];
  onFieldChange: UpdateNewsForm;
  onToggleTag: (tagId: string) => void;
}) {
  return (
    <EditorSection title="Publishing" description="Choose where and when this story should appear.">
      <div className="space-y-5 p-5">
        <div className="grid gap-5 lg:grid-cols-2">
          <Field label="Category">
            <Select
              className="w-full"
              value={form.categoryId}
              onChange={(event) => onFieldChange('categoryId', event.target.value)}
            >
              <option value="">Uncategorized</option>

              {categories
                .filter((category) => isCategorySelectable(category, form.categoryId))
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </Select>
          </Field>

          <Field label="Author">
            <input
              className={NEWS_INPUT_CLASS}
              maxLength={150}
              placeholder="MWS Editorial Team"
              value={form.authorName}
              onChange={(event) => onFieldChange('authorName', event.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <Field label="Status">
            <Select
              className="w-full"
              value={form.status}
              onChange={(event) => onFieldChange('status', event.target.value as NewsStatus)}
            >
              {NEWS_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Publish date">
            <input
              className={NEWS_INPUT_CLASS}
              type="datetime-local"
              value={form.publishedAt}
              onChange={(event) => onFieldChange('publishedAt', event.target.value)}
            />
          </Field>

          <Field label="Read time (minutes)">
            <input
              className={NEWS_INPUT_CLASS}
              min={0}
              max={9999}
              type="number"
              value={form.readTime}
              onChange={(event) => onFieldChange('readTime', event.target.value)}
            />
          </Field>
        </div>

        <div>
          <label className="flex min-h-[42px] cursor-pointer items-center gap-2 text-sm font-medium text-[#1C2434]">
            <input
              className="h-4 w-4 accent-[#3C50E0]"
              type="checkbox"
              checked={form.isFeatured}
              onChange={(event) => onFieldChange('isFeatured', event.target.checked)}
            />
            Feature this story
          </label>
        </div>

        <div className="border-t border-[#E2E8F0] pt-5">
          <div className="mb-3">
            <h3 className="text-sm font-medium text-[#1C2434]">Tags</h3>

            <p className="mt-1 text-xs text-[#64748B]">Select all tags that apply to this story.</p>
          </div>

          {!tags.length ? (
            <p className="text-sm text-[#64748B]">No news tags available.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = form.tagIds.includes(tag.id);

                return (
                  <button
                    key={tag.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onToggleTag(tag.id)}
                    className={[
                      'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                      isSelected
                        ? 'border-[#3C50E0] bg-[#3C50E0] text-white'
                        : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#3C50E0]/40 hover:text-[#3C50E0]',
                    ].join(' ')}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </EditorSection>
  );
}
