import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';

import Tiptap from '@/admin/components/Tiptap';
import Button from '@/admin/components/ui/Button';
import Field from '@/admin/components/ui/Field';
import ImageThumb from '@/admin/features/news/components/layouts/ImageThumb';
import { inputClass } from '@/admin/features/news/components/layouts/formStyles';
import { publicAssetUrl } from '@/lib/api';
import type { AcademicLevelEditorState } from '../../hooks/useAcademicLevelEditor';
import AcademicLevelImageField from './AcademicLevelImageField';

const cardClass = 'min-w-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white';
const cardHeaderClass = 'border-b border-[#E2E8F0] px-5 py-4';
const cardTitleClass = 'text-base font-semibold text-[#1C2434]';
const cardHintClass = 'mt-1 text-sm text-[#64748B]';

type AcademicLevelMainSectionsProps = {
  editor: AcademicLevelEditorState;
};

export default function AcademicLevelMainSections({ editor }: AcademicLevelMainSectionsProps) {
  const {
    addSection,
    attachedFaqs,
    availableFaqs,
    config,
    content,
    detachFaq,
    isBusy,
    itemId,
    moveFaq,
    moveSection,
    openSection,
    removeSection,
    setActiveImageField,
    setIsFaqPickerOpen,
    setOpenSection,
    updateHero,
    updateOverview,
    updateSection,
  } = editor;

  return (
    <div className="min-w-0 space-y-5">
      <section className={cardClass}>
        <div className={cardHeaderClass}>
          <h2 className={cardTitleClass}>Basic Information</h2>
          <p className={cardHintClass}>Shown in the page hero.</p>
        </div>
        <div className="grid gap-4 p-5">
          <Field label="Title">
            <input
              className={inputClass}
              value={content.hero.title}
              onChange={(event) => updateHero({ title: event.target.value })}
            />
          </Field>
          <Field
            label="Short description"
            hint="Also used as the program card description on /academic."
          >
            <textarea
              className={`${inputClass} min-h-24 resize-y`}
              maxLength={2000}
              value={content.hero.description}
              onChange={(event) => updateHero({ description: event.target.value })}
            />
          </Field>
          <Field as="div" label="Hero image">
            <AcademicLevelImageField
              disabled={isBusy}
              field="hero"
              image={content.hero.image}
              alt={content.hero.imageAlt}
              onAltChange={(value) => updateHero({ imageAlt: value })}
              onChoose={setActiveImageField}
            />
          </Field>
        </div>
      </section>

      <section className={cardClass}>
        <div className={cardHeaderClass}>
          <h2 className={cardTitleClass}>Introduction</h2>
          <p className={cardHintClass}>The first section below the hero.</p>
        </div>
        <div className="grid gap-4 p-5">
          <Field label="Heading">
            <input
              className={inputClass}
              value={content.overview.introTitle}
              onChange={(event) => updateOverview({ introTitle: event.target.value })}
            />
          </Field>
          <Field as="div" label="Body">
            <Tiptap
              ariaLabel="Introduction body"
              value={content.overview.intro}
              onChange={(value) => updateOverview({ intro: value })}
            />
          </Field>
          <Field as="div" label="Image">
            <AcademicLevelImageField
              disabled={isBusy}
              field="intro"
              image={content.overview.introImage}
              alt={content.overview.introImageAlt}
              onAltChange={(value) => updateOverview({ introImageAlt: value })}
              onChoose={setActiveImageField}
            />
          </Field>
        </div>
      </section>

      <section className={cardClass}>
        <div className={cardHeaderClass}>
          <h2 className={cardTitleClass}>Curriculum</h2>
          <p className={cardHintClass}>Curriculum summary and optional download.</p>
        </div>
        <div className="grid gap-4 p-5">
          <Field label="Heading">
            <input
              className={inputClass}
              value={content.overview.curriculumTitle}
              onChange={(event) => updateOverview({ curriculumTitle: event.target.value })}
            />
          </Field>
          <Field as="div" label="Body">
            <Tiptap
              ariaLabel="Curriculum body"
              value={content.overview.curriculumDescription}
              onChange={(value) => updateOverview({ curriculumDescription: value })}
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Download file"
              hint="Path or URL to the PDF. Leave empty to hide the download button."
            >
              <input
                className={inputClass}
                placeholder="/documents/curriculum.pdf"
                value={content.overview.curriculumFile ?? ''}
                onChange={(event) =>
                  updateOverview({ curriculumFile: event.target.value || null })
                }
              />
            </Field>
            <Field label="Download label" hint='Shown as "Download {label}".'>
              <input
                className={inputClass}
                placeholder={`${config.title} Curriculum`}
                value={content.overview.curriculumLabel ?? ''}
                onChange={(event) =>
                  updateOverview({ curriculumLabel: event.target.value || null })
                }
              />
            </Field>
          </div>
        </div>
      </section>

      <section className={cardClass}>
        <div className={`${cardHeaderClass} flex flex-wrap items-start justify-between gap-3`}>
          <div>
            <h2 className={cardTitleClass}>Learning Highlights ({content.sections.length})</h2>
            <p className={cardHintClass}>
              Shown in this order. Image sides alternate automatically.
            </p>
          </div>
          <Button disabled={isBusy} size="sm" type="button" variant="outline" onClick={addSection}>
            <Plus size={15} />
            Add
          </Button>
        </div>

        {content.sections.length ? (
          <div className="divide-y divide-[#E2E8F0]">
            {content.sections.map((section, index) => {
              const isOpen = openSection === index;

              return (
                <div key={index}>
                  <div className="flex items-center gap-2 px-5 py-3">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenSection(isOpen ? null : index)}
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
                    >
                      {isOpen ? (
                        <ChevronDown size={16} className="shrink-0 text-[#64748B]" />
                      ) : (
                        <ChevronRight size={16} className="shrink-0 text-[#64748B]" />
                      )}
                      <ImageThumb
                        src={section.image ? publicAssetUrl(section.image) : null}
                        className="h-9 w-12"
                      />
                      <span className="truncate text-sm font-medium text-[#1C2434]">
                        {index + 1}. {section.title || 'Untitled highlight'}
                      </span>
                    </button>
                    <Button
                      aria-label="Move highlight up"
                      disabled={isBusy || index === 0}
                      size="sm"
                      type="button"
                      variant="ghost"
                      onClick={() => moveSection(index, -1)}
                    >
                      <ArrowUp size={15} />
                    </Button>
                    <Button
                      aria-label="Move highlight down"
                      disabled={isBusy || index === content.sections.length - 1}
                      size="sm"
                      type="button"
                      variant="ghost"
                      onClick={() => moveSection(index, 1)}
                    >
                      <ArrowDown size={15} />
                    </Button>
                    <Button
                      aria-label="Remove highlight"
                      disabled={isBusy}
                      size="sm"
                      type="button"
                      variant="ghost"
                      onClick={() => removeSection(index)}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>

                  {isOpen ? (
                    <div className="grid gap-4 border-t border-[#E2E8F0] bg-[#F8FAFC] p-5">
                      <Field label="Title">
                        <input
                          className={inputClass}
                          value={section.title}
                          onChange={(event) => updateSection(index, { title: event.target.value })}
                        />
                      </Field>
                      <Field as="div" label="Body">
                        <Tiptap
                          ariaLabel={`Highlight ${index + 1} body`}
                          size="compact"
                          value={section.text}
                          onChange={(value) => updateSection(index, { text: value })}
                        />
                      </Field>
                      <Field as="div" label="Image">
                        <AcademicLevelImageField
                          disabled={isBusy}
                          field={`section-${index}`}
                          image={section.image}
                          alt={section.imageAlt}
                          onAltChange={(value) => updateSection(index, { imageAlt: value })}
                          onChoose={setActiveImageField}
                        />
                      </Field>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="p-5 text-sm text-[#64748B]">No highlights yet.</p>
        )}
      </section>

      <section className={cardClass}>
        <div className={cardHeaderClass}>
          <h2 className={cardTitleClass}>Closing Statement</h2>
          <p className={cardHintClass}>A short centered paragraph after the highlights.</p>
        </div>
        <div className="p-5">
          <Tiptap
            ariaLabel="Closing statement"
            size="compact"
            value={content.overview.closingText ?? '<p></p>'}
            onChange={(value) => updateOverview({ closingText: value })}
          />
        </div>
      </section>

      <section className={cardClass}>
        <div className={`${cardHeaderClass} flex flex-wrap items-start justify-between gap-3`}>
          <div>
            <h2 className={cardTitleClass}>FAQ ({attachedFaqs.length})</h2>
            <p className={cardHintClass}>
              {itemId
                ? 'Attached from the FAQ master. Changes here save immediately.'
                : `Save ${config.title} as a draft first to attach FAQ.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              type="button"
              variant="ghost"
              onClick={() => window.open('/admin/academic/faqs', '_self')}
            >
              Manage FAQ
            </Button>
            <Button
              disabled={isBusy || !itemId || !availableFaqs.length}
              size="sm"
              type="button"
              variant="outline"
              onClick={() => setIsFaqPickerOpen(true)}
            >
              <Plus size={15} />
              Select FAQ
            </Button>
          </div>
        </div>

        {attachedFaqs.length ? (
          <div className="divide-y divide-[#E2E8F0]">
            {attachedFaqs.map((item, index) => (
              <div className="flex items-start gap-2 px-5 py-3" key={item.faqId}>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-[#1C2434]">{item.faq.question}</p>
                    {item.faq.isActive ? null : (
                      <span className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-xs font-semibold text-[#64748B]">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-[#64748B]">{item.faq.answer}</p>
                </div>
                <Button
                  aria-label="Move FAQ up"
                  disabled={isBusy || index === 0}
                  size="sm"
                  type="button"
                  variant="ghost"
                  onClick={() => moveFaq(index, -1)}
                >
                  <ArrowUp size={15} />
                </Button>
                <Button
                  aria-label="Move FAQ down"
                  disabled={isBusy || index === attachedFaqs.length - 1}
                  size="sm"
                  type="button"
                  variant="ghost"
                  onClick={() => moveFaq(index, 1)}
                >
                  <ArrowDown size={15} />
                </Button>
                <Button
                  aria-label="Detach FAQ"
                  disabled={isBusy}
                  size="sm"
                  type="button"
                  variant="ghost"
                  onClick={() => void detachFaq(item.faqId)}
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-5 text-sm text-[#64748B]">No FAQ attached.</p>
        )}
      </section>
    </div>
  );
}
