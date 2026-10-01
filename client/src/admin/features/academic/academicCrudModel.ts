import type {
  AcademicLevelKey,
  AcademicMasterLevel,
  FixedAcademicCrudResource,
  FixedAcademicLevelItem,
} from '@/admin/api/adminApi';

export type PageStatus = 'DRAFT' | 'PUBLISHED';

export type AcademicHero = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

export type AcademicOverview = {
  introTitle: string;
  intro: string;
  introImage: string;
  introImageAlt: string;
  curriculumTitle: string;
  curriculumDescription: string;
  curriculumFile?: string | null;
  curriculumLabel?: string | null;
  closingText?: string | null;
};

export type AcademicSection = {
  title: string;
  text: string;
  image: string;
  imageAlt: string;
  imagePosition?: 'left' | 'right';
};

export type AcademicLevelContent = {
  hero: AcademicHero;
  overview: AcademicOverview;
  sections: AcademicSection[];
};

export type AcademicLevelConfig = {
  key: AcademicLevelKey;
  resource: FixedAcademicCrudResource;
  title: string;
  masterTitle: string;
  previewPath: string;
  sortOrder: number;
};

export const academicLevelConfigs: Record<AcademicLevelKey, AcademicLevelConfig> = {
  kindergarten: {
    key: 'kindergarten',
    resource: 'kindergartens',
    title: 'Kindergarten',
    masterTitle: 'Kindergarten',
    previewPath: '/academic/kindergarten',
    sortOrder: 0,
  },
  elementary: {
    key: 'elementary',
    resource: 'elementaries',
    title: 'Elementary',
    masterTitle: 'Elementary',
    previewPath: '/academic/elementary',
    sortOrder: 1,
  },
  'high-school': {
    key: 'high-school',
    resource: 'junior-highs',
    title: 'Junior High',
    masterTitle: 'Junior High',
    previewPath: '/academic/high-school',
    sortOrder: 2,
  },
};

export const academicLevelOrder: AcademicLevelKey[] = [
  'kindergarten',
  'elementary',
  'high-school',
];

export function parseAcademicLevelKey(pathname: string): AcademicLevelKey {
  if (pathname.includes('/academic/elementary')) return 'elementary';
  if (pathname.includes('/academic/high-school')) return 'high-school';
  return 'kindergarten';
}

export function findMasterLevel(
  levels: AcademicMasterLevel[],
  key: AcademicLevelKey,
) {
  const config = academicLevelConfigs[key];
  return (
    levels.find((level) => level.title === config.masterTitle) ??
    levels.find((level) => level.title === config.title) ??
    null
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function text(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function richText(value: unknown, fallback = '<p></p>') {
  if (typeof value === 'string') return value || fallback;
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === 'string' ? `<p>${item}</p>` : '')).join('');
  }
  return fallback;
}

export function defaultAcademicContent(key: AcademicLevelKey): AcademicLevelContent {
  const config = academicLevelConfigs[key];
  const image =
    key === 'kindergarten'
      ? '/assets-mws/Kindergarten.jpg'
      : key === 'elementary'
        ? '/assets-mws/Elementary.jpg'
        : '/assets-mws/JH.jpg';

  return {
    hero: {
      title: config.title,
      description:
        key === 'kindergarten'
          ? 'The early years program supports curiosity, language, social confidence, and joyful independence through play-based inquiry.'
          : key === 'elementary'
            ? 'Elementary learners build strong academic foundations while practicing inquiry, collaboration, and independence.'
            : 'Students strengthen academic confidence, leadership, and readiness for more independent learning.',
      image,
      imageAlt: `${config.title} students`,
    },
    overview: {
      introTitle:
        key === 'kindergarten'
          ? 'Growing Through Discovery'
          : key === 'elementary'
            ? 'Building Strong Foundations'
            : 'Growing Into Independence',
      intro: '<p>Students are supported through meaningful learning experiences designed for their stage of development.</p>',
      introImage: image,
      introImageAlt: `${config.title} learning environment`,
      curriculumTitle: 'Our Curriculum',
      curriculumDescription:
        '<p>Our curriculum balances academic growth, inquiry, collaboration, and personal development.</p>',
      curriculumFile: null,
      curriculumLabel: null,
      closingText: '<p>Every learning experience helps students grow with confidence and care.</p>',
    },
    sections: [
      {
        title: 'Learning Experience',
        text: '<p>Students explore ideas, work with others, and connect learning with real experiences.</p>',
        image,
        imageAlt: `${config.title} learning`,
        imagePosition: 'right',
      },
      {
        title: 'Growth and Confidence',
        text: '<p>Daily routines and guided reflection help students build independence and responsibility.</p>',
        image,
        imageAlt: `${config.title} growth`,
        imagePosition: 'left',
      },
    ],
  };
}

export function academicContentFromItem(
  key: AcademicLevelKey,
  item: FixedAcademicLevelItem | null,
): AcademicLevelContent {
  const fallback = defaultAcademicContent(key);
  if (!item) return fallback;

  const hero = isObject(item.hero) ? item.hero : {};
  const overview = isObject(item.overview) ? item.overview : {};
  const sections = Array.isArray(item.sections) ? item.sections : [];

  return {
    hero: {
      ...fallback.hero,
      title: text(hero.title, item.title || fallback.hero.title),
      description: text(hero.description, item.description ?? fallback.hero.description),
      image: text(hero.image, item.coverImage ?? fallback.hero.image),
      imageAlt: text(hero.imageAlt, fallback.hero.imageAlt),
    },
    overview: {
      ...fallback.overview,
      introTitle: text(overview.introTitle, fallback.overview.introTitle),
      intro: richText(overview.intro, fallback.overview.intro),
      introImage: text(overview.introImage, fallback.overview.introImage),
      introImageAlt: text(overview.introImageAlt, fallback.overview.introImageAlt),
      curriculumTitle: text(overview.curriculumTitle, fallback.overview.curriculumTitle),
      curriculumDescription: richText(
        overview.curriculumDescription,
        fallback.overview.curriculumDescription,
      ),
      curriculumFile:
        typeof overview.curriculumFile === 'string' ? overview.curriculumFile : null,
      curriculumLabel:
        typeof overview.curriculumLabel === 'string' ? overview.curriculumLabel : null,
      closingText: richText(overview.closingText, fallback.overview.closingText ?? '<p></p>'),
    },
    sections: sections.length
      ? sections.map((section, index) => {
          const source = isObject(section) ? section : {};
          const fallbackSection = fallback.sections[index] ?? fallback.sections[0];
          return {
            title: text(source.title, fallbackSection.title),
            text: richText(source.text, fallbackSection.text),
            image: text(source.image, fallbackSection.image),
            imageAlt: text(source.imageAlt, fallbackSection.imageAlt),
            imagePosition:
              source.imagePosition === 'left' || source.imagePosition === 'right'
                ? source.imagePosition
                : fallbackSection.imagePosition,
          };
        })
      : fallback.sections,
  };
}
