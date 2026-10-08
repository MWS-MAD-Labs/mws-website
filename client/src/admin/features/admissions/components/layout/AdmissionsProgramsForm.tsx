import { Plus, Trash2 } from 'lucide-react';

import { adminApi } from '@/admin/api/adminApi';
import Button from '@/admin/components/ui/Button';
import Field from '@/admin/components/ui/Field';
import ImageThumb from '@/admin/features/news/components/layouts/ImageThumb';
import { inputClass } from '@/admin/features/news/components/layouts/formStyles';

import type { AdmissionsEditorState } from '../../hooks/useAdmissionsEditor';

const cardClass = 'min-w-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white';
const cardHeaderClass = 'border-b border-[#E2E8F0] px-5 py-4';
const cardTitleClass = 'text-base font-semibold text-[#1C2434]';
const cardHintClass = 'mt-1 text-sm text-[#64748B]';

type AdmissionsProgramsFormProps = {
  editor: AdmissionsEditorState;
};

type ImageFieldProps = {
  alt?: string;
  disabled: boolean;
  image?: string;
  label?: string;
  onAltChange?: (value: string) => void;
  onChoose: () => void;
  onRemove?: () => void;
};

function ImageField({
  alt = '',
  disabled,
  image = '',
  label = 'Image',
  onAltChange,
  onChoose,
  onRemove,
}: ImageFieldProps) {
  return (
    <Field as="div" label={label}>
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <ImageThumb
            src={image ? adminApi.publicAssetUrl(image) : null}
            alt={alt}
            className="h-16 w-20"
          />
          <div className="flex flex-wrap gap-2">
            <Button disabled={disabled} size="sm" type="button" variant="outline" onClick={onChoose}>
              {image ? 'Change Image' : 'Choose Image'}
            </Button>
            {image && onRemove ? (
              <Button disabled={disabled} size="sm" type="button" variant="ghost" onClick={onRemove}>
                Remove
              </Button>
            ) : null}
          </div>
        </div>

        {onAltChange ? (
          <input
            className={inputClass}
            disabled={disabled}
            placeholder="Alt text"
            value={alt}
            onChange={(event) => onAltChange(event.target.value)}
          />
        ) : null}
      </div>
    </Field>
  );
}

export default function AdmissionsProgramsForm({ editor }: AdmissionsProgramsFormProps) {
  const {
    addStep,
    content,
    isBusy,
    removeStep,
    saveAdmissions,
    setActiveImageTarget,
    updateContent,
    updateIntroParagraph,
    updateStep,
  } = editor;

  return (
    <form id="admissions-editor-form" className="min-w-0 space-y-5" onSubmit={saveAdmissions}>
      <section className={cardClass}>
        <div className={cardHeaderClass}>
          <h2 className={cardTitleClass}>Hero</h2>
          <p className={cardHintClass}>Primary heading, description, and cover image.</p>
        </div>
        <div className="grid gap-4 p-5">
          <Field label="Title">
            <input
              className={inputClass}
              disabled={isBusy}
              value={content.heroTitle}
              onChange={(event) =>
                updateContent((current) => ({ ...current, heroTitle: event.target.value }))
              }
            />
          </Field>
          <Field label="Subtitle">
            <textarea
              className={`${inputClass} min-h-24 resize-y leading-6`}
              disabled={isBusy}
              value={content.heroSubtitle}
              onChange={(event) =>
                updateContent((current) => ({ ...current, heroSubtitle: event.target.value }))
              }
            />
          </Field>
          <ImageField
            alt={content.heroImageAlt}
            disabled={isBusy}
            image={content.heroImage}
            label="Hero image"
            onAltChange={(value) =>
              updateContent((current) => ({ ...current, heroImageAlt: value }))
            }
            onChoose={() => setActiveImageTarget({ type: 'hero' })}
            onRemove={() => updateContent((current) => ({ ...current, heroImage: '' }))}
          />
        </div>
      </section>

      <section className={cardClass}>
        <div className={cardHeaderClass}>
          <h2 className={cardTitleClass}>Introduction</h2>
          <p className={cardHintClass}>Intro copy and media shown below the breadcrumb.</p>
        </div>
        <div className="grid gap-4 p-5">
          <Field label="Menu title">
            <input
              className={inputClass}
              disabled={isBusy}
              value={content.menuTitle}
              onChange={(event) =>
                updateContent((current) => ({ ...current, menuTitle: event.target.value }))
              }
            />
          </Field>
          <Field label="Ready CTA title">
            <input
              className={inputClass}
              disabled={isBusy}
              value={content.readyTitle}
              onChange={(event) =>
                updateContent((current) => ({ ...current, readyTitle: event.target.value }))
              }
            />
          </Field>
          <Field label="Intro heading">
            <input
              className={inputClass}
              disabled={isBusy}
              value={content.introTitle}
              onChange={(event) =>
                updateContent((current) => ({ ...current, introTitle: event.target.value }))
              }
            />
          </Field>
          {content.introBody.map((paragraph, index) => (
            <Field key={index} label={`Intro paragraph ${index + 1}`}>
              <textarea
                className={`${inputClass} min-h-24 resize-y leading-6`}
                disabled={isBusy}
                value={paragraph}
                onChange={(event) => updateIntroParagraph(index, event.target.value)}
              />
            </Field>
          ))}
          <ImageField
            alt={content.introMedia.alt}
            disabled={isBusy}
            image={content.introMedia.src}
            label="Intro media"
            onAltChange={(value) =>
              updateContent((current) => ({
                ...current,
                introMedia: { ...current.introMedia, alt: value },
              }))
            }
            onChoose={() => setActiveImageTarget({ type: 'introMedia' })}
            onRemove={() =>
              updateContent((current) => ({
                ...current,
                introMedia: { ...current.introMedia, src: '' },
              }))
            }
          />
        </div>
      </section>

      <section className={cardClass}>
        <div className={`${cardHeaderClass} flex flex-wrap items-start justify-between gap-3`}>
          <div>
            <h2 className={cardTitleClass}>Admission Process ({content.steps.length})</h2>
            <p className={cardHintClass}>Steps shown in the process section.</p>
          </div>
          <Button disabled={isBusy} size="sm" type="button" variant="outline" onClick={addStep}>
            <Plus size={15} />
            Add Step
          </Button>
        </div>
        <div className="grid gap-4 p-5">
          <Field label="Section title">
            <input
              className={inputClass}
              disabled={isBusy}
              value={content.processTitle}
              onChange={(event) =>
                updateContent((current) => ({ ...current, processTitle: event.target.value }))
              }
            />
          </Field>
          <Field label="Section intro">
            <textarea
              className={`${inputClass} min-h-20 resize-y leading-6`}
              disabled={isBusy}
              value={content.processIntro}
              onChange={(event) =>
                updateContent((current) => ({ ...current, processIntro: event.target.value }))
              }
            />
          </Field>
          <div className="grid gap-4">
            {content.steps.map((step, index) => (
              <section className="rounded-lg border border-[#E2E8F0] p-4" key={index}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-[#1C2434]">Step {index + 1}</h3>
                  <Button
                    aria-label={`Remove step ${index + 1}`}
                    disabled={isBusy || content.steps.length <= 1}
                    size="sm"
                    type="button"
                    variant="ghost"
                    onClick={() => removeStep(index)}
                  >
                    <Trash2 size={15} />
                    Remove
                  </Button>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Field label="Title">
                    <input
                      className={inputClass}
                      disabled={isBusy}
                      value={step.title}
                      onChange={(event) => updateStep(index, { title: event.target.value })}
                    />
                  </Field>
                  <Field label="Short description">
                    <input
                      className={inputClass}
                      disabled={isBusy}
                      value={step.description}
                      onChange={(event) =>
                        updateStep(index, { description: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Detail">
                    <textarea
                      className={`${inputClass} min-h-24 resize-y leading-6 lg:col-span-2`}
                      disabled={isBusy}
                      value={step.detail ?? ''}
                      onChange={(event) => updateStep(index, { detail: event.target.value })}
                    />
                  </Field>
                  <div className="lg:col-span-2">
                    <ImageField
                      alt={step.imageAlt}
                      disabled={isBusy}
                      image={step.image}
                      onAltChange={(value) => updateStep(index, { imageAlt: value })}
                      onChoose={() => setActiveImageTarget({ type: 'step', index })}
                      onRemove={() => updateStep(index, { image: '' })}
                    />
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

    </form>
  );
}
