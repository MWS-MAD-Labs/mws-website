import { useEffect, useState } from 'react';
import { siteSettingsApi } from '@/api/siteSettingsApi';
import { defaultSiteSettings, type SiteSettings } from './siteSettingsData';

// One request per page load: the footer and page sections share it.
let cachedSettings: SiteSettings | null = null;
let pendingRequest: Promise<SiteSettings> | null = null;

function loadSiteSettings() {
  if (cachedSettings) return Promise.resolve(cachedSettings);

  pendingRequest ??= siteSettingsApi
    .publicSettings()
    .then((settings) => {
      cachedSettings = settings;
      return settings;
    })
    .finally(() => {
      pendingRequest = null;
    });

  return pendingRequest;
}

/** Public school contact settings, with built-in defaults until they load. */
export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(cachedSettings ?? defaultSiteSettings);

  useEffect(() => {
    let cancelled = false;

    loadSiteSettings()
      .then((next) => {
        if (!cancelled) setSettings(next);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  return settings;
}
