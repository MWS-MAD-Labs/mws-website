import { useEffect, useMemo, useState } from 'react';

import { adminApi, type GalleryItem } from '@/admin/api/adminApi';
import {
  defaultOurSchoolContent,
  normalizeOurSchoolContent,
  type EditableOurSchoolContent,
  type OurSchoolImageField,
  type OurSchoolStatus,
} from '../lib/ourSchoolEditor';
import { useToastState } from '@/admin/components/ui/toastContext';
import { uploadImageForPicker } from '@/admin/features/gallery/utils/uploadImageForPicker';

export function useOurSchoolEditor() {
  const [pageId, setPageId] = useState<string | null>(null);
  const [content, setContent] = useState<EditableOurSchoolContent>(defaultOurSchoolContent);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [galleryId, setGalleryId] = useState<string | null>(null);
  const [featuredImageId, setFeaturedImageId] = useState<string | null>(null);
  const [activeImageField, setActiveImageField] = useState<OurSchoolImageField | null>(null);
  const [isGalleryPickerOpen, setIsGalleryPickerOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [message, setMessage] = useToastState<string | null>(null);

  const selectedGallery = useMemo(
    () => galleries.find((gallery) => gallery.id === galleryId) ?? null,
    [galleries, galleryId],
  );

  const selectedFeaturedImage = useMemo(
    () => selectedGallery?.images.find((image) => image.id === featuredImageId) ?? null,
    [featuredImageId, selectedGallery],
  );

  function updateContent(updater: (current: EditableOurSchoolContent) => EditableOurSchoolContent) {
    setContent((current) => updater(current));
  }

  async function loadData() {
    const [items, nextGalleries] = await Promise.all([adminApi.ourSchools(), adminApi.galleries()]);
    const item = items[0] ?? null;

    setPageId(item?.id ?? null);
    setContent(normalizeOurSchoolContent(item));
    setGalleryId(item?.galleryId ?? null);
    setFeaturedImageId(item?.featuredImageId ?? null);
    setGalleries(nextGalleries);
  }

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      loadData()
        .catch((error) => {
          if (!cancelled) {
            setMessage(error instanceof Error ? error.message : 'Failed to load Our School page.');
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [setMessage]);

  async function persist(nextStatus: OurSchoolStatus) {
    setIsSaving(true);
    setMessage(null);

    const nextContent: EditableOurSchoolContent = {
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

      setPageId(saved.id);
      setContent(normalizeOurSchoolContent(saved));
      setGalleryId(saved.galleryId);
      setFeaturedImageId(saved.featuredImageId);
      setMessage(nextStatus === 'PUBLISHED' ? 'Our School page published.' : 'Draft saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save Our School page.');
    } finally {
      setIsSaving(false);
    }
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

  function selectImage(path: string, gallery: string | null, alt: string) {
    if (!activeImageField) return;

    if (activeImageField === 'hero') {
      updateContent((current) => ({
        ...current,
        hero: { ...current.hero, image: path, imageAlt: alt || current.hero.imageAlt },
      }));
    }

    if (activeImageField === 'background') {
      updateContent((current) => ({
        ...current,
        background: {
          ...current.background,
          image: path,
          imageAlt: alt || current.background.imageAlt,
        },
      }));
    }

    if (activeImageField === 'visionMission') {
      updateContent((current) => ({
        ...current,
        visionMission: {
          ...current.visionMission,
          image: path,
          imageAlt: alt || current.visionMission.imageAlt,
        },
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
        caption: content.hero.title,
        fallbackGalleryTitle: 'Our School Images',
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

  function addFaq() {
    updateContent((current) => ({
      ...current,
      faq: [
        ...current.faq,
        {
          question: 'New question',
          answer: 'New answer',
        },
      ],
    }));
    setOpenFaqIndex(content.faq.length);
  }

  function removeFaq(index: number) {
    if (content.faq.length <= 1) return;
    const confirmed = window.confirm('Remove this FAQ from Our School page?');
    if (!confirmed) return;

    updateContent((current) => ({
      ...current,
      faq: current.faq.filter((_, faqIndex) => faqIndex !== index),
    }));
    setOpenFaqIndex(null);
  }

  const isBusy = isLoading || isSaving || isUploadingImage;

  return {
    activeImageField,
    addFaq,
    content,
    featuredImageId,
    galleries,
    galleryId,
    isBusy,
    isGalleryPickerOpen,
    isLoading,
    isSaving,
    isUploadingImage,
    message,
    openFaqIndex,
    pageId,
    persist,
    removeFaq,
    selectGallery,
    selectImage,
    selectedFeaturedImage,
    selectedGallery,
    setActiveImageField,
    setFeaturedImageId,
    setIsGalleryPickerOpen,
    setOpenFaqIndex,
    updateContent,
    updateParagraph,
    uploadImage,
  };
}

export type OurSchoolEditorState = ReturnType<typeof useOurSchoolEditor>;
