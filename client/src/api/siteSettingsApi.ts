import { apiRequest } from '@/lib/api';
import type { SiteSettings } from '@/features/site-settings/siteSettingsData';

export const siteSettingsApi = {
  async publicSettings(): Promise<SiteSettings> {
    const response = await apiRequest<{ data: SiteSettings }>('/api/site-settings');
    return response!.data;
  },
};
