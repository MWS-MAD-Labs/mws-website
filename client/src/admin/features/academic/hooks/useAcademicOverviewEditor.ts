import { useEffect, useMemo, useState } from 'react';

import {
  adminApi,
  type AcademicOverviewItem,
  type AcademicOverviewPayload,
  type GalleryItem,
} from '@/admin/api/adminApi';
import { optionalText } from '../lib/academicLevelEditor';

export type AcademicOverviewForm = {
  title: string;
  description: string;
  coverImage: string;
  galleryId: string | null;
};

const defaultForm: AcademicOverviewForm = {
  title: 'Academic',
  description:
    'A connected learning journey that helps students build strong foundations, explore their interests, and grow into confident independent learners.',
  coverImage: '/assets-mws/DSC09500.jpg',
  galleryId: null,
};

function formFromItem(item: AcademicOverviewItem | null): AcademicOverviewForm {
  return {
    title: item?.title ?? defaultForm.title,
    description: item?.description ?? defaultForm.description,
    coverImage: item?.coverImage ?? defaultForm.coverImage,
    galleryId: item?.galleryId ?? null,
  };
}

function payloadFromForm(form: AcademicOverviewForm): AcademicOverviewPayload {
  return {
    title: form.title,
    description: optionalText(form.description),
    coverImage: optionalText(form.coverImage),
    galleryId: form.galleryId,
  };
}

export function useAcademicOverviewEditor() {
  const [overviewId, setOverviewId] = useState<string | null>(null);
  const [form, setForm] = useState<AcademicOverviewForm>(defaultForm);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [isGalleryPickerOpen, setIsGalleryPickerOpen] = useState(false);
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const selectedGallery = useMemo(
    () => galleries.find((gallery) => gallery.id === form.galleryId) ?? null,
    [form.galleryId, galleries],
  );

  function updateForm<Key extends keyof AcademicOverviewForm>(
    key: Key,
    value: AcademicOverviewForm[Key],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function loadData() {
    const [items, nextGalleries] = await Promise.all([
      adminApi.academicOverviews(),
      adminApi.galleries(),
    ]);
    const item = items[0] ?? null;

    setOverviewId(item?.id ?? null);
    setForm(formFromItem(item));
    setUpdatedAt(item?.updatedAt ?? null);
    setGalleries(nextGalleries);
  }

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      loadData()
        .catch((error) => {
          if (!cancelled) {
            setMessage(error instanceof Error ? error.message : 'Failed to load Academic.');
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function saveOverview() {
    setIsSaving(true);
    setMessage(null);

    try {
      const payload = payloadFromForm(form);
      const saved = overviewId
        ? await adminApi.updateAcademicOverview(overviewId, payload)
        : await adminApi.createAcademicOverview(payload);

      setOverviewId(saved.id);
      setForm(formFromItem(saved));
      setUpdatedAt(saved.updatedAt);
      setMessage('Academic overview saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save Academic overview.');
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteOverview() {
    if (!overviewId) return;
    const confirmed = window.confirm('Delete the Academic overview record?');
    if (!confirmed) return;

    setIsSaving(true);
    setMessage(null);

    try {
      await adminApi.deleteAcademicOverview(overviewId);
      setOverviewId(null);
      setForm(defaultForm);
      setUpdatedAt(null);
      setMessage('Academic overview deleted.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete Academic overview.');
    } finally {
      setIsSaving(false);
    }
  }

  function selectCoverImage(path: string, galleryId: string | null) {
    setForm((current) => ({
      ...current,
      coverImage: path,
      galleryId: current.galleryId ?? galleryId,
    }));
  }

  const isBusy = isSaving || isLoading;

  return {
    deleteOverview,
    form,
    galleries,
    isAssetPickerOpen,
    isBusy,
    isGalleryPickerOpen,
    isLoading,
    isSaving,
    message,
    overviewId,
    saveOverview,
    selectCoverImage,
    selectedGallery,
    setIsAssetPickerOpen,
    setIsGalleryPickerOpen,
    updateForm,
    updatedAt,
  };
}

export type AcademicOverviewEditorState = ReturnType<typeof useAcademicOverviewEditor>;
