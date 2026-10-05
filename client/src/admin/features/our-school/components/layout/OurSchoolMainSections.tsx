import { Plus, Trash2 } from 'lucide-react';

import Tiptap from '@/admin/components/Tiptap';
import Button from '@/admin/components/ui/Button';
import Field from '@/admin/components/ui/Field';
import ImageThumb from '@/admin/features/news/components/layouts/ImageThumb';
import { inputClass } from '@/admin/features/news/components/layouts/formStyles';
import { publicAssetUrl } from '@/lib/api';
import type { OurSchoolEditorState } from '../../hooks/useOurSchoolEditor';
import type { OurSchoolImageField } from '../../lib/ourSchoolEditor';

const cardClass = 'min-w-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white';
const cardHeaderClass = 'border-b border-[#E2E8F0] px-5 py-4';
const cardTitleClass = 'text-base font-semibold text-[#1C2434]';
const cardHintClass = 'mt-1 text-sm text-[#64748B]';

type OurSchoolMainSectionsProps = {
  editor: OurSchoolEditorState;
};

function ImageField({
  alt,
  disabled,
  field,
  image,
  onAltChange,
  onChoose,
}: {
  alt: string;
  disabled: boolean;
  field: OurSchoolImageField;
  image: string;
  onAltChange: (value: string) => void;
  onChoose: (field: OurSchoolImageField) => void;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-3">
        <ImageThumb
          src={image ? publicAssetUrl(image) : null}
          alt={alt}
          className="h-16 w-20"
        />
        <Button
          disabled={disabled}
          size="sm"
          type="button"
          variant="outline"
          onClick={() => onChoose(field)}
        >
          {image ? 'Change image' : 'Choose image'}
        </Button>
      </div>
      <input
        className={inputClass}
        disabled={disabled}
        placeholder="Alt text"
        value={alt}
        onChange={(event) => onAltChange(event.target.value)}
      />
    </div>
  );
}

export default function OurSchoolMainSections({ editor }: OurSchoolMainSectionsProps) {
  const {
    addFaq,
    content,
    isBusy,
    openFaqIndex,
    removeFaq,
    setActiveImageField,
    setOpenFaqIndex,
    updateContent,
    updateParagraph,
  } = editor;

  return (
    <div className="min-w-0 space-y-5">
      <section className={cardClass}>
        <div className={cardHeaderClass}>
          <h2 className={cardTitleClass}>Hero</h2>
          <p className={cardHintClass}>Primary heading and image for the Our School page.</p>
        </div>
        <div className="grid gap-4 p-5">
          <Field label="Title">
            <input
              className={inputClass}
              disabled={isBusy}
              value={content.hero.title}
              onChange={(event) =>
                updateContent((current) => ({
                  ...current,
                  hero: { ...current.hero, title: event.target.value },
                }))
              }
            />
          </Field>
          <Field as="div" label="Image">
            <ImageField
              disabled={isBusy}
              field="hero"
              image={content.hero.image}
              alt={content.hero.imageAlt}
              onAltChange={(value) =>
                updateContent((current) => ({
                  ...current,
                  hero: { ...current.hero, imageAlt: value },
                }))
              }
              onChoose={setActiveImageField}
            />
          </Field>
        </div>
      </section>

      <section className={cardClass}>
        <div className={cardHeaderClass}>
          <h2 className={cardTitleClass}>Background</h2>
          <p className={cardHintClass}>School background copy and supporting image.</p>
        </div>
        <div className="grid gap-4 p-5">
          <Field label="Title">
            <input
              className={inputClass}
              disabled={isBusy}
              value={content.background.title}
              onChange={(event) =>
                updateContent((current) => ({
                  ...current,
                  background: { ...current.background, title: event.target.value },
                }))
              }
            />
          </Field>
          {content.background.paragraphs.map((paragraph, index) => (
            <Field as="div" key={`background-${index}`} label={`Paragraph ${index + 1}`}>
              <Tiptap
                value={paragraph}
                onChange={(value) => updateParagraph('background', index, value)}
              />
            </Field>
          ))}
          <Field as="div" label="Image">
            <ImageField
              disabled={isBusy}
              field="background"
              image={content.background.image}
              alt={content.background.imageAlt}
              onAltChange={(value) =>
                updateContent((current) => ({
                  ...current,
                  background: { ...current.background, imageAlt: value },
                }))
              }
              onChoose={setActiveImageField}
            />
          </Field>
        </div>
      </section>

      <section className={cardClass}>
        <div className={cardHeaderClass}>
          <h2 className={cardTitleClass}>Vision & Mission</h2>
          <p className={cardHintClass}>Vision and mission content shown mid-page.</p>
        </div>
        <div className="grid gap-4 p-5">
          <Field label="Title">
            <input
              className={inputClass}
              disabled={isBusy}
              value={content.visionMission.title}
              onChange={(event) =>
                updateContent((current) => ({
                  ...current,
                  visionMission: { ...current.visionMission, title: event.target.value },
                }))
              }
            />
          </Field>
          {content.visionMission.paragraphs.map((paragraph, index) => (
            <Field as="div" key={`vision-${index}`} label={`Paragraph ${index + 1}`}>
              <Tiptap
                value={paragraph}
                onChange={(value) => updateParagraph('visionMission', index, value)}
              />
            </Field>
          ))}
          <Field as="div" label="Image">
            <ImageField
              disabled={isBusy}
              field="visionMission"
              image={content.visionMission.image}
              alt={content.visionMission.imageAlt}
              onAltChange={(value) =>
                updateContent((current) => ({
                  ...current,
                  visionMission: { ...current.visionMission, imageAlt: value },
                }))
              }
              onChoose={setActiveImageField}
            />
          </Field>
        </div>
      </section>

      <section className={cardClass}>
        <div className={cardHeaderClass}>
          <h2 className={cardTitleClass}>Philosophy</h2>
          <p className={cardHintClass}>Philosophy heading and paragraphs.</p>
        </div>
        <div className="grid gap-4 p-5">
          <Field label="Title">
            <input
              className={inputClass}
              disabled={isBusy}
              value={content.philosophy.title}
              onChange={(event) =>
                updateContent((current) => ({
                  ...current,
                  philosophy: { ...current.philosophy, title: event.target.value },
                }))
              }
            />
          </Field>
          {content.philosophy.paragraphs.map((paragraph, index) => (
            <Field as="div" key={`philosophy-${index}`} label={`Paragraph ${index + 1}`}>
              <Tiptap
                value={paragraph}
                onChange={(value) => updateParagraph('philosophy', index, value)}
              />
            </Field>
          ))}
        </div>
      </section>

      <section className={cardClass}>
        <div className={`${cardHeaderClass} flex flex-wrap items-start justify-between gap-3`}>
          <div>
            <h2 className={cardTitleClass}>FAQ ({content.faq.length})</h2>
            <p className={cardHintClass}>Questions shown at the bottom of the public page.</p>
          </div>
          <Button disabled={isBusy} size="sm" type="button" variant="outline" onClick={addFaq}>
            <Plus size={15} />
            Add FAQ
          </Button>
        </div>

        <div className="divide-y divide-[#E2E8F0]">
          {content.faq.map((item, index) => {
            const isOpen = openFaqIndex === index;

            return (
              <div key={`${item.question}-${index}`}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                >
                  <span className="truncate text-sm font-medium text-[#1C2434]">
                    {index + 1}. {item.question || 'Untitled question'}
                  </span>
                  <span className="text-lg text-[#3C50E0]">{isOpen ? '-' : '+'}</span>
                </button>

                {isOpen ? (
                  <div className="grid gap-4 border-t border-[#E2E8F0] bg-[#F8FAFC] p-5">
                    <Field label="Question">
                      <input
                        className={inputClass}
                        disabled={isBusy}
                        value={item.question}
                        onChange={(event) =>
                          updateContent((current) => ({
                            ...current,
                            faq: current.faq.map((faqItem, faqIndex) =>
                              faqIndex === index
                                ? { ...faqItem, question: event.target.value }
                                : faqItem,
                            ),
                          }))
                        }
                      />
                    </Field>
                    <Field as="div" label="Answer">
                      <Tiptap
                        value={item.answer}
                        onChange={(value) =>
                          updateContent((current) => ({
                            ...current,
                            faq: current.faq.map((faqItem, faqIndex) =>
                              faqIndex === index ? { ...faqItem, answer: value } : faqItem,
                            ),
                          }))
                        }
                      />
                    </Field>
                    <div>
                      <Button
                        disabled={isBusy || content.faq.length <= 1}
                        size="sm"
                        type="button"
                        variant="danger"
                        onClick={() => removeFaq(index)}
                      >
                        <Trash2 size={15} />
                        Remove FAQ
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
