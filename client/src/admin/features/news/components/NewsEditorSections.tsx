import type { ReactNode } from 'react';
import { ArrowLeft, ImagePlus, Save, X } from 'lucide-react';
import { adminApi, type NewsCategory, type NewsStatus, type NewsTag } from '@/admin/api/adminApi';
import Button from '@/admin/components/ui/Button';
import Field from '@/admin/components/ui/Field';
import Select from '@/admin/components/ui/Select';
import {
  NEWS_EDITOR_FORM_ID,
  NEWS_INPUT_CLASS,
  isCategorySelectable,
  type NewsForm,
  type UpdateNewsForm,
} from '@/admin/features/news/newsEditorModel';
import { NEWS_STATUS_OPTIONS } from '@/admin/features/news/newsUtils';

export function NewsEditorMessage({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      {message}
    </div>
  );
}

export function NewsEditorHeader({
  isEditing,
  isLoading,
  isSaving,
  onClose,
}: {
  isEditing: boolean;
  isLoading: boolean;
  isSaving: boolean;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <button
          aria-label="Close news editor"
          className="mt-0.5 grid h-9 w-9 place-items-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:border-[#7e1518]/30 hover:text-[#7e1518]"
          type="button"
          onClick={onClose}
        >
          <ArrowLeft size={17} />
        </button>
        <div>
          <p className="text-sm text-gray-500">Content / News / {isEditing ? 'Edit' : 'New'}</p>
          <h1 className="mt-1 text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit news post' : 'Create a news post'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEditing
              ? 'Update the article content and publication settings.'
              : 'Write a story and save it as a draft or publish it.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          <X size={15} className="mr-1.5 inline" />
          Close
        </Button>
        <Button
          className="inline-flex items-center gap-2"
          disabled={isLoading || isSaving}
          form={NEWS_EDITOR_FORM_ID}
          type="submit"
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save News'}
        </Button>
      </div>
    </div>
  );
}

export function ArticleSection({
  form,
  onContentChange,
  onExcerptChange,
  onSlugChange,
  onTitleChange,
}: {
  form: NewsForm;
  onContentChange: (value: string) => void;
  onExcerptChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onTitleChange: (value: string) => void;
}) {
  return (
    <EditorSection title="Article" description="Main content shown on the public news detail page.">
      <div className="grid gap-5 p-5">
        <Field label="Title">
          <input
            autoFocus
            className={NEWS_INPUT_CLASS}
            maxLength={255}
            placeholder="Enter the news headline"
            required
            value={form.title}
            onChange={(event) => onTitleChange(event.target.value)}
          />
        </Field>

        <Field label="Slug">
          <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white focus-within:border-[#7e1518] focus-within:ring-2 focus-within:ring-[#7e1518]/10">
            <span className="grid place-items-center border-r border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
              /news/
            </span>
            <input
              className="min-w-0 flex-1 px-3 py-2.5 text-sm outline-none"
              maxLength={255}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              required
              value={form.slug}
              onChange={(event) => onSlugChange(event.target.value)}
            />
          </div>
        </Field>

        <Field label="Excerpt">
          <textarea
            className={`${NEWS_INPUT_CLASS} min-h-28 resize-y`}
            maxLength={2000}
            placeholder="A short introduction for news cards and search results"
            value={form.excerpt}
            onChange={(event) => onExcerptChange(event.target.value)}
          />
        </Field>

        <Field label="Article content">
          <textarea
            className={`${NEWS_INPUT_CLASS} min-h-[420px] resize-y leading-7`}
            placeholder="Write the full article here..."
            value={form.content}
            onChange={(event) => onContentChange(event.target.value)}
          />
        </Field>
      </div>
    </EditorSection>
  );
}

export function SeoSection({
  form,
  onFieldChange,
}: {
  form: NewsForm;
  onFieldChange: UpdateNewsForm;
}) {
  return (
    <EditorSection title="SEO" description="Optional title and description for search engines.">
      <div className="grid gap-5 p-5">
        <Field label="SEO title">
          <input
            className={NEWS_INPUT_CLASS}
            maxLength={255}
            placeholder={form.title || 'Search result title'}
            value={form.seoTitle}
            onChange={(event) => onFieldChange('seoTitle', event.target.value)}
          />
        </Field>
        <Field label="SEO description">
          <textarea
            className={`${NEWS_INPUT_CLASS} min-h-24 resize-y`}
            maxLength={2000}
            placeholder={form.excerpt || 'Search result description'}
            value={form.seoDescription}
            onChange={(event) => onFieldChange('seoDescription', event.target.value)}
          />
        </Field>
      </div>
    </EditorSection>
  );
}

export function PublicationSection({
  categories,
  form,
  onFieldChange,
}: {
  categories: NewsCategory[];
  form: NewsForm;
  onFieldChange: UpdateNewsForm;
}) {
  return (
    <EditorSection title="Publication">
      <div className="grid gap-4 p-5">
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

        <Field label="Author byline">
          <input
            className={NEWS_INPUT_CLASS}
            maxLength={150}
            placeholder="MWS Editorial Team"
            value={form.authorName}
            onChange={(event) => onFieldChange('authorName', event.target.value)}
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

        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-3 text-sm font-medium text-gray-700">
          <input
            className="h-4 w-4 accent-[#7e1518]"
            type="checkbox"
            checked={form.isFeatured}
            onChange={(event) => onFieldChange('isFeatured', event.target.checked)}
          />
          Feature this story
        </label>
      </div>
    </EditorSection>
  );
}

export function CoverImageSection({
  form,
  onFieldChange,
  onOpenAssetPicker,
  onRemoveCover,
}: {
  form: NewsForm;
  onFieldChange: UpdateNewsForm;
  onOpenAssetPicker: () => void;
  onRemoveCover: () => void;
}) {
  const galleryButton = (
    <Button
      className="inline-flex items-center gap-1.5"
      size="sm"
      type="button"
      variant="outline"
      onClick={onOpenAssetPicker}
    >
      <ImagePlus size={14} />
      Gallery
    </Button>
  );

  return (
    <EditorSection title="Cover image" action={galleryButton}>
      <div className="grid gap-4 p-5">
        {form.coverImage ? (
          <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
            <img
              className="aspect-video w-full object-cover"
              src={adminApi.publicAssetUrl(form.coverImage)}
              alt={form.coverImageAlt || 'Cover preview'}
            />
            <button
              aria-label="Remove cover image"
              className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
              type="button"
              onClick={onRemoveCover}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            className="grid aspect-video place-items-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm font-medium text-gray-500 transition-colors hover:border-[#7e1518] hover:text-[#7e1518]"
            type="button"
            onClick={onOpenAssetPicker}
          >
            <span className="grid justify-items-center gap-2">
              <ImagePlus size={22} />
              Choose from Gallery Library
            </span>
          </button>
        )}

        <Field label="Image path or URL">
          <input
            className={NEWS_INPUT_CLASS}
            maxLength={1000}
            placeholder="/api/gallery-images/..."
            value={form.coverImage}
            onChange={(event) => onFieldChange('coverImage', event.target.value)}
          />
        </Field>

        <Field label="Alternative text">
          <input
            className={NEWS_INPUT_CLASS}
            maxLength={255}
            placeholder="Describe the image"
            value={form.coverImageAlt}
            onChange={(event) => onFieldChange('coverImageAlt', event.target.value)}
          />
        </Field>
      </div>
    </EditorSection>
  );
}

export function TagsSection({
  selectedTagIds,
  tags,
  onToggleTag,
}: {
  selectedTagIds: string[];
  tags: NewsTag[];
  onToggleTag: (tagId: string) => void;
}) {
  return (
    <EditorSection title="Tags" description="Select all tags that apply.">
      <div className="p-5">
        {!tags.length ? (
          <p className="text-sm text-gray-500">No news tags available.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <button
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'border-[#7e1518] bg-[#7e1518] text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-[#7e1518]/40 hover:text-[#7e1518]'
                  }`}
                  key={tag.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onToggleTag(tag.id)}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </EditorSection>
  );
}

function EditorSection({
  action,
  children,
  description,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <header className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
        <div>
          <h2 className="font-semibold text-gray-900">{title}</h2>
          {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
