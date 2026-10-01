import Field from '@/admin/components/ui/Field';
import Tiptap from '@/admin/components/Tiptap';

import { NEWS_INPUT_CLASS, type NewsForm } from '@/admin/features/news/newsEditorModel';

import EditorSection from './EditorSection';

export default function ArticleSection({
  form,
  onContentChange,
  onExcerptChange,
  onSlugChange,
  onTitleChange,
  onSeoTitleChange,
  onSeoDescriptionChange,
}: {
  form: NewsForm;
  onContentChange: (value: string) => void;
  onExcerptChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onSeoTitleChange: (value: string) => void;
  onSeoDescriptionChange: (value: string) => void;
}) {
  return (
    <EditorSection
      title="Article"
      description="Write the story exactly as it should appear on the public website."
    >
      <div className="space-y-5 p-5">
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

        <Field label="Excerpt">
          <textarea
            className={`${NEWS_INPUT_CLASS} min-h-28 resize-y`}
            maxLength={2000}
            placeholder="A short introduction displayed below the title."
            value={form.excerpt}
            onChange={(event) => onExcerptChange(event.target.value)}
          />
        </Field>

        <Field as="div" label="Article content">
          <Tiptap
            ariaLabel="Article content"
            placeholder="Write the story…"
            size="article"
            value={form.content}
            onChange={onContentChange}
          />
        </Field>

        <div className="border-t border-[#E2E8F0] pt-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#1C2434]">Search & URL</h3>

            <p className="mt-1 text-xs text-[#64748B]">
              Optional settings for the article URL and search engines.
            </p>
          </div>

          <div className="space-y-5">
            <Field label="Article URL">
              <div className="flex overflow-hidden rounded-lg border border-[#E2E8F0] bg-white focus-within:border-[#3C50E0] focus-within:ring-2 focus-within:ring-[#3C50E0]/10">
                <span className="grid place-items-center border-r border-[#E2E8F0] bg-[#F1F5F9] px-3 text-sm text-[#64748B]">
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

            <Field label="SEO title">
              <input
                className={NEWS_INPUT_CLASS}
                maxLength={255}
                placeholder={form.title || 'Search result title'}
                value={form.seoTitle}
                onChange={(event) => onSeoTitleChange(event.target.value)}
              />
            </Field>

            <Field label="SEO description">
              <textarea
                className={`${NEWS_INPUT_CLASS} min-h-24 resize-y`}
                maxLength={2000}
                placeholder={form.excerpt || 'Search result description'}
                value={form.seoDescription}
                onChange={(event) => onSeoDescriptionChange(event.target.value)}
              />
            </Field>
          </div>
        </div>
      </div>
    </EditorSection>
  );
}
