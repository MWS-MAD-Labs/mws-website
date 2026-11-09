import { useEffect, useMemo, useState } from 'react';

import { pageApi, type AdmissionProgramData } from '@/api/pageApi';
import {
  defaultAdmissionPageContent,
  normalizeAdmissionPageContent,
  type AdmissionPageContent,
} from '@/features/admissions/admissionPageData';
import { fallbackPrograms, whatsappHref } from '@/features/admissions/admissionPublicConfig';
import { useSiteSettings } from '@/features/site-settings/useSiteSettings';

const admissionMessage =
  'Hello MWS Admissions Team, I would like to ask about admissions. Could you please help me with the next steps?';

export function useAdmissionPage() {
  const [programs, setPrograms] = useState<AdmissionProgramData[]>(fallbackPrograms);
  const [content, setContent] = useState<AdmissionPageContent>(defaultAdmissionPageContent);
  const { contact } = useSiteSettings();
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    pageApi
      .admissions()
      .then((data) => {
        if (!isMounted) return;
        setPrograms(data.programs.length ? data.programs : fallbackPrograms);
        setContent(normalizeAdmissionPageContent(data.content));
        setLoadError(null);
      })
      .catch((error) => {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : 'Unable to load admissions content.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const generalHref = useMemo(
    () => whatsappHref(contact.whatsapp, admissionMessage),
    [contact.whatsapp],
  );

  return {
    content,
    generalHref,
    loadError,
    programs,
  };
}
