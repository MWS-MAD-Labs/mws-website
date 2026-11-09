import type { SiteSettingsGroup } from '@/features/site-settings/siteSettingsData';

export const SETTINGS_PATHS: Record<SiteSettingsGroup, string> = {
  contact: '/admin/settings/contact',
  location: '/admin/settings/location',
  officeHours: '/admin/settings/office-hours',
  social: '/admin/settings/social',
};
