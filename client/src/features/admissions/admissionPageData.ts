import { asset } from '@/data/site';

export type AdmissionStepItem = {
  title: string;
  description: string;
  detail?: string;
  image?: string;
  imageAlt?: string;
};

export type AdmissionInfoTile = {
  title: string;
  description: string;
  linkLabel: string;
  linkUrl: string;
  image?: string;
};

export type AdmissionIntroMedia = {
  type: 'image' | 'video';
  src: string;
  poster?: string;
  alt: string;
};

export type AdmissionPageContent = {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroImageAlt: string;
  menuTitle: string;
  readyTitle: string;
  introTitle: string;
  introBody: string[];
  introMedia: AdmissionIntroMedia;
  processTitle: string;
  processIntro: string;
  steps: AdmissionStepItem[];
  infoTiles: AdmissionInfoTile[];
};

export type AdmissionPageStatus = 'DRAFT' | 'PUBLISHED';

export type EditableAdmissionPageContent = AdmissionPageContent & {
  status?: AdmissionPageStatus;
};

export const defaultAdmissionPageContent: AdmissionPageContent = {
  heroTitle: 'Start your journey at MWS',
  heroSubtitle: 'A caring place where your child can grow academically, socially, and personally.',
  heroImage: asset('DSC04079.jpg'),
  heroImageAlt: 'Students and families at Millennia World School',
  menuTitle: 'Admission',
  readyTitle: 'Are you ready to begin your journey?',
  introTitle: 'Choosing a school is a family decision.',
  introBody: [
    'Millennia World School welcomes families who are looking for a caring environment where students can grow academically, socially, and personally.',
    'Our admissions team supports each family personally, from the first message to the first day of school.',
  ],
  introMedia: {
    type: 'image',
    src: asset('DSC09500.jpg'),
    alt: 'Learning spaces at Millennia World School',
  },
  processTitle: 'Admission process',
  processIntro: '',
  steps: [
    {
      title: 'Say hello',
      description: 'Send a message or book a tour.',
      detail:
        'Contact admissions or book a school tour so our team can understand your family, preferred level, and timeline.',
    },
    {
      title: 'Come and see',
      description: 'Visit the campus and meet our team.',
      detail:
        'Meet the admissions team, explore the learning environment, and discuss the program that best fits your child.',
    },
    {
      title: 'Share your documents',
      description: 'Send what we need, we are here to help.',
      detail:
        'Share the required student and family documents for review by the school administration team.',
    },
    {
      title: 'Welcome to MWS',
      description: 'We guide you through the first days.',
      detail:
        'After review and confirmation, our team will guide you through final enrollment and onboarding details.',
    },
  ],
  infoTiles: [
    {
      title: 'Frequently asked questions',
      description: 'Quick answers to what families ask us most about joining MWS.',
      linkLabel: 'Read the FAQ',
      linkUrl: '/admission/faq',
      image: asset('_DSC7101.jpg'),
    },
    {
      title: 'Academic calendar',
      description: 'See term dates, holidays, and key school events for the year.',
      linkLabel: 'View the calendar',
      linkUrl: '/school-calendar',
      image: asset('Elementary.jpg'),
    },
    {
      title: 'Admission guidelines',
      description: 'Requirements, document checklist, and how placement works.',
      linkLabel: 'Read the guidelines',
      linkUrl: '/admission/guidelines',
      image: asset('JH.jpg'),
    },
  ],
};

function stringValue(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeIntroMedia(value: unknown): AdmissionIntroMedia {
  const source = objectValue(value);
  const type = source.type === 'video' ? 'video' : 'image';

  return {
    ...defaultAdmissionPageContent.introMedia,
    type,
    src: stringValue(source.src, defaultAdmissionPageContent.introMedia.src),
    poster: typeof source.poster === 'string' ? source.poster : undefined,
    alt: stringValue(source.alt, defaultAdmissionPageContent.introMedia.alt),
  };
}

function normalizeSteps(value: unknown): AdmissionStepItem[] {
  const source = Array.isArray(value) && value.length ? value : defaultAdmissionPageContent.steps;

  return source.map((item, index) => {
    const step = objectValue(item);
    const fallback =
      defaultAdmissionPageContent.steps[index] ?? defaultAdmissionPageContent.steps[0]!;

    return {
      title: stringValue(step.title, fallback.title),
      description: stringValue(step.description, fallback.description),
      detail: stringValue(step.detail, fallback.detail ?? fallback.description),
      image: typeof step.image === 'string' ? step.image : fallback.image,
      imageAlt: typeof step.imageAlt === 'string' ? step.imageAlt : fallback.imageAlt,
    };
  });
}

function normalizeInfoTiles(value: unknown): AdmissionInfoTile[] {
  const source = Array.isArray(value) && value.length ? value : defaultAdmissionPageContent.infoTiles;

  return source.map((item, index) => {
    const tile = objectValue(item);
    const fallback =
      defaultAdmissionPageContent.infoTiles[index] ?? defaultAdmissionPageContent.infoTiles[0]!;

    return {
      title: stringValue(tile.title, fallback.title),
      description: stringValue(tile.description, fallback.description),
      linkLabel: stringValue(tile.linkLabel, fallback.linkLabel),
      linkUrl: stringValue(tile.linkUrl, fallback.linkUrl),
      image: typeof tile.image === 'string' ? tile.image : fallback.image,
    };
  });
}

export function normalizeAdmissionPageContent(
  value: Partial<EditableAdmissionPageContent> | null | undefined,
): EditableAdmissionPageContent {
  const source = objectValue(value);

  return {
    ...defaultAdmissionPageContent,
    heroTitle: stringValue(source.heroTitle, defaultAdmissionPageContent.heroTitle),
    heroSubtitle: stringValue(source.heroSubtitle, defaultAdmissionPageContent.heroSubtitle),
    heroImage: stringValue(source.heroImage, defaultAdmissionPageContent.heroImage),
    heroImageAlt: stringValue(source.heroImageAlt, defaultAdmissionPageContent.heroImageAlt),
    menuTitle: stringValue(source.menuTitle, defaultAdmissionPageContent.menuTitle),
    readyTitle: stringValue(source.readyTitle, defaultAdmissionPageContent.readyTitle),
    introTitle: stringValue(source.introTitle, defaultAdmissionPageContent.introTitle),
    introBody:
      Array.isArray(source.introBody) && source.introBody.length
        ? source.introBody.map((item) => String(item))
        : defaultAdmissionPageContent.introBody,
    introMedia: normalizeIntroMedia(source.introMedia),
    processTitle: stringValue(source.processTitle, defaultAdmissionPageContent.processTitle),
    processIntro: stringValue(source.processIntro, defaultAdmissionPageContent.processIntro),
    steps: normalizeSteps(source.steps),
    infoTiles: normalizeInfoTiles(source.infoTiles),
    status: source.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
  };
}
