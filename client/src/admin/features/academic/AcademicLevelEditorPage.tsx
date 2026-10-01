import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, Plus, Save, Trash2, Upload } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import {
  adminApi,
  type AcademicFaqItem,
  type AcademicLevelFaqLink,
  type AcademicMasterLevel,
  type FixedAcademicLevelItem,
  type FixedAcademicLevelPayload,
  type GalleryItem,
} from '@/admin/api/adminApi';
import Tiptap from '@/admin/components/Tiptap';
import AppShell from '@/admin/components/layout/AppShell';
import Button from '@/admin/components/ui/Button';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';
import Field from '@/admin/components/ui/Field';
import Modal from '@/admin/components/ui/Modal';
import SearchInput from '@/admin/components/ui/SearchInput';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import GalleryAssetPickerModal from '@/admin/features/gallery/components/GalleryAssetPickerModal';
import GalleryPickerModal from '@/admin/features/gallery/components/GalleryPickerModal';
import GalleryThumb from '@/admin/features/gallery/components/GalleryThumb';
import { publicAssetUrl } from '@/lib/api';
import {
  academicContentFromItem,
  academicLevelConfigs,
  defaultAcademicContent,
  findMasterLevel,
  parseAcademicLevelKey,
  type AcademicLevelContent,
  type PageStatus,
} from './academicCrudModel';

type ImageField = 'cover' | 'hero' | 'intro' | 'section-0' | 'section-1';

function optionalText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? '';
  return trimmed ? trimmed : null;
}

function datetimeLocalValue(value: string | null) {
  if (!value) return '';
  return value.slice(0, 16);
}

function isoFromDatetimeLocal(value: string) {
  return value ? new Date(value).toISOString() : null;
}

export default function AcademicLevelEditorPage() {
  const location = useLocation();
  const levelKey = parseAcademicLevelKey(location.pathname);
  const config = academicLevelConfigs[levelKey];

  const [itemId, setItemId] = useState<string | null>(null);
  const [masterLevel, setMasterLevel] = useState<AcademicMasterLevel | null>(null);
  const [content, setContent] = useState<AcademicLevelContent>(() =>
    defaultAcademicContent(levelKey),
  );
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [galleryId, setGalleryId] = useState<string | null>(null);
  const [status, setStatus] = useState<PageStatus>('DRAFT');
  const [publishedAt, setPublishedAt] = useState('');
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [allFaqs, setAllFaqs] = useState<AcademicFaqItem[]>([]);
  const [attachedFaqs, setAttachedFaqs] = useState<AcademicLevelFaqLink[]>([]);
  const [activeImageField, setActiveImageField] = useState<ImageField | null>(null);
  const [isGalleryPickerOpen, setIsGalleryPickerOpen] = useState(false);
  const [isFaqPickerOpen, setIsFaqPickerOpen] = useState(false);
  const [faqSearch, setFaqSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedGallery = useMemo(
    () => galleries.find((gallery) => gallery.id === galleryId) ?? null,
    [galleries, galleryId],
  );
  const availableFaqs = useMemo(() => {
    const attachedIds = new Set(attachedFaqs.map((item) => item.faqId));
    return allFaqs.filter((faq) => faq.isActive && !attachedIds.has(faq.id));
  }, [allFaqs, attachedFaqs]);
  const filteredAvailableFaqs = useMemo(() => {
    const query = faqSearch.trim().toLowerCase();
    if (!query) return availableFaqs;
    return availableFaqs.filter((faq) =>
      [faq.question, faq.answer].join(' ').toLowerCase().includes(query),
    );
  }, [availableFaqs, faqSearch]);

  const hydrate = useCallback(
    (item: FixedAcademicLevelItem | null, levels: AcademicMasterLevel[]) => {
      const nextContent = academicContentFromItem(levelKey, item);
      const nextMaster = item?.academicLevel ?? findMasterLevel(levels, levelKey);

      setItemId(item?.id ?? null);
      setMasterLevel(nextMaster);
      setContent(nextContent);
      setDescription(item?.description ?? nextContent.hero.description);
      setCoverImage(item?.coverImage ?? nextContent.hero.image);
      setGalleryId(item?.galleryId ?? null);
      setStatus(item?.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT');
      setPublishedAt(datetimeLocalValue(item?.publishedAt ?? null));
      setAttachedFaqs([...(item?.faqs ?? [])].sort((a, b) => a.sortOrder - b.sortOrder));
    },
    [levelKey],
  );

  const loadData = useCallback(async () => {
    const [items, levels, nextGalleries, faqs] = await Promise.all([
      adminApi.fixedAcademicLevels(config.resource),
      adminApi.academicMasterLevels(),
      adminApi.galleries(),
      adminApi.academicFaqs(),
    ]);

    hydrate(items[0] ?? null, levels);
    setGalleries(nextGalleries);
    setAllFaqs(faqs);
  }, [config.resource, hydrate]);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      setIsLoading(true);
      setMessage(null);

      loadData()
        .catch((error) => {
          if (!cancelled) {
            setMessage(error instanceof Error ? error.message : `Failed to load ${config.title}.`);
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [config.title, loadData]);

  function updateContent(updater: (current: AcademicLevelContent) => AcademicLevelContent) {
    setContent((current) => updater(current));
  }

  async function ensureMasterLevel() {
    if (masterLevel) return masterLevel;

    const created = await adminApi.createAcademicMasterLevel({
      title: config.masterTitle,
      description,
    });
    setMasterLevel(created);
    return created;
  }

  function buildPayload(masterId: string, nextStatus: PageStatus): FixedAcademicLevelPayload {
    const nextPublishedAt =
      nextStatus === 'PUBLISHED'
        ? isoFromDatetimeLocal(publishedAt) ?? new Date().toISOString()
        : null;

    return {
      academicLevelId: masterId,
      title: content.hero.title,
      description: optionalText(description || content.hero.description),
      coverImage: optionalText(coverImage || content.hero.image),
      galleryId,
      hero: content.hero,
      overview: content.overview,
      sections: content.sections,
      status: nextStatus,
      publishedAt: nextPublishedAt,
    };
  }

  async function persist(nextStatus: PageStatus) {
    setIsSaving(true);
    setMessage(null);

    try {
      const level = await ensureMasterLevel();
      const payload = buildPayload(level.id, nextStatus);
      const saved = itemId
        ? await adminApi.updateFixedAcademicLevel(config.resource, itemId, payload)
        : await adminApi.createFixedAcademicLevel(config.resource, payload);

      hydrate(saved, level ? [level] : []);
      await loadData();
      setMessage(`${config.title} saved.`);
      return saved;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `Failed to save ${config.title}.`);
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteLevel() {
    if (!itemId) return;
    const confirmed = window.confirm(`Delete ${config.title} content?`);
    if (!confirmed) return;

    setIsSaving(true);
    setMessage(null);

    try {
      await adminApi.deleteFixedAcademicLevel(config.resource, itemId);
      hydrate(null, masterLevel ? [masterLevel] : []);
      setMessage(`${config.title} content deleted.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `Failed to delete ${config.title}.`);
    } finally {
      setIsSaving(false);
    }
  }

  function selectImage(path: string, gallery: string | null, alt: string) {
    if (!activeImageField) return;

    if (activeImageField === 'cover') setCoverImage(path);
    if (activeImageField === 'hero') {
      updateContent((current) => ({
        ...current,
        hero: { ...current.hero, image: path, imageAlt: alt || current.hero.imageAlt },
      }));
    }
    if (activeImageField === 'intro') {
      updateContent((current) => ({
        ...current,
        overview: {
          ...current.overview,
          introImage: path,
          introImageAlt: alt || current.overview.introImageAlt,
        },
      }));
    }
    if (activeImageField === 'section-0' || activeImageField === 'section-1') {
      const index = activeImageField === 'section-0' ? 0 : 1;
      updateContent((current) => ({
        ...current,
        sections: current.sections.map((section, sectionIndex) =>
          sectionIndex === index
            ? { ...section, image: path, imageAlt: alt || section.imageAlt }
            : section,
        ),
      }));
    }

    setGalleryId((current) => current ?? gallery);
  }

  async function attachFaq(faqId: string) {
    if (!faqId) return;
    if (!itemId) {
      setMessage(`Save ${config.title} before attaching FAQ.`);
      return;
    }
    if (attachedFaqs.some((item) => item.faqId === faqId)) {
      setMessage('FAQ is already attached.');
      return;
    }

    const selectedFaq = allFaqs.find((faq) => faq.id === faqId);
    if (!selectedFaq?.isActive) {
      setMessage('Only active FAQ records can be attached.');
      return;
    }

    setIsSaving(true);
    setMessage(null);
    try {
      await adminApi.attachAcademicFaq(config.resource, itemId, {
        faqId,
        sortOrder: attachedFaqs.length,
      });
      await loadData();
      setIsFaqPickerOpen(false);
      setFaqSearch('');
      setMessage('FAQ attached.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to attach FAQ.');
    } finally {
      setIsSaving(false);
    }
  }

  async function detachFaq(faqId: string) {
    if (!itemId) return;
    const confirmed = window.confirm('Detach this FAQ from this academic level?');
    if (!confirmed) return;

    setIsSaving(true);
    setMessage(null);
    try {
      await adminApi.detachAcademicFaq(config.resource, itemId, faqId);
      await loadData();
      setMessage('FAQ detached.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to detach FAQ.');
    } finally {
      setIsSaving(false);
    }
  }

  async function persistFaqOrder(nextItems: AcademicLevelFaqLink[]) {
    setAttachedFaqs(nextItems);
    if (!itemId) return;

    setIsSaving(true);
    setMessage(null);
    try {
      await adminApi.reorderAcademicFaqs(
        config.resource,
        itemId,
        nextItems.map((item) => item.faqId),
      );
      await loadData();
      setMessage('FAQ order saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to reorder FAQ.');
    } finally {
      setIsSaving(false);
    }
  }

  function moveFaq(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= attachedFaqs.length) return;

    const nextItems = [...attachedFaqs];
    const current = nextItems[index];
    const target = nextItems[targetIndex];
    if (!current || !target) return;

    nextItems[index] = target;
    nextItems[targetIndex] = current;
    void persistFaqOrder(
      nextItems.map((item, sortOrder) => ({
        ...item,
        sortOrder,
      })),
    );
  }

  const isBusy = isSaving || isLoading;

  return (
    <AppShell title={`Academic / ${config.title}`}>
      <div className="bg-[#F1F5F9]">
        <div className="border-b border-[#E2E8F0] bg-white px-6 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <ContentPageHeader
              breadcrumbs={[{ label: 'Academic' }, { label: config.title }]}
              title={`Academic / ${config.title}`}
              description="Edit the fixed academic level content."
            />
            <div className="flex flex-wrap gap-2">
              <span
                className={[
                  'inline-flex items-center rounded-lg px-3 py-2 text-xs font-semibold',
                  status === 'PUBLISHED'
                    ? 'bg-[#10B981]/10 text-[#047857]'
                    : 'bg-[#F59E0B]/10 text-[#D97706]',
                ].join(' ')}
              >
                {status === 'PUBLISHED' ? 'Published' : 'Draft'}
              </span>
              <Button
                disabled={isBusy}
                type="button"
                variant="outline"
                onClick={() => window.open(config.previewPath, '_blank', 'noopener,noreferrer')}
              >
                <Eye size={15} />
                Preview
              </Button>
              {itemId ? (
                <Button
                  disabled={isBusy}
                  type="button"
                  variant="danger"
                  onClick={() => void deleteLevel()}
                >
                  <Trash2 size={15} />
                  Delete
                </Button>
              ) : null}
              <Button disabled={isBusy} type="button" variant="outline" onClick={() => void persist('DRAFT')}>
                <Save size={15} />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button disabled={isBusy} type="button" onClick={() => void persist('PUBLISHED')}>
                Publish
              </Button>
            </div>
          </div>

          {message ? (
            <div className="mt-4 rounded-lg border border-[#E2E8F0] bg-white px-5 py-3">
              <StatusMessage>{message}</StatusMessage>
            </div>
          ) : null}
        </div>

        {isLoading ? (
          <div className="p-6">
            <div className="rounded-lg border border-[#E2E8F0] bg-white p-6 text-sm text-[#64748B]">
              Loading {config.title}...
            </div>
          </div>
        ) : (
          <main className="bg-white">
            <section className="w-full">
              <div className="relative h-[520px] w-full overflow-hidden md:h-[550px]">
                <img
                  src={publicAssetUrl(content.hero.image)}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/15" />
                <div className="absolute inset-x-0 bottom-0">
                  <div className="mx-auto w-full max-w-[1400px] px-6 pb-16 md:px-10 md:pb-20">
                    <div className="max-w-[980px] border-t border-white/70 pt-8">
                      <div className="grid gap-8 md:grid-cols-[250px_1fr] md:gap-10">
                        <input
                          value={content.hero.title}
                          onChange={(event) =>
                            updateContent((current) => ({
                              ...current,
                              hero: { ...current.hero, title: event.target.value },
                            }))
                          }
                          className="w-full bg-transparent text-4xl font-semibold tracking-tight text-white outline-none md:text-5xl"
                        />
                        <textarea
                          value={content.hero.description}
                          onChange={(event) => {
                            const value = event.target.value;
                            updateContent((current) => ({
                              ...current,
                              hero: { ...current.hero, description: value },
                            }));
                            setDescription(value);
                          }}
                          rows={4}
                          className="w-full resize-none bg-transparent text-base leading-7 text-white outline-none md:text-lg md:leading-8"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute right-6 top-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveImageField('hero')}
                    className="inline-flex cursor-pointer items-center gap-2 bg-white px-4 py-2.5 text-sm font-medium text-[#1C2434] shadow-sm transition-colors hover:text-[#3C50E0]"
                  >
                    <Upload size={15} />
                    Hero Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImageField('cover')}
                    className="inline-flex cursor-pointer items-center gap-2 bg-white px-4 py-2.5 text-sm font-medium text-[#1C2434] shadow-sm transition-colors hover:text-[#3C50E0]"
                  >
                    <Upload size={15} />
                    Cover Image
                  </button>
                </div>
              </div>
            </section>

            <section className="border-b border-[#E2E8F0] bg-white px-6 py-5">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Master AcademicLevel ID">
                    <input
                      readOnly
                      className="rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] px-3 py-2 text-sm"
                      value={masterLevel?.id ?? 'Created automatically on save'}
                    />
                  </Field>
                  <Field label="Published At">
                    <input
                      className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm"
                      type="datetime-local"
                      value={publishedAt}
                      onChange={(event) => setPublishedAt(event.target.value)}
                    />
                  </Field>
                </div>

                <div className="rounded-lg border border-[#E2E8F0] p-4">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-[#1C2434]">Activity Gallery</h2>
                      <p className="text-sm text-[#64748B]">Connected through galleryId.</p>
                    </div>
                    <Button
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() => setIsGalleryPickerOpen(true)}
                    >
                      Choose Gallery
                    </Button>
                  </div>
                  {selectedGallery ? (
                    <div className="flex items-center gap-3">
                      <GalleryThumb gallery={selectedGallery} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#1C2434]">
                          {selectedGallery.title}
                        </p>
                        <p className="truncate text-sm text-[#64748B]">
                          {selectedGallery.description || '-'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[#64748B]">No gallery selected.</p>
                  )}
                </div>
              </div>
            </section>

            <section className="subpage-section">
              <div className="wrap">
                <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                  <div className="subpage-body">
                    <textarea
                      value={content.overview.introTitle}
                      onChange={(event) =>
                        updateContent((current) => ({
                          ...current,
                          overview: { ...current.overview, introTitle: event.target.value },
                        }))
                      }
                      rows={2}
                      className="w-full resize-none bg-transparent text-3xl font-semibold leading-tight text-[#1C2434] outline-none md:text-4xl"
                    />
                    <div className="mt-5">
                      <Tiptap
                        value={content.overview.intro}
                        onChange={(value) =>
                          updateContent((current) => ({
                            ...current,
                            overview: { ...current.overview, intro: value },
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="overflow-hidden">
                    <img
                      src={publicAssetUrl(content.overview.introImage)}
                      alt=""
                      className="block h-full max-h-[420px] w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setActiveImageField('intro')}
                      className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#3C50E0]"
                    >
                      <Upload size={15} />
                      Change Image
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="subpage-section pt-0">
              <div className="wrap">
                <div className="subpage-body max-w-none">
                  <textarea
                    value={content.overview.curriculumTitle}
                    onChange={(event) =>
                      updateContent((current) => ({
                        ...current,
                        overview: {
                          ...current.overview,
                          curriculumTitle: event.target.value,
                        },
                      }))
                    }
                    rows={2}
                    className="w-full resize-none bg-transparent text-3xl font-semibold leading-tight text-[#1C2434] outline-none md:text-4xl"
                  />
                  <div className="mt-5">
                    <Tiptap
                      value={content.overview.curriculumDescription}
                      onChange={(value) =>
                        updateContent((current) => ({
                          ...current,
                          overview: {
                            ...current.overview,
                            curriculumDescription: value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="subpage-section pt-0">
              <div className="wrap">
                <div className="space-y-14">
                  {content.sections.slice(0, 2).map((section, index) => (
                    <article
                      className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12"
                      key={index}
                    >
                      <div className={`subpage-body ${index === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
                        <textarea
                          value={section.title}
                          onChange={(event) =>
                            updateContent((current) => ({
                              ...current,
                              sections: current.sections.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, title: event.target.value }
                                  : item,
                              ),
                            }))
                          }
                          rows={2}
                          className="w-full resize-none bg-transparent text-3xl font-semibold leading-tight text-[#1C2434] outline-none md:text-4xl"
                        />
                        <div className="mt-5">
                          <Tiptap
                            value={section.text}
                            onChange={(value) =>
                              updateContent((current) => ({
                                ...current,
                                sections: current.sections.map((item, itemIndex) =>
                                  itemIndex === index ? { ...item, text: value } : item,
                                ),
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className={`overflow-hidden ${index === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
                        <img
                          src={publicAssetUrl(section.image)}
                          alt=""
                          className="block aspect-[4/3] w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setActiveImageField(index === 0 ? 'section-0' : 'section-1')}
                          className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#3C50E0]"
                        >
                          <Upload size={15} />
                          Change Image
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="subpage-section pt-0">
              <div className="wrap">
                <div className="mx-auto max-w-4xl border-t border-[#E2E8F0] pt-8 text-center">
                  <Tiptap
                    size="compact"
                    value={content.overview.closingText ?? '<p></p>'}
                    onChange={(value) =>
                      updateContent((current) => ({
                        ...current,
                        overview: { ...current.overview, closingText: value },
                      }))
                    }
                  />
                </div>
              </div>
            </section>

            <section className="border-t border-[#E2E8F0] bg-[#F1F5F9] px-6 py-6">
              <div className="mx-auto grid max-w-5xl gap-4 rounded-lg border border-[#E2E8F0] bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-[#1C2434]">FAQ</h2>
                    <p className="text-sm text-[#64748B]">
                      Attached from reusable FAQ master data.
                    </p>
                  </div>
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

                {attachedFaqs.length ? (
                  <div className="grid gap-3">
                    {attachedFaqs.map((item, index) => (
                      <div
                        className="grid gap-3 rounded-lg border border-[#E2E8F0] p-4"
                        key={item.faqId}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-[#1C2434]">
                                {item.faq.question}
                              </p>
                              <span
                                className={[
                                  'rounded-md px-2 py-1 text-xs font-semibold',
                                  item.faq.isActive
                                    ? 'bg-[#10B981]/10 text-[#047857]'
                                    : 'bg-[#F1F5F9] text-[#64748B]',
                                ].join(' ')}
                              >
                                {item.faq.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-[#64748B]">
                              {item.faq.answer}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-wrap gap-2">
                            <Button
                              aria-label="Move FAQ up"
                              disabled={isBusy || index === 0}
                              size="sm"
                              type="button"
                              variant="outline"
                              onClick={() => moveFaq(index, -1)}
                            >
                              <ArrowUp size={15} />
                            </Button>
                            <Button
                              aria-label="Move FAQ down"
                              disabled={isBusy || index === attachedFaqs.length - 1}
                              size="sm"
                              type="button"
                              variant="outline"
                              onClick={() => moveFaq(index, 1)}
                            >
                              <ArrowDown size={15} />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            disabled={isBusy}
                            size="sm"
                            type="button"
                            variant="danger"
                            onClick={() => void detachFaq(item.faqId)}
                          >
                            Detach
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-[#E2E8F0] p-6 text-sm text-[#64748B]">
                    No FAQ attached.
                  </div>
                )}

                <div className="rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#1C2434]">FAQ master</p>
                      <p className="text-sm text-[#64748B]">
                        Create and edit reusable FAQ items from the Academic FAQ page.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() => window.open('/admin/academic/faqs', '_self')}
                    >
                      <Plus size={15} />
                      Manage FAQ
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          </main>
        )}

        <GalleryPickerModal
          galleries={galleries}
          open={isGalleryPickerOpen}
          selectedGalleryId={galleryId}
          onClose={() => setIsGalleryPickerOpen(false)}
          onSelect={setGalleryId}
        />

        <GalleryAssetPickerModal
          allowedKinds={['IMAGE']}
          galleries={galleries}
          initialGalleryId={galleryId}
          open={Boolean(activeImageField)}
          title="Choose Image"
          onClose={() => setActiveImageField(null)}
          onSelect={(asset) => selectImage(asset.path, asset.galleryId, asset.alt)}
        />

        <Modal
          open={isFaqPickerOpen}
          title={`Select FAQ for ${config.title}`}
          onClose={() => {
            if (isBusy) return;
            setIsFaqPickerOpen(false);
            setFaqSearch('');
          }}
        >
          <div className="grid gap-4">
            <SearchInput
              placeholder="Search active FAQ..."
              value={faqSearch}
              onChange={(event) => setFaqSearch(event.target.value)}
            />

            {filteredAvailableFaqs.length ? (
              <div className="max-h-[420px] divide-y divide-[#E2E8F0] overflow-y-auto rounded-lg border border-[#E2E8F0]">
                {filteredAvailableFaqs.map((faq) => (
                  <article className="grid gap-3 p-4" key={faq.id}>
                    <div>
                      <p className="text-sm font-semibold text-[#1C2434]">{faq.question}</p>
                      <p className="mt-2 text-sm leading-6 text-[#64748B]">{faq.answer}</p>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        disabled={isBusy}
                        size="sm"
                        type="button"
                        onClick={() => void attachFaq(faq.id)}
                      >
                        Attach
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[#E2E8F0] p-6 text-center text-sm text-[#64748B]">
                {availableFaqs.length
                  ? 'No active FAQ matches your search.'
                  : 'No active FAQ available to attach.'}
              </div>
            )}
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}
