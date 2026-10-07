import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { adminApi, type AdminAdmissionProgram, type GalleryItem } from '@/admin/api/adminApi';
import { useToastState } from '@/admin/components/ui/toastContext';
import { uploadImageForPicker } from '@/admin/features/gallery/utils/uploadImageForPicker';
import {
  normalizeAdmissionPageContent,
  type AdmissionInfoTile,
  type AdmissionPageStatus,
  type AdmissionStepItem,
  type EditableAdmissionPageContent,
} from '@/features/admissions/admissionPageData';

type AdmissionProgramField = keyof AdminAdmissionProgram;

type AdmissionImageTarget =
  | { type: 'hero' }
  | { type: 'introMedia' }
  | { type: 'step'; index: number }
  | { type: 'infoTile'; index: number }
  | { type: 'program'; id: string };

type ProgramImageSelection = {
  galleryId: string | null;
  path: string;
  alt: string;
};

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : '';
}

function serializePrograms(programs: AdminAdmissionProgram[]) {
  return programs.map((program, index) => ({
    ...program,
    age: optionalText(program.age),
    adminWhatsapp: optionalText(program.adminWhatsapp),
    contactLabel: optionalText(program.contactLabel ?? ''),
    description: optionalText(program.description),
    exploreLabel: optionalText(program.exploreLabel ?? ''),
    image: optionalText(program.image),
    imageAlt: optionalText(program.imageAlt ?? ''),
    path: optionalText(program.path),
    sortOrder: program.sortOrder ?? index,
    isActive: program.isActive ?? true,
  }));
}

function updateProgramField(
  programs: AdminAdmissionProgram[],
  id: string,
  field: AdmissionProgramField,
  value: string | boolean | null,
) {
  return programs.map((program) => (program.id === id ? { ...program, [field]: value } : program));
}

export function useAdmissionsEditor() {
  const [pageId, setPageId] = useState<string | null>(null);
  const [content, setContent] = useState<EditableAdmissionPageContent>(
    normalizeAdmissionPageContent(null),
  );
  const [programs, setPrograms] = useState<AdminAdmissionProgram[]>([]);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [galleryId, setGalleryId] = useState<string | null>(null);
  const [activeImageTarget, setActiveImageTarget] = useState<AdmissionImageTarget | null>(null);
  const [isGalleryPickerOpen, setIsGalleryPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [message, setMessage] = useToastState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const selectedGallery = useMemo(
    () => galleries.find((gallery) => gallery.id === galleryId) ?? null,
    [galleries, galleryId],
  );

  function updateContent(
    updater: (
      current: EditableAdmissionPageContent,
    ) => EditableAdmissionPageContent,
  ) {
    setContent((current) => updater(current));
  }

  async function loadAdmissions() {
    const data = await adminApi.admissions();
    setPageId(data.page.id);
    setContent(
      normalizeAdmissionPageContent({
        ...(data.page.content ?? {}),
        status: data.page.isPublished ? 'PUBLISHED' : 'DRAFT',
      }),
    );
    setGalleryId(data.page.galleryId);
    setUpdatedAt(data.page.updatedAt);
    setPrograms(data.programs);
    setGalleries(data.galleries);
  }

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      loadAdmissions()
        .catch((error) => {
          if (!cancelled) {
            setMessage(error instanceof Error ? error.message : 'Failed to load admissions.');
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

  async function persist(nextStatus: AdmissionPageStatus) {
    setIsSaving(true);
    setMessage(null);

    const nextContent: EditableAdmissionPageContent = {
      ...content,
      status: nextStatus,
    };

    try {
      const data = await adminApi.updateAdmissions({
        content: nextContent,
        galleryId,
        isPublished: nextStatus === 'PUBLISHED',
        programs: serializePrograms(programs),
      });

      setPageId(data.page.id);
      setContent(
        normalizeAdmissionPageContent({
          ...(data.page.content ?? {}),
          status: data.page.isPublished ? 'PUBLISHED' : 'DRAFT',
        }),
      );
      setGalleryId(data.page.galleryId);
      setUpdatedAt(data.page.updatedAt);
      setPrograms(data.programs);
      setMessage(nextStatus === 'PUBLISHED' ? 'Admissions page published.' : 'Draft saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save admissions.');
    } finally {
      setIsSaving(false);
    }
  }

  async function saveAdmissions(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    await persist('PUBLISHED');
  }

  function updateProgram(
    id: string,
    field: AdmissionProgramField,
    value: string | boolean | null,
  ) {
    setPrograms((current) => updateProgramField(current, id, field, value));
  }

  function updateIntroParagraph(index: number, value: string) {
    updateContent((current) => ({
      ...current,
      introBody: current.introBody.map((paragraph, paragraphIndex) =>
        paragraphIndex === index ? value : paragraph,
      ),
    }));
  }

  function updateStep(index: number, value: Partial<AdmissionStepItem>) {
    updateContent((current) => ({
      ...current,
      steps: current.steps.map((step, stepIndex) =>
        stepIndex === index ? { ...step, ...value } : step,
      ),
    }));
  }

  function addStep() {
    updateContent((current) => ({
      ...current,
      steps: [
        ...current.steps,
        {
          title: `Step ${current.steps.length + 1}`,
          description: '',
          detail: '',
          image: '',
          imageAlt: '',
        },
      ],
    }));
  }

  function removeStep(index: number) {
    updateContent((current) => ({
      ...current,
      steps: current.steps.filter((_, stepIndex) => stepIndex !== index),
    }));
  }

  function updateInfoTile(index: number, value: Partial<AdmissionInfoTile>) {
    updateContent((current) => ({
      ...current,
      infoTiles: current.infoTiles.map((tile, tileIndex) =>
        tileIndex === index ? { ...tile, ...value } : tile,
      ),
    }));
  }

  function selectImage(selection: ProgramImageSelection) {
    if (!activeImageTarget) return;

    if (activeImageTarget.type === 'program') {
      setPrograms((current) =>
        current.map((program) =>
          program.id === activeImageTarget.id
            ? {
                ...program,
                galleryId: selection.galleryId,
                image: selection.path,
                imageAlt: selection.alt,
              }
            : program,
        ),
      );
    }

    if (activeImageTarget.type === 'hero') {
      updateContent((current) => ({
        ...current,
        heroImage: selection.path,
        heroImageAlt: selection.alt || current.heroImageAlt,
      }));
    }

    if (activeImageTarget.type === 'introMedia') {
      updateContent((current) => ({
        ...current,
        introMedia: {
          ...current.introMedia,
          type: 'image',
          src: selection.path,
          alt: selection.alt || current.introMedia.alt,
        },
      }));
    }

    if (activeImageTarget.type === 'step') {
      updateStep(activeImageTarget.index, {
        image: selection.path,
        imageAlt: selection.alt,
      });
    }

    if (activeImageTarget.type === 'infoTile') {
      updateInfoTile(activeImageTarget.index, {
        image: selection.path,
      });
    }

    setGalleryId((current) => current ?? selection.galleryId);
  }

  async function uploadImage(file: File) {
    if (!activeImageTarget) return;

    setIsUploadingImage(true);
    setMessage(null);

    const program =
      activeImageTarget.type === 'program'
        ? programs.find((item) => item.id === activeImageTarget.id)
        : null;

    try {
      const uploaded = await uploadImageForPicker({
        caption: program?.title || content.heroTitle || 'Admissions',
        fallbackGalleryTitle: 'Admissions Images',
        file,
        galleries,
        preferredGalleryId: program?.galleryId ?? galleryId,
      });

      selectImage({
        galleryId: uploaded.galleryId,
        path: uploaded.path,
        alt: uploaded.alt,
      });
      setGalleries(uploaded.galleries);
      setMessage('Image uploaded. Save changes to publish it.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to upload image.');
    } finally {
      setIsUploadingImage(false);
    }
  }

  const selectedProgram =
    activeImageTarget?.type === 'program'
      ? programs.find((program) => program.id === activeImageTarget.id)
      : null;
  const activeCount = programs.filter((program) => program.isActive ?? true).length;
  const imageCount = programs.filter((program) => Boolean(program.image)).length;
  const isBusy = isLoading || isSaving || isUploadingImage;

  return {
    activeCount,
    activeImageTarget,
    content,
    galleries,
    galleryId,
    imageCount,
    isBusy,
    isGalleryPickerOpen,
    isLoading,
    isSaving,
    isUploadingImage,
    message,
    pageId,
    persist,
    programs,
    saveAdmissions,
    selectGallery: setGalleryId,
    selectImage,
    selectedGallery,
    selectedProgram,
    setActiveImageTarget,
    setIsGalleryPickerOpen,
    addStep,
    removeStep,
    updateContent,
    updateInfoTile,
    updateIntroParagraph,
    updateProgram,
    updateStep,
    updatedAt,
    uploadImage,
  };
}

export type AdmissionsEditorState = ReturnType<typeof useAdmissionsEditor>;
