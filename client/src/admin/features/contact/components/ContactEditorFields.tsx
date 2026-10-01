import { Eye, Save, Upload } from 'lucide-react';

import Tiptap from '@/admin/components/Tiptap';
import type { ContactPageContent } from '@/features/contact/contactPageData';

import {
  linesToText,
  textToLines,
} from '../utils/contactPageEditorUtils';

type ContactEditorFieldsProps = {
  content: ContactPageContent;
  isLoading: boolean;
  isSaving: boolean;
  onSave: () => Promise<void>;
  updateContent: (updater: (current: ContactPageContent) => ContactPageContent) => void;
};

type InlineTextProps = {
  ariaLabel: string;
  className?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  multiline?: boolean;
};

function InlineText({
  ariaLabel,
  className = '',
  value,
  onChange,
  required = true,
  multiline = false,
}: InlineTextProps) {
  const sharedClassName = [
    'w-full border border-transparent bg-transparent',
    'px-1.5 py-1',
    'outline-none transition-colors duration-150',
    'focus:border-[#3C50E0] focus:bg-white',
    'placeholder:text-[#64748B]',
    className,
  ].join(' ');

  if (multiline) {
    return (
      <textarea
        aria-label={ariaLabel}
        className={`${sharedClassName} min-h-28 resize-y`}
        required={required}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    );
  }

  return (
    <input
      aria-label={ariaLabel}
      className={sharedClassName}
      required={required}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  );
}

export default function ContactEditorFields({
  content,
  isLoading,
  isSaving,
  onSave,
  updateContent,
}: ContactEditorFieldsProps) {
  const updateHero = (
    updater: (hero: ContactPageContent['hero']) => ContactPageContent['hero'],
  ) => {
    updateContent((current) => ({
      ...current,
      hero: updater(current.hero),
    }));
  };

  const updateDirectContacts = (
    updater: (
      directContacts: ContactPageContent['directContacts'],
    ) => ContactPageContent['directContacts'],
  ) => {
    updateContent((current) => ({
      ...current,
      directContacts: updater(current.directContacts),
    }));
  };

  const updateAddress = (
    updater: (address: ContactPageContent['address']) => ContactPageContent['address'],
  ) => {
    updateContent((current) => ({
      ...current,
      address: updater(current.address),
    }));
  };

  const updateOfficeHours = (
    updater: (officeHours: ContactPageContent['officeHours']) => ContactPageContent['officeHours'],
  ) => {
    updateContent((current) => ({
      ...current,
      officeHours: updater(current.officeHours),
    }));
  };

  const updateMap = (updater: (map: ContactPageContent['map']) => ContactPageContent['map']) => {
    updateContent((current) => ({
      ...current,
      map: updater(current.map),
    }));
  };

  return (
    <div>
      {/* Editor toolbar */}
      <div className="sticky top-0 z-30 flex min-h-[64px] items-center justify-between border-b border-[#E2E8F0] bg-white px-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-[#1C2434]">Contact</h2>

            <span className="bg-[#10B981]/10 px-2 py-1 text-[10px] font-medium text-[#047857]">
              Published
            </span>
          </div>

          <p className="mt-0.5 text-xs text-[#64748B]">
            Edit the page content directly below.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isSaving || isLoading}
            className="inline-flex items-center gap-2 border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-medium text-[#1C2434] transition-colors hover:border-[#3C50E0] hover:text-[#3C50E0] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Eye size={15} />
            Preview Live
          </button>

          <button
            type="button"
            disabled={isSaving || isLoading}
            onClick={() => void onSave()}
            className="inline-flex items-center gap-2 border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-medium text-[#1C2434] transition-colors hover:border-[#3C50E0] hover:text-[#3C50E0] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={15} />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            type="button"
            disabled={isSaving || isLoading}
            onClick={() => void onSave()}
            className="border border-[#3C50E0] bg-[#3C50E0] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Publish
          </button>
        </div>
      </div>

      <main className="overflow-hidden bg-white">
        {/* Hero */}
        <section className="pt-0">
          <div className="wrap">
            <div className="grid items-center gap-8 md:gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              {/* Hero image */}
              <div className="overflow-hidden">
                <div className="group relative">
                  <img
                    src={content.hero.image}
                    alt={content.hero.imageAlt || 'Contact page image'}
                    className="block h-[280px] w-full object-cover sm:h-[360px] lg:h-[460px]"
                  />

                  <label className="absolute bottom-4 left-4 inline-flex cursor-pointer items-center gap-2 bg-white px-4 py-2.5 text-sm font-medium text-[#1C2434] shadow-sm transition-colors hover:text-[#3C50E0]">
                    <Upload size={15} />
                    Change Image
                    <input
                      type="text"
                      className="sr-only"
                      aria-label="Contact hero image path"
                      value={content.hero.image}
                      onChange={(event) =>
                        updateHero((hero) => ({
                          ...hero,
                          image: event.currentTarget.value,
                        }))
                      }
                    />
                  </label>
                </div>
              </div>

              {/* Hero text */}
              <div className="max-w-2xl">
                <InlineText
                  ariaLabel="Contact page title"
                  value={content.hero.title}
                  className="text-3xl font-[var(--f-head)] font-semibold leading-tight tracking-tight text-[#1C2434] sm:text-4xl md:text-5xl"
                  onChange={(value) =>
                    updateHero((hero) => ({
                      ...hero,
                      title: value,
                    }))
                  }
                />

                <div className="mt-6">
                  <Tiptap
                    value={content.intro}
                    onChange={(value) =>
                      updateContent((current) => ({
                        ...current,
                        intro: value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact information */}
        <section className="pb-14 md:pb-20">
          <div className="wrap">
            <div className="border-t border-[#E2E8F0]">
              <div className="border-b border-[#E2E8F0] py-6">
                <InlineText
                  ariaLabel="Contact information title"
                  value={content.directContacts.title}
                  className="text-2xl font-[var(--f-head)] font-semibold tracking-tight text-[#1C2434] sm:text-3xl"
                  onChange={(value) =>
                    updateDirectContacts((directContacts) => ({
                      ...directContacts,
                      title: value,
                    }))
                  }
                />
              </div>

              <div className="grid divide-y divide-[#E2E8F0] md:grid-cols-2 md:divide-x md:divide-y-0">
                {/* Direct contacts */}
                <div className="py-7 md:py-9 md:pr-10">
                  <InlineText
                    ariaLabel="Contact heading"
                    value={content.directContacts.heading}
                    className="text-xl font-[var(--f-head)] font-semibold text-[#1C2434]"
                    onChange={(value) =>
                      updateDirectContacts((directContacts) => ({
                        ...directContacts,
                        heading: value,
                      }))
                    }
                  />

                  <div className="mt-5 space-y-4 text-sm leading-7">
                    <div>
                      <span className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-[#64748B]">
                        Phone
                      </span>

                      <InlineText
                        ariaLabel="Phone"
                        value={content.directContacts.phone}
                        className="text-[#1C2434]"
                        onChange={(value) =>
                          updateDirectContacts((directContacts) => ({
                            ...directContacts,
                            phone: value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <span className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-[#64748B]">
                        WhatsApp
                      </span>

                      <InlineText
                        ariaLabel="WhatsApp"
                        value={content.directContacts.whatsapp}
                        className="text-[#1C2434]"
                        onChange={(value) =>
                          updateDirectContacts((directContacts) => ({
                            ...directContacts,
                            whatsapp: value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <span className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-[#64748B]">
                        Email
                      </span>

                      <InlineText
                        ariaLabel="Email"
                        value={content.directContacts.email}
                        className="break-words text-[#1C2434]"
                        onChange={(value) =>
                          updateDirectContacts((directContacts) => ({
                            ...directContacts,
                            email: value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="py-7 md:py-9 md:pl-10">
                  <InlineText
                    ariaLabel="Address title"
                    value={content.address.title}
                    className="text-xl font-[var(--f-head)] font-semibold text-[#1C2434]"
                    onChange={(value) =>
                      updateAddress((address) => ({
                        ...address,
                        title: value,
                      }))
                    }
                  />

                  <div className="mt-5 grid gap-3 text-sm leading-7">
                    <InlineText
                      ariaLabel="School name"
                      value={content.address.name}
                      className="font-semibold text-[#1C2434]"
                      onChange={(value) =>
                        updateAddress((address) => ({
                          ...address,
                          name: value,
                        }))
                      }
                    />

                    <InlineText
                      ariaLabel="Address lines"
                      multiline
                      value={linesToText(content.address.lines)}
                      className="min-h-28 text-[#64748B]"
                      onChange={(value) =>
                        updateAddress((address) => ({
                          ...address,
                          lines: textToLines(value),
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Office hours */}
        <section className="border-y border-[#E2E8F0] bg-[#faf8f5] py-14 sm:py-16 md:py-20">
          <div className="wrap">
            <div className="grid gap-8 md:grid-cols-[0.7fr_1.3fr] md:gap-12 lg:gap-20">
              <div>
                <InlineText
                  ariaLabel="Opening hours title"
                  value={content.officeHours.title}
                  className="text-2xl font-[var(--f-head)] font-semibold tracking-tight text-[#1C2434] sm:text-3xl"
                  onChange={(value) =>
                    updateOfficeHours((officeHours) => ({
                      ...officeHours,
                      title: value,
                    }))
                  }
                />
              </div>

              <div className="border-t border-[#E2E8F0]">
                {content.officeHours.items.map((item, index) => (
                  <div
                    key={`${item.title}-${index}`}
                    className="grid gap-2 border-b border-[#E2E8F0] py-5 sm:grid-cols-[180px_1fr] sm:gap-8"
                  >
                    <InlineText
                      ariaLabel={`Opening hours label ${index + 1}`}
                      value={item.title}
                      className="font-semibold text-[#1C2434]"
                      onChange={(value) =>
                        updateOfficeHours((officeHours) => ({
                          ...officeHours,
                          items: officeHours.items.map((currentItem, itemIndex) =>
                            itemIndex === index ? { ...currentItem, title: value } : currentItem,
                          ),
                        }))
                      }
                    />

                    <InlineText
                      ariaLabel={`Opening hours text ${index + 1}`}
                      value={item.text}
                      className="text-sm leading-6 text-[#64748B]"
                      onChange={(value) =>
                        updateOfficeHours((officeHours) => ({
                          ...officeHours,
                          items: officeHours.items.map((currentItem, itemIndex) =>
                            itemIndex === index ? { ...currentItem, text: value } : currentItem,
                          ),
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Maps */}
        <section className="subpage-section">
          <div className="wrap">
            <div className="mb-6 grid gap-3">
              <InlineText
                ariaLabel="Map title"
                value={content.map.title}
                className="text-2xl font-[var(--f-head)] font-semibold tracking-tight text-[#1C2434] sm:text-3xl"
                onChange={(value) =>
                  updateMap((map) => ({
                    ...map,
                    title: value,
                  }))
                }
              />

              <InlineText
                ariaLabel="Map title attribute"
                value={content.map.titleAttr}
                className="text-xs text-[#64748B]"
                onChange={(value) =>
                  updateMap((map) => ({
                    ...map,
                    titleAttr: value,
                  }))
                }
              />
            </div>

            <div className="contact-map-wrapper w-full overflow-hidden border border-[#E2E8F0]">
              <iframe
                src={content.map.src}
                className="block h-[320px] w-full border-0 sm:h-[400px] md:h-[500px]"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={content.map.titleAttr}
              />
            </div>

            <InlineText
              ariaLabel="Map source URL"
              multiline
              value={content.map.src}
              className="mt-3 min-h-24 text-xs leading-5 text-[#64748B]"
              onChange={(value) =>
                updateMap((map) => ({
                  ...map,
                  src: value,
                }))
              }
            />
          </div>
        </section>
      </main>
    </div>
  );
}
