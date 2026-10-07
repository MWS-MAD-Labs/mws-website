import { useEffect, useMemo, useState } from 'react';

import {
  adminApi,
  type AcademicOverviewContent,
  type AcademicOverviewItem,
  type AcademicOverviewPayload,
  type GalleryItem,
} from '@/admin/api/adminApi';
import { optionalText } from '../lib/academicLevelEditor';
import { useToastState } from '@/admin/components/ui/toastContext';
import { uploadImageForPicker } from '@/admin/features/gallery/utils/uploadImageForPicker';

export type AcademicOverviewForm = {
  title: string;
  description: string;
  coverImage: string;
  content: AcademicOverviewContent;
  galleryId: string | null;
};

const defaultForm: AcademicOverviewForm = {
  title: 'Academic',
  description:
    'A connected learning journey that helps students build strong foundations, explore their interests, and grow into confident independent learners.',
  coverImage: '/assets-mws/DSC09500.jpg',
  content: {
    intro: {
      title: 'Learning should grow with the learner.',
      body:
        '<p>At Millennia World School, students build strong academic foundations while gradually developing the confidence and independence to take ownership of their learning.</p>',
      image: '/assets-mws/_DSC7101.jpg',
      imageAlt: 'MWS students learning together',
    },
    experience: {
      title: 'From guided learning to greater independence.',
      body:
        '<p>Our classrooms give students opportunities to learn through direct instruction, inquiry, discussion, projects, and collaboration. Teachers guide students closely while gradually giving them more responsibility for their ideas, decisions, and progress.</p><p>This balance allows students to develop strong academic foundations while also becoming thoughtful, curious, and responsible learners.</p>',
      image: '/assets-mws/_DSC7101.jpg',
      imageAlt: 'MWS students learning together',
    },
    approach: [
      {
        title: 'Learning through inquiry',
        body:
          'Students ask questions, explore ideas, collaborate with others, and connect what they learn with experiences beyond the classroom.',
      },
      {
        title: 'Guided at first, independent over time',
        body:
          'Teachers guide students closely, then gradually hand over more responsibility for their ideas, decisions, and progress.',
      },
      {
        title: 'Many ways to learn',
        body:
          'Direct instruction, discussion, projects, and teamwork all have a place in the classroom, so every student has room to grow.',
      },
    ],
  },
  galleryId: null,
};

type AcademicOverviewImageField = 'cover' | 'intro' | 'experience';

function contentFromItem(item: AcademicOverviewItem | null): AcademicOverviewContent {
  const content = item?.content;

  return {
    intro: {
      ...defaultForm.content.intro,
      ...(content?.intro ?? {}),
    },
    experience: {
      ...defaultForm.content.experience,
      ...(content?.experience ?? {}),
    },
    approach: content?.approach?.length ? content.approach : defaultForm.content.approach,
  };
}

function formFromItem(item: AcademicOverviewItem | null): AcademicOverviewForm {
  return {
    title: item?.title ?? defaultForm.title,
    description: item?.description ?? defaultForm.description,
    coverImage: item?.coverImage ?? defaultForm.coverImage,
    content: contentFromItem(item),
    galleryId: item?.galleryId ?? null,
  };
}

function payloadFromForm(form: AcademicOverviewForm): AcademicOverviewPayload {
  return {
    title: form.title,
    description: optionalText(form.description),
    coverImage: optionalText(form.coverImage),
    content: form.content,
    galleryId: form.galleryId,
  };
}

export function useAcademicOverviewEditor() {
  const [overviewId, setOverviewId] = useState<string | null>(null);
  const [form, setForm] = useState<AcademicOverviewForm>(defaultForm);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [isGalleryPickerOpen, setIsGalleryPickerOpen] = useState(false);
  const [activeImageField, setActiveImageField] = useState<AcademicOverviewImageField | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [message, setMessage] = useToastState<string | null>(null);
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

  function updateContentSection<Key extends keyof AcademicOverviewContent>(
    section: Key,
    value: Partial<AcademicOverviewContent[Key]>,
  ) {
    setForm((current) => ({
      ...current,
      content: {
        ...current.content,
        [section]: {
          ...current.content[section],
          ...value,
        },
      },
    }));
  }

  function updateApproachItem(
    index: number,
    value: Partial<AcademicOverviewContent['approach'][number]>,
  ) {
    setForm((current) => ({
      ...current,
      content: {
        ...current.content,
        approach: current.content.approach.map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                ...value,
              }
            : item,
        ),
      },
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
  }, [setMessage]);

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

  function selectImage(path: string, galleryId: string | null) {
    setForm((current) => ({
      ...current,
      ...(activeImageField === 'cover' ? { coverImage: path } : {}),
      content:
        activeImageField === 'intro' || activeImageField === 'experience'
          ? {
              ...current.content,
              [activeImageField]: {
                ...current.content[activeImageField],
                image: path,
              },
            }
          : current.content,
      galleryId: current.galleryId ?? galleryId,
    }));
  }

  async function uploadImage(file: File) {
    setIsUploadingImage(true);
    setMessage(null);

    try {
      const uploaded = await uploadImageForPicker({
        caption: form.title || 'Academic overview',
        fallbackGalleryTitle: 'Academic Overview Images',
        file,
        galleries,
        preferredGalleryId: form.galleryId,
      });

      selectImage(uploaded.path, uploaded.galleryId);
      setGalleries(uploaded.galleries);
      setMessage('Image uploaded. Save changes to publish it.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to upload image.');
    } finally {
      setIsUploadingImage(false);
    }
  }

  const isBusy = isSaving || isLoading || isUploadingImage;

  return {
    deleteOverview,
    activeImageField,
    form,
    galleries,
    isBusy,
    isGalleryPickerOpen,
    isLoading,
    isSaving,
    isUploadingImage,
    message,
    overviewId,
    saveOverview,
    selectImage,
    selectedGallery,
    setActiveImageField,
    setIsGalleryPickerOpen,
    uploadImage,
    updateApproachItem,
    updateContentSection,
    updateForm,
    updatedAt,
  };
}

export type AcademicOverviewEditorState = ReturnType<typeof useAcademicOverviewEditor>;
