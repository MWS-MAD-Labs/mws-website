import { useEffect, useState, type FormEvent } from 'react';

import { adminApi, type AdminAdmissionProgram, type GalleryItem } from '@/admin/api/adminApi';

type AdmissionProgramField = keyof AdminAdmissionProgram;

type ProgramImageSelection = {
  galleryId: string;
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
  const [programs, setPrograms] = useState<AdminAdmissionProgram[]>([]);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [assetPickerProgramId, setAssetPickerProgramId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadAdmissions() {
    const data = await adminApi.admissions();
    setPrograms(data.programs);
    setGalleries(data.galleries);
  }

  useEffect(() => {
    queueMicrotask(() => {
      loadAdmissions()
        .catch((error) =>
          setMessage(error instanceof Error ? error.message : 'Failed to load admissions.'),
        )
        .finally(() => setIsLoading(false));
    });
  }, []);

  async function saveAdmissions(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    setIsSaving(true);
    setMessage(null);

    try {
      const data = await adminApi.updateAdmissions(serializePrograms(programs));
      setPrograms(data.programs);
      setMessage('Admissions content updated.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save admissions.');
    } finally {
      setIsSaving(false);
    }
  }

  function updateProgram(
    id: string,
    field: AdmissionProgramField,
    value: string | boolean | null,
  ) {
    setPrograms((current) => updateProgramField(current, id, field, value));
  }

  function selectProgramImage(selection: ProgramImageSelection) {
    setPrograms((current) =>
      current.map((program) =>
        program.id === assetPickerProgramId
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

  const selectedProgram = programs.find((program) => program.id === assetPickerProgramId);

  return {
    assetPickerProgramId,
    galleries,
    isLoading,
    isSaving,
    message,
    programs,
    selectedProgram,
    saveAdmissions,
    selectProgramImage,
    setAssetPickerProgramId,
    updateProgram,
  };
}

export type AdmissionsEditorState = ReturnType<typeof useAdmissionsEditor>;
