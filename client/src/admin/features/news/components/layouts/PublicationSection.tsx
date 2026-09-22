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
    <EditorSection title="Publication">
      <div className="grid gap-5 p-5">
        {/* Status + Publish Date */}
        <div className="grid gap-5 lg:grid-cols-2">
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
        </div>

        {/* Author */}
        <Field label="Author byline">
          <input
            className={NEWS_INPUT_CLASS}
            maxLength={150}
            placeholder="MWS Editorial Team"
            value={form.authorName}
            onChange={(event) => onFieldChange('authorName', event.target.value)}
          />
        </Field>

        {/* Category + Read Time + Featured */}
        <div className="grid gap-5 lg:grid-cols-3">
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

          <div className="flex items-end">
            <label className="flex min-h-[42px] w-full cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700">
              <input
                className="h-4 w-4 accent-[#7e1518]"
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) => onFieldChange('isFeatured', event.target.checked)}
              />
              Feature this story
            </label>
          </div>
        </div>

        {/* Tags */}
        <div className="border-t border-gray-200 pt-5">
          <div className="mb-3">
            <h3 className="text-sm font-medium text-gray-700">Tags</h3>

            <p className="mt-1 text-xs text-gray-500">Select all tags that apply.</p>
          </div>

          {!tags.length ? (
            <p className="text-sm text-gray-500">No news tags available.</p>
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
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'border-[#7e1518] bg-[#7e1518] text-white'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-[#7e1518]/40 hover:text-[#7e1518]'
                    }`}
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
