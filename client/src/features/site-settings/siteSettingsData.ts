export type SiteSettingsGroup = 'contact' | 'location' | 'officeHours' | 'social';

export type SocialPlatform = 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'linkedin';

export type SiteSettings = {
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
  };
  location: {
    name: string;
    addressLines: string[];
    mapEmbedSrc: string;
  };
  officeHours: {
    items: Array<{ title: string; text: string }>;
  };
  social: Record<SocialPlatform, string>;
};

export type SiteSettingsResponse = {
  id: string | null;
  updatedAt: string | null;
  settings: SiteSettings;
};

/** Mirrors defaultSiteSettings in server/src/services/site-settings-service.ts. */
export const defaultSiteSettings: SiteSettings = {
  contact: {
    phone: '+62 821-1150-7100',
    whatsapp: '+62 821-1150-7100',
    email: 'info@millennia21.id',
  },
  location: {
    name: 'Millennia World School',
    addressLines: [
      'Jl. Merpati Raya No. 103, Sawah Lama, Ciputat,',
      'Tangerang Selatan, Banten 15413, Indonesia',
    ],
    mapEmbedSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.7314275134707!2d106.7262070747513!3d-6.300282493688862!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69fa70d8a57eb7%3A0x6b10705a6ef6c3b6!2sMillennia%20World%20School!5e0!3m2!1sen!2sid!4v1715569420000!5m2!1sen!2sid',
  },
  officeHours: {
    items: [
      { title: 'Monday - Friday', text: '07:30 AM - 04:00 PM' },
      { title: 'Saturday', text: '08:00 AM - 12:00 PM (Admissions office only)' },
      { title: 'Sunday & Public Holidays', text: 'Closed' },
    ],
  },
  social: {
    instagram: '',
    facebook: '',
    youtube: '',
    tiktok: '',
    linkedin: '',
  },
};

export const SOCIAL_PLATFORMS: Array<{ key: SocialPlatform; label: string; placeholder: string }> = [
  { key: 'instagram', label: 'Instagram', placeholder: 'https://www.instagram.com/millennia21' },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://www.facebook.com/millennia21' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://www.youtube.com/@millennia21' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://www.tiktok.com/@millennia21' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://www.linkedin.com/school/millennia21' },
];

export function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

export function whatsappLink(number: string, message?: string) {
  const base = `https://wa.me/${digitsOnly(number)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function telLink(number: string) {
  return `tel:${number.replace(/[^\d+]/g, '')}`;
}
