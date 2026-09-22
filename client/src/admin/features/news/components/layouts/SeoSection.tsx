import Field from '@/admin/components/ui/Field';
import {
  NEWS_INPUT_CLASS,
  type NewsForm,
  type UpdateNewsForm,
} from '@/admin/features/news/newsEditorModel';
import EditorSection from './EditorSection';

export default function SeoSection({
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
