import Button from '@/admin/components/ui/Button';
import Field from '@/admin/components/ui/Field';
import Tiptap from '@/admin/components/Tiptap';
import ImageThumb from '@/admin/features/news/components/layouts/ImageThumb';
import { inputClass } from '@/admin/features/news/components/layouts/formStyles';
import { publicAssetUrl } from '@/lib/api';
import type { AcademicOverviewEditorState } from '../../hooks/useAcademicOverviewEditor';

const cardClass = 'min-w-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white';
const cardHeaderClass = 'border-b border-[#E2E8F0] px-5 py-4';
const cardTitleClass = 'text-base font-semibold text-[#1C2434]';
const cardHintClass = 'mt-1 text-sm text-[#64748B]';

type AcademicOverviewMainFormProps = {
  editor: AcademicOverviewEditorState;
};

export default function AcademicOverviewMainForm({ editor }: AcademicOverviewMainFormProps) {
  const {
    form,
    isBusy,
    setActiveImageField,
    updateApproachItem,
    updateContentSection,
    updateForm,
  } = editor;

  return (
    <div className="min-w-0 space-y-5">
      <section className={cardClass}>
        <div className={cardHeaderClass}>
          <h2 className={cardTitleClass}>Basic Information</h2>
          <p className={cardHintClass}>Content shown on the Academic overview page.</p>
        </div>

        <div className="grid gap-4 p-5">
          <Field label="Title">
            <input
              required
              className={inputClass}
              value={form.title}
              onChange={(event) => updateForm('title', event.target.value)}
            />
          </Field>

          <Field label="Description">
            <textarea
              className={`${inputClass} min-h-32 resize-y leading-6`}
              maxLength={2000}
              value={form.description}
              onChange={(event) => updateForm('description', event.target.value)}
            />
          </Field>

          <ImageField
            alt={form.title}
            disabled={isBusy}
            image={form.coverImage}
            label="Cover image"
            onAltChange={undefined}
            onChoose={() => setActiveImageField('cover')}
            onRemove={() => updateForm('coverImage', '')}
          />
        </div>
      </section>

      <section className={cardClass}>
        <div className={cardHeaderClass}>
          <h2 className={cardTitleClass}>Introduction</h2>
          <p className={cardHintClass}>The first editorial section below the page hero.</p>
        </div>

        <div className="grid gap-4 p-5">
          <Field label="Heading">
            <input
              className={inputClass}
              value={form.content.intro.title}
              onChange={(event) =>
                updateContentSection('intro', { title: event.target.value })
              }
            />
          </Field>

          <Field as="div" label="Body">
            <Tiptap
              ariaLabel="Academic introduction body"
              value={form.content.intro.body}
              onChange={(value) => updateContentSection('intro', { body: value })}
            />
          </Field>

          <ImageField
            alt={form.content.intro.imageAlt}
            disabled={isBusy}
            image={form.content.intro.image}
            label="Image"
            onAltChange={(value) => updateContentSection('intro', { imageAlt: value })}
            onChoose={() => setActiveImageField('intro')}
            onRemove={() => updateContentSection('intro', { image: '' })}
          />
        </div>
      </section>

      <section className={cardClass}>
        <div className={cardHeaderClass}>
          <h2 className={cardTitleClass}>Learning Experience</h2>
          <p className={cardHintClass}>The editorial section before the approach list.</p>
        </div>

        <div className="grid gap-4 p-5">
          <Field label="Heading">
            <input
              className={inputClass}
              value={form.content.experience.title}
              onChange={(event) =>
                updateContentSection('experience', { title: event.target.value })
              }
            />
          </Field>

          <Field as="div" label="Body">
            <Tiptap
              ariaLabel="Academic learning experience body"
              value={form.content.experience.body}
              onChange={(value) => updateContentSection('experience', { body: value })}
            />
          </Field>

          <ImageField
            alt={form.content.experience.imageAlt}
            disabled={isBusy}
            image={form.content.experience.image}
            label="Image"
            onAltChange={(value) => updateContentSection('experience', { imageAlt: value })}
            onChoose={() => setActiveImageField('experience')}
            onRemove={() => updateContentSection('experience', { image: '' })}
          />
        </div>
      </section>

      <section className={cardClass}>
        <div className={cardHeaderClass}>
          <h2 className={cardTitleClass}>Learning Approach</h2>
          <p className={cardHintClass}>Short points shown in the How We Teach section.</p>
        </div>

        <div className="divide-y divide-[#E2E8F0]">
          {form.content.approach.map((item, index) => (
            <div className="grid gap-4 p-5" key={index}>
              <Field label={`Point ${index + 1} title`}>
                <input
                  className={inputClass}
                  value={item.title}
                  onChange={(event) => updateApproachItem(index, { title: event.target.value })}
                />
              </Field>

              <Field label={`Point ${index + 1} body`}>
                <textarea
                  className={`${inputClass} min-h-24 resize-y leading-6`}
                  value={item.body}
                  onChange={(event) => updateApproachItem(index, { body: event.target.value })}
                />
              </Field>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

type ImageFieldProps = {
  alt: string;
  disabled: boolean;
  image: string;
  label: string;
  onAltChange?: (value: string) => void;
  onChoose: () => void;
  onRemove: () => void;
};

function ImageField({
  alt,
  disabled,
  image,
  label,
  onAltChange,
  onChoose,
  onRemove,
}: ImageFieldProps) {
  return (
    <Field as="div" label={label}>
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <ImageThumb
            src={image ? publicAssetUrl(image) : null}
            alt={alt}
            className="h-16 w-20"
          />

          <div className="flex flex-wrap gap-2">
            <Button
              disabled={disabled}
              size="sm"
              type="button"
              variant="outline"
              onClick={onChoose}
            >
              {image ? 'Change Image' : 'Choose Image'}
            </Button>

            {image ? (
              <Button
                disabled={disabled}
                size="sm"
                type="button"
                variant="ghost"
                onClick={onRemove}
              >
                Remove
              </Button>
            ) : null}
          </div>
        </div>

        {onAltChange ? (
          <Field label="Alt text">
            <input
              className={inputClass}
              value={alt}
              onChange={(event) => onAltChange(event.target.value)}
            />
          </Field>
        ) : null}
      </div>
    </Field>
  );
}
