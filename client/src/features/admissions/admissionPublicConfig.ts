import type { AdmissionProgramData } from '@/api/pageApi';
import { asset } from '@/data/site';

export const fallbackPrograms: AdmissionProgramData[] = [
  {
    id: 'kindergarten',
    title: 'Kindergarten',
    age: 'Age 2-6',
    description:
      'A nurturing first step into learning, where children build curiosity, confidence, communication, and positive relationships through meaningful experiences.',
    image: asset('Kindergarten.jpg'),
    path: '/academic/kindergarten',
    adminWhatsapp: '6281211112222',
    contactLabel: 'Contact Admissions',
    exploreLabel: 'Explore',
  },
  {
    id: 'elementary',
    title: 'Elementary',
    age: 'Age 6-12',
    description:
      'A stage for building strong academic foundations while developing independence, creativity, collaboration, and a deeper understanding of the world.',
    image: asset('Elementary.jpg'),
    path: '/academic/elementary',
    adminWhatsapp: '6281211112222',
    contactLabel: 'Contact Admissions',
    exploreLabel: 'Explore',
  },
  {
    id: 'high-school',
    title: 'High School',
    age: 'Age 12-15',
    description:
      'The secondary pathway helps students strengthen academic confidence, leadership, and readiness for more independent learning.',
    image: asset('JH.jpg'),
    path: '/academic/high-school',
    adminWhatsapp: '6281211112222',
    contactLabel: 'Contact Admissions',
    exploreLabel: 'Explore',
  },
];

export const stepFallbackImages = [
  asset('_DSC7101.jpg'),
  asset('DSC09500.jpg'),
  asset('Elementary.jpg'),
  asset('Kindergarten.jpg'),
];

export const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--burgundy)]';

export const primaryButton = `inline-flex items-center justify-center gap-2 bg-[var(--burgundy)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 ${focusRing}`;

const digitsOnly = (value: string) => value.replace(/\D/g, '');

export function whatsappHref(number: string, message: string) {
  return `https://wa.me/${digitsOnly(number)}?text=${encodeURIComponent(message)}`;
}
