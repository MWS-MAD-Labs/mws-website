import { useEffect, useState } from 'react';
import { Eye, Plus, Save, Trash2, Upload } from 'lucide-react';

import type { OurSchoolPageData } from '@/api/pageApi';
import { adminApi, type GalleryItem, type OurSchoolItem } from '@/admin/api/adminApi';
import Tiptap from '@/admin/components/Tiptap';
import AppShell from '@/admin/components/layout/AppShell';
import GalleryPickerModal from '@/admin/features/gallery/components/GalleryPickerModal';
import { asset } from '@/data/site';

const defaultContent: OurSchoolPageData = {
  hero: {
    title: 'Our School',
    image: asset('DSC04079.jpg'),
    imageAlt: 'Millennia World School Campus',
  },

  background: {
    title: 'MWS Background',
    image: asset('DSC04079.jpg'),
    imageAlt: 'Millennia World School campus',
    paragraphs: [
      'In the 21st century, every educational system faces the challenge of preparing young generations for a life of the future that is not only complex, but constantly changing as well.',
      'We aim to develop and inspire lifelong learners and enable them to fully develop their talents, dispositions and capabilities.',
    ],
  },

  visionMission: {
    title: 'Our Vision & Mission',
    image: asset('DSC04079.jpg'),
    imageAlt: 'Students learning at Millennia World School',
    paragraphs: [
      'Discover and foster individual and group potential to achieve fulfilling lives.',
      'A globalized society based on compassion where every individual connects to others using their maximum potential.',
    ],
  },

  philosophy: {
    title: 'Our Philosophy',
    paragraphs: [
      'Our Philosophy is based on profound understanding of human development that addresses the needs of growing children and aims at developing their love of learning.',
      'Through meaningful learning experiences children develop intellectual, emotional, and physical capabilities.',
    ],
  },

  faq: [
    {
      question: 'What learning programs does MWS offer?',
      answer:
        'Millennia World School offers learning programs designed to support students across different stages of their educational journey.',
    },
    {
      question: 'How does MWS approach student learning?',
      answer:
        'Our approach focuses on developing students academically while supporting personal, social, and practical development.',
    },
  ],
};

type PageStatus = 'DRAFT' | 'PUBLISHED';

type EditableContent = OurSchoolPageData & {
  status?: PageStatus;
};

function normalizeContent(item: OurSchoolItem | null): EditableContent {
  const content = item?.content ?? null;

  const source = content && typeof content === 'object' ? (content as EditableContent) : null;

  return {
    ...defaultContent,
    ...(source ?? {}),

    hero: {
      ...defaultContent.hero,
      ...(source?.hero ?? {}),
      title: source?.hero?.title || item?.title || defaultContent.hero.title,
    },

    background: {
      ...defaultContent.background,
      ...(source?.background ?? {}),
      paragraphs: source?.background?.paragraphs?.length
        ? source.background.paragraphs
        : defaultContent.background.paragraphs,
    },

    visionMission: {
      ...defaultContent.visionMission,
      ...(source?.visionMission ?? {}),
      paragraphs: source?.visionMission?.paragraphs?.length
        ? source.visionMission.paragraphs
        : defaultContent.visionMission.paragraphs,
    },

    philosophy: {
      ...defaultContent.philosophy,
      ...(source?.philosophy ?? {}),
      paragraphs: source?.philosophy?.paragraphs?.length
        ? source.philosophy.paragraphs
        : defaultContent.philosophy.paragraphs,
    },

    faq: source?.faq?.length ? source.faq : defaultContent.faq,

    status: source?.status ?? 'PUBLISHED',
  };
}

type InlineInputProps = {
  ariaLabel: string;
  className?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

function InlineInput({
  ariaLabel,
  className = '',
  value,
  onChange,
  required = true,
}: InlineInputProps) {
  return (
    <input
      aria-label={ariaLabel}
      required={required}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      className={[
        'w-full border border-transparent bg-transparent',
        'px-1.5 py-1',
        'outline-none transition-colors duration-150',
        'focus:border-[var(--burgundy)] focus:bg-white',
        'placeholder:text-[var(--charcoal-muted)]',
        className,
      ].join(' ')}
    />
  );
}

export default function OurSchoolPage() {
  const [pageId, setPageId] = useState<string | null>(null);

  const [content, setContent] = useState<EditableContent>(defaultContent);

  const [status, setStatus] = useState<PageStatus>('DRAFT');

  const [galleries, setGalleries] = useState<GalleryItem[]>([]);

  const [galleryId, setGalleryId] = useState<string | null>(null);

  const [featuredImageId, setFeaturedImageId] = useState<string | null>(null);

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const [isLoading, setIsLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  function updateContent(updater: (current: EditableContent) => EditableContent) {
    setContent((current) => updater(current));
  }

  async function loadData() {
    const [items, nextGalleries] = await Promise.all([adminApi.ourSchools(), adminApi.galleries()]);

    const item = items[0] ?? null;

    const nextContent = normalizeContent(item);

    setPageId(item?.id ?? null);
    setContent(nextContent);
    setStatus(nextContent.status ?? 'PUBLISHED');

    setGalleryId(item?.galleryId ?? null);
    setFeaturedImageId(item?.featuredImageId ?? null);

    setGalleries(nextGalleries);
  }

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      loadData()
        .catch((error) => {
          if (cancelled) return;

          console.error('Failed to load Our School page:', error);
        })
        .finally(() => {
          if (!cancelled) {
            setIsLoading(false);
          }
        });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function persist(nextStatus: PageStatus) {
    setIsSaving(true);

    const nextContent: EditableContent = {
      ...content,
      status: nextStatus,
    };

    const payload = {
      title: nextContent.hero.title,

      description: nextContent.background.paragraphs[0] ?? null,

      content: nextContent,

      galleryId,
      featuredImageId,
    };

    try {
      const saved = pageId
        ? await adminApi.updateOurSchool(pageId, payload)
        : await adminApi.createOurSchool(payload);

      const savedContent = normalizeContent(saved);

      setPageId(saved.id);
      setContent(savedContent);
      setStatus(nextStatus);

      setGalleryId(saved.galleryId);
      setFeaturedImageId(saved.featuredImageId);
    } catch (error) {
      console.error('Failed to save Our School page:', error);
    } finally {
      setIsSaving(false);
    }
  }

  function previewLive() {
    window.open('/our-school', '_blank', 'noopener,noreferrer');
  }

  function selectGallery(nextGalleryId: string | null) {
    if (!nextGalleryId) {
      setGalleryId(null);
      setFeaturedImageId(null);
      return;
    }

    const nextGallery = galleries.find((gallery) => gallery.id === nextGalleryId);

    setGalleryId(nextGalleryId);

    setFeaturedImageId((current) =>
      nextGallery?.images.some((image) => image.id === current)
        ? current
        : (nextGallery?.images[0]?.id ?? null),
    );
  }

  function updateParagraph(
    section: 'background' | 'visionMission' | 'philosophy',
    index: number,
    value: string,
  ) {
    updateContent((current) => ({
      ...current,

      [section]: {
        ...current[section],

        paragraphs: current[section].paragraphs.map((paragraph, paragraphIndex) =>
          paragraphIndex === index ? value : paragraph,
        ),
      },
    }));
  }

  return (
    <AppShell title="Our School">
      <div className="min-h-full bg-white">
        {/* Editor toolbar */}
        <div className="sticky top-0 z-30 flex min-h-[64px] items-center justify-between border-b border-black/10 bg-white px-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-[var(--charcoal)]">Our School</h2>

              <span className="bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700">
                {status === 'PUBLISHED' ? 'Published' : 'Draft'}
              </span>
            </div>

            <p className="mt-0.5 text-xs text-[var(--charcoal-muted)]">
              Edit the page content directly below.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSaving || isLoading}
              onClick={previewLive}
              className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[var(--charcoal)] transition-colors hover:border-[var(--burgundy)] hover:text-[var(--burgundy)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Eye size={15} />
              Preview Live
            </button>

            <button
              type="button"
              disabled={isSaving || isLoading}
              onClick={() => void persist('DRAFT')}
              className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[var(--charcoal)] transition-colors hover:border-[var(--burgundy)] hover:text-[var(--burgundy)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={15} />

              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>

            <button
              type="button"
              disabled={isSaving || isLoading}
              onClick={() => void persist('PUBLISHED')}
              className="border border-[var(--burgundy)] bg-[var(--burgundy)] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Publish
            </button>
          </div>
        </div>

        <main className="overflow-hidden bg-white">
          {/* Hero */}
          <section className="relative h-[320px] overflow-hidden md:h-[380px]">
            <img
              src={content.hero.image}
              alt={content.hero.imageAlt}
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/45" />

            <div className="relative z-10 flex h-full items-end">
              <div className="mx-auto w-full max-w-7xl px-6 pb-12 md:px-8 md:pb-16">
                <InlineInput
                  ariaLabel="Our School hero title"
                  value={content.hero.title}
                  className="max-w-3xl text-4xl font-[var(--f-head)] font-medium leading-tight text-white md:text-5xl lg:text-6xl"
                  onChange={(value) =>
                    updateContent((current) => ({
                      ...current,
                      hero: {
                        ...current.hero,
                        title: value,
                      },
                    }))
                  }
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="absolute bottom-4 left-4 z-20 inline-flex items-center gap-2 bg-white px-4 py-2.5 text-sm font-medium text-[var(--charcoal)] shadow-sm transition-colors hover:text-[var(--burgundy)]"
            >
              <Upload size={15} />
              Change Image
            </button>
          </section>

          {/* Background */}
          <section className="w-full bg-white md:py-[12px]">
            <div className="mx-auto grid w-full max-w-[1240px] items-stretch gap-12 px-6 md:gap-20 md:px-10 lg:grid-cols-2">
              <div className="max-w-[600px]">
                <InlineInput
                  ariaLabel="MWS background title"
                  value={content.background.title}
                  className="mb-7 text-[clamp(32px,4vw,48px)] font-semibold leading-[1.1] tracking-[-0.025em] text-[var(--charcoal)]"
                  onChange={(value) =>
                    updateContent((current) => ({
                      ...current,
                      background: {
                        ...current.background,
                        title: value,
                      },
                    }))
                  }
                />

                <div className="space-y-5">
                  {content.background.paragraphs.map((paragraph, index) => (
                    <Tiptap
                      key={`background-${index}`}
                      value={paragraph}
                      onChange={(value) => updateParagraph('background', index, value)}
                    />
                  ))}
                </div>
              </div>

              <div className="relative h-full min-h-[520px] overflow-hidden max-[1024px]:min-h-[420px] max-[680px]:min-h-0">
                <img
                  src={content.background.image}
                  alt={content.background.imageAlt}
                  className="block h-full min-h-[520px] w-full object-cover max-[1024px]:min-h-[420px] max-[680px]:min-h-[300px]"
                />

                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="absolute bottom-4 left-4 inline-flex items-center gap-2 bg-white px-4 py-2.5 text-sm font-medium text-[var(--charcoal)] shadow-sm transition-colors hover:text-[var(--burgundy)]"
                >
                  <Upload size={15} />
                  Change Image
                </button>
              </div>
            </div>
          </section>

          {/* Vision & Mission */}
          <section className="w-full bg-[var(--warm-white)] py-[96px] md:py-[120px]">
            <div className="mx-auto grid w-full max-w-[1240px] items-center gap-12 px-6 md:gap-20 md:px-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="relative overflow-hidden">
                <img
                  src={content.visionMission.image}
                  alt={content.visionMission.imageAlt}
                  className="block aspect-[4/3] w-full object-cover md:aspect-[5/4]"
                />

                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="absolute bottom-4 left-4 inline-flex items-center gap-2 bg-white px-4 py-2.5 text-sm font-medium text-[var(--charcoal)] shadow-sm transition-colors hover:text-[var(--burgundy)]"
                >
                  <Upload size={15} />
                  Change Image
                </button>
              </div>

              <div className="max-w-[560px]">
                <InlineInput
                  ariaLabel="Our Vision and Mission title"
                  value={content.visionMission.title}
                  className="mb-7 text-[clamp(32px,4vw,48px)] font-semibold leading-[1.1] tracking-[-0.025em] text-[var(--charcoal)]"
                  onChange={(value) =>
                    updateContent((current) => ({
                      ...current,
                      visionMission: {
                        ...current.visionMission,
                        title: value,
                      },
                    }))
                  }
                />

                <div className="space-y-5">
                  {content.visionMission.paragraphs.map((paragraph, index) => (
                    <Tiptap
                      key={`vision-${index}`}
                      value={paragraph}
                      onChange={(value) => updateParagraph('visionMission', index, value)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Philosophy */}
          <section className="w-full bg-white py-[96px] md:py-[120px]">
            <div className="mx-auto w-full max-w-[1060px] px-6 md:px-10">
              <InlineInput
                ariaLabel="Our Philosophy title"
                value={content.philosophy.title}
                className="mb-8 text-[clamp(32px,4vw,48px)] font-semibold leading-[1.1] tracking-[-0.025em] text-[var(--charcoal)]"
                onChange={(value) =>
                  updateContent((current) => ({
                    ...current,
                    philosophy: {
                      ...current.philosophy,
                      title: value,
                    },
                  }))
                }
              />

              <div className="max-w-[900px] space-y-5">
                {content.philosophy.paragraphs.map((paragraph, index) => (
                  <Tiptap
                    key={`philosophy-${index}`}
                    value={paragraph}
                    onChange={(value) => updateParagraph('philosophy', index, value)}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="w-full bg-[var(--warm-white)] py-[96px] md:py-[120px]">
            <div className="mx-auto w-full max-w-[1000px] px-6 md:px-10">
              <h2 className="mb-12 text-[clamp(32px,4vw,48px)] font-semibold leading-[1.1] tracking-[-0.025em] text-[var(--charcoal)]">
                Frequently Asked Questions
              </h2>

              <div className="border-t border-[var(--border)]">
                {content.faq.map((item, index) => {
                  const isOpen = openFaqIndex === index;

                  return (
                    <div
                      key={`${item.question}-${index}`}
                      className="border-b border-[var(--border)]"
                    >
                      <div className="flex w-full items-center justify-between gap-8 py-6 text-left">
                        <InlineInput
                          ariaLabel={`FAQ question ${index + 1}`}
                          value={item.question}
                          className="text-base font-semibold text-[var(--charcoal)] md:text-lg"
                          onChange={(value) =>
                            updateContent((current) => ({
                              ...current,
                              faq: current.faq.map((faqItem, faqIndex) =>
                                faqIndex === index
                                  ? {
                                      ...faqItem,
                                      question: value,
                                    }
                                  : faqItem,
                              ),
                            }))
                          }
                        />

                        <button
                          type="button"
                          className={`shrink-0 text-2xl font-light text-[var(--burgundy)] transition-transform duration-300 ${
                            isOpen ? 'rotate-45' : ''
                          }`}
                          aria-expanded={isOpen}
                          aria-label={isOpen ? 'Collapse FAQ answer' : 'Expand FAQ answer'}
                          onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        >
                          +
                        </button>
                      </div>

                      <div
                        className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <Tiptap
                            value={item.answer}
                            onChange={(value) =>
                              updateContent((current) => ({
                                ...current,
                                faq: current.faq.map((faqItem, faqIndex) =>
                                  faqIndex === index
                                    ? {
                                        ...faqItem,
                                        answer: value,
                                      }
                                    : faqItem,
                                ),
                              }))
                            }
                          />

                          <button
                            type="button"
                            className="mb-5 mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[var(--burgundy)]"
                            onClick={() =>
                              updateContent((current) => ({
                                ...current,
                                faq:
                                  current.faq.length > 1
                                    ? current.faq.filter((_, faqIndex) => faqIndex !== index)
                                    : current.faq,
                              }))
                            }
                          >
                            <Trash2 size={14} />
                            Remove FAQ
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--burgundy)]"
                onClick={() =>
                  updateContent((current) => ({
                    ...current,
                    faq: [
                      ...current.faq,
                      {
                        question: 'New question',
                        answer: 'New answer',
                      },
                    ],
                  }))
                }
              >
                <Plus size={16} />
                Add FAQ
              </button>
            </div>
          </section>
        </main>
      </div>

      <GalleryPickerModal
        galleries={galleries}
        isLoading={isLoading}
        open={isPickerOpen}
        selectedGalleryId={galleryId}
        onClose={() => setIsPickerOpen(false)}
        onSelect={selectGallery}
      />
    </AppShell>
  );
}
