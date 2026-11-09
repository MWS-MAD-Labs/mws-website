import { useEffect, useState } from 'react';
import { adminApi } from '@/admin/api/adminApi';
import { useToastState } from '@/admin/components/ui/toastContext';
import { useUnsavedChangesGuard } from '@/admin/hooks/useUnsavedChangesGuard';
import {
  defaultSiteSettings,
  type SiteSettings,
  type SiteSettingsGroup,
} from '@/features/site-settings/siteSettingsData';

type SectionOptions<Group extends SiteSettingsGroup> = {
  /** Trims values and drops empty rows before saving. */
  clean: (value: SiteSettings[Group]) => SiteSettings[Group];
  /** Returns the first problem that would make the server refuse the save. */
  validate: (value: SiteSettings[Group]) => string | null;
  successMessage: string;
};

/** Loads, edits and saves one Settings section (one sub-menu page). */
export function useSiteSettingsSection<Group extends SiteSettingsGroup>(
  group: Group,
  { clean, validate, successMessage }: SectionOptions<Group>,
) {
  const [value, setValue] = useState<SiteSettings[Group]>(defaultSiteSettings[group]);
  const [savedValue, setSavedValue] = useState<SiteSettings[Group] | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useToastState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      adminApi
        .siteSettings()
        .then((data) => {
          if (cancelled) return;
          setValue(data.settings[group]);
          setSavedValue(data.settings[group]);
          setUpdatedAt(data.updatedAt);
        })
        .catch((error) => {
          if (!cancelled) {
            setMessage(error instanceof Error ? error.message : 'Failed to load settings.');
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [group, setMessage]);

  const hasUnsavedChanges =
    !isLoading && savedValue !== null && JSON.stringify(value) !== JSON.stringify(savedValue);

  useUnsavedChangesGuard(hasUnsavedChanges && !isSaving);

  async function save() {
    const cleaned = clean(value);
    const problem = validate(cleaned);
    if (problem) {
      setMessage(problem);
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const data = await adminApi.updateSiteSettings(group, cleaned);
      setValue(data.settings[group]);
      setSavedValue(data.settings[group]);
      setUpdatedAt(data.updatedAt);
      setMessage(successMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  }

  return {
    hasUnsavedChanges,
    isBusy: isLoading || isSaving,
    isLoading,
    isSaving,
    message,
    save,
    setValue,
    updatedAt,
    value,
  };
}
