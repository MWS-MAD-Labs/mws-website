import type { OurSchoolPageData } from '@/api/pageApi';
import type { OurSchoolItem } from '@/admin/api/adminApi';
import { asset } from '@/data/site';

export const defaultOurSchoolContent: OurSchoolPageData = {
  hero: {
    title: 'Our School',
    image: asset('DSC04079.jpg'),
    imageAlt: 'Millennia World School Campus',
  },
  background: {
    title: 'MWS Background',
    image: asset('DSC04079.jpg'),
    imageAlt: 'Millennia World School campus',
    paragraphs: [
      'In the 21st century, every educational system faces the challenge of preparing young generations for a life of the future that is not only complex, but constantly changing as well.',
      'We aim to develop and inspire lifelong learners and enable them to fully develop their talents, dispositions and capabilities.',
    ],
  },
  visionMission: {
    title: 'Our Vision & Mission',
    image: asset('DSC04079.jpg'),
    imageAlt: 'Students learning at Millennia World School',
    paragraphs: [
      'Discover and foster individual and group potential to achieve fulfilling lives.',
      'A globalized society based on compassion where every individual connects to others using their maximum potential.',
    ],
  },
  philosophy: {
    title: 'Our Philosophy',
    paragraphs: [
      'Our Philosophy is based on profound understanding of human development that addresses the needs of growing children and aims at developing their love of learning.',
      'Through meaningful learning experiences children develop intellectual, emotional, and physical capabilities.',
    ],
  },
  faq: [
    {
      question: 'What learning programs does MWS offer?',
      answer:
        'Millennia World School offers learning programs designed to support students across different stages of their educational journey.',
    },
    {
      question: 'How does MWS approach student learning?',
      answer:
        'Our approach focuses on developing students academically while supporting personal, social, and practical development.',
    },
  ],
};

export type OurSchoolStatus = 'DRAFT' | 'PUBLISHED';

export type EditableOurSchoolContent = OurSchoolPageData & {
  status?: OurSchoolStatus;
};

export type OurSchoolImageField = 'hero' | 'background' | 'visionMission';

export function normalizeOurSchoolContent(item: OurSchoolItem | null): EditableOurSchoolContent {
  const content = item?.content ?? null;
  const source = content && typeof content === 'object' ? (content as EditableOurSchoolContent) : null;

  return {
    ...defaultOurSchoolContent,
    ...(source ?? {}),
    hero: {
      ...defaultOurSchoolContent.hero,
      ...(source?.hero ?? {}),
      title: source?.hero?.title || item?.title || defaultOurSchoolContent.hero.title,
    },
    background: {
      ...defaultOurSchoolContent.background,
      ...(source?.background ?? {}),
      paragraphs: source?.background?.paragraphs?.length
        ? source.background.paragraphs
        : defaultOurSchoolContent.background.paragraphs,
    },
    visionMission: {
      ...defaultOurSchoolContent.visionMission,
      ...(source?.visionMission ?? {}),
      paragraphs: source?.visionMission?.paragraphs?.length
        ? source.visionMission.paragraphs
        : defaultOurSchoolContent.visionMission.paragraphs,
    },
    philosophy: {
      ...defaultOurSchoolContent.philosophy,
      ...(source?.philosophy ?? {}),
      paragraphs: source?.philosophy?.paragraphs?.length
        ? source.philosophy.paragraphs
        : defaultOurSchoolContent.philosophy.paragraphs,
    },
    faq: source?.faq?.length ? source.faq : defaultOurSchoolContent.faq,
    status: source?.status ?? 'PUBLISHED',
  };
}
