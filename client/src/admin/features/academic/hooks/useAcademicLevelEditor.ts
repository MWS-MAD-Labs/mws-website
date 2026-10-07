import { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
  academicContentFromItem,
  academicLevelConfigs,
  defaultAcademicContent,
  findMasterLevel,
  parseAcademicLevelKey,
  type AcademicLevelContent,
  type AcademicSection,
  type PageStatus,
} from '../academicCrudModel';
import {
  datetimeLocalValue,
  isoFromDatetimeLocal,
  optionalText,
  withAlternatingImages,
  type ImageField,
} from '../lib/academicLevelEditor';
import { useToastState } from '@/admin/components/ui/toastContext';
import { uploadImageForPicker } from '@/admin/features/gallery/utils/uploadImageForPicker';

export function useAcademicLevelEditor() {
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
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [allFaqs, setAllFaqs] = useState<AcademicFaqItem[]>([]);
  const [attachedFaqs, setAttachedFaqs] = useState<AcademicLevelFaqLink[]>([]);
  const [activeImageField, setActiveImageField] = useState<ImageField | null>(null);
  const [openSection, setOpenSection] = useState<number | null>(0);
  const [isFaqPickerOpen, setIsFaqPickerOpen] = useState(false);
  const [faqSearch, setFaqSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [message, setMessage] = useToastState<string | null>(null);

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
      setUpdatedAt(item?.updatedAt ?? null);
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
  }, [config.title, loadData, setMessage]);

  function updateContent(updater: (current: AcademicLevelContent) => AcademicLevelContent) {
    setContent((current) => updater(current));
  }

  function updateHero(patch: Partial<AcademicLevelContent['hero']>) {
    if (patch.description !== undefined) {
      setDescription(patch.description);
    }

    updateContent((current) => ({ ...current, hero: { ...current.hero, ...patch } }));
  }

  function updateOverview(patch: Partial<AcademicLevelContent['overview']>) {
    updateContent((current) => ({ ...current, overview: { ...current.overview, ...patch } }));
  }

  function updateSection(index: number, patch: Partial<AcademicSection>) {
    updateContent((current) => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, ...patch } : section,
      ),
    }));
  }

  function addSection() {
    const nextIndex = content.sections.length;
    updateContent((current) => ({
      ...current,
      sections: withAlternatingImages([
        ...current.sections,
        { title: '', text: '<p></p>', image: current.hero.image, imageAlt: '' },
      ]),
    }));
    setOpenSection(nextIndex);
  }

  function removeSection(index: number) {
    const title = content.sections[index]?.title || `Highlight ${index + 1}`;
    if (!window.confirm(`Remove "${title}"?`)) return;

    updateContent((current) => ({
      ...current,
      sections: withAlternatingImages(
        current.sections.filter((_, sectionIndex) => sectionIndex !== index),
      ),
    }));
    setOpenSection(null);
  }

  function moveSection(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= content.sections.length) return;

    updateContent((current) => {
      const nextSections = [...current.sections];
      [nextSections[index], nextSections[targetIndex]] = [
        nextSections[targetIndex],
        nextSections[index],
      ];
      return { ...current, sections: withAlternatingImages(nextSections) };
    });
    setOpenSection((current) => (current === index ? targetIndex : current));
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
        ? (isoFromDatetimeLocal(publishedAt) ?? new Date().toISOString())
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

  function unpublish() {
    const confirmed = window.confirm(
      `Unpublish ${config.title}? The public page shows default content until it is published again.`,
    );
    if (confirmed) void persist('DRAFT');
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
    if (activeImageField.startsWith('section-')) {
      const index = Number(activeImageField.slice('section-'.length));
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

  async function uploadImage(file: File) {
    if (!activeImageField) return;

    setIsUploadingImage(true);
    setMessage(null);

    try {
      const uploaded = await uploadImageForPicker({
        caption: content.hero.title || config.title,
        fallbackGalleryTitle: `${config.title} Images`,
        file,
        galleries,
        preferredGalleryId: galleryId,
      });

      selectImage(uploaded.path, uploaded.galleryId, uploaded.alt);
      setGalleries(uploaded.galleries);
      setGalleryId((current) => current ?? uploaded.galleryId);
      setMessage('Image uploaded. Save changes to publish it.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to upload image.');
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function uploadDocument(file: File) {
    setIsUploadingDocument(true);
    setMessage(null);

    try {
      const uploaded = await adminApi.uploadAcademicLevelAsset(config.key, 'document', file);
      updateOverview({
        curriculumFile: uploaded.path,
        curriculumLabel: content.overview.curriculumLabel || uploaded.filename.replace(/\.[^.]+$/, ''),
      });
      setMessage('Document uploaded. Save changes to publish it.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to upload document.');
    } finally {
      setIsUploadingDocument(false);
    }
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

  const isBusy = isSaving || isLoading || isUploadingImage || isUploadingDocument;
  const isPublished = status === 'PUBLISHED';

  return {
    activeImageField,
    addSection,
    attachFaq,
    attachedFaqs,
    availableFaqs,
    config,
    content,
    coverImage,
    deleteLevel,
    detachFaq,
    faqSearch,
    filteredAvailableFaqs,
    galleries,
    galleryId,
    isBusy,
    isFaqPickerOpen,
    isLoading,
    isPublished,
    isSaving,
    isUploadingImage,
    isUploadingDocument,
    itemId,
    message,
    moveFaq,
    moveSection,
    openSection,
    persist,
    publishedAt,
    removeSection,
    selectImage,
    setActiveImageField,
    setCoverImage,
    setFaqSearch,
    setIsFaqPickerOpen,
    setOpenSection,
    setPublishedAt,
    unpublish,
    updateHero,
    updateOverview,
    updateSection,
    uploadDocument,
    uploadImage,
    updatedAt,
  };
}

export type AcademicLevelEditorState = ReturnType<typeof useAcademicLevelEditor>;
