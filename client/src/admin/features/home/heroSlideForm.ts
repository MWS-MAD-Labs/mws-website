import type { HeroSlideFormData } from '@/admin/api/adminApi';
import type {
  HeroSlideMediaType,
  HeroSlideSourceType,
  ResolvedHeroSlide,
} from '@/features/hero/heroData';

export const HERO_SLIDES_PATH = '/admin/content/home';
export const HERO_SLIDE_NEW_PATH = `${HERO_SLIDES_PATH}/new`;
export const HOME_INFO_SECTION_PATH = `${HERO_SLIDES_PATH}/info-section`;

export function getHeroSlideEditPath(slideId: string) {
  return `${HERO_SLIDES_PATH}/${slideId}/edit`;
}

/** Router state used to show a message on the slides list after a save. */
export type HeroSlidesReturnState = { message?: string } | null;

/**
 * Only headline, caption, media, button, and visibility are editable in the admin.
 * The remaining fields are kept so saving an existing slide never resets them.
 */
export type HeroSlideForm = {
  caption: string;
  ctaLabel: string;
  ctaUrl: string;
  description: string;
  isActive: boolean;
  isLooping: boolean;
  mediaAlt: string;
  mediaPath: string;
  mediaType: HeroSlideMediaType;
  posterPath: string;
  sortOrder: number;
  sourceType: HeroSlideSourceType;
  title: string;
};

export function createEmptyHeroSlideForm(sortOrder = 0): HeroSlideForm {
  return {
    caption: '',
    ctaLabel: '',
    ctaUrl: '',
    description: '',
    isActive: true,
    isLooping: true,
    mediaAlt: '',
    mediaPath: '',
    mediaType: 'IMAGE',
    posterPath: '',
    sortOrder,
    sourceType: 'MANUAL',
    title: '',
  };
}

export const HERO_CTA_LINK_OPTIONS = [
  { label: 'Default: Admission', value: '' },
  { label: 'Admission', value: '/admission' },
  { label: 'Book a Tour', value: '/book-a-tour' },
  { label: 'Academic', value: '/academic' },
  { label: 'About MWS', value: '/about-millennia' },
  { label: 'News', value: '/news' },
  { label: 'Community Stories', value: '/community-stories' },
  { label: 'Contact', value: '/contact' },
  { label: 'Admission FAQ', value: '/admission/faq' },
  { label: 'Admission Guidelines', value: '/admission/guidelines' },
];

export function getHeroCtaLinkLabel(ctaUrl: string | null | undefined) {
  const value = ctaUrl ?? '';
  return HERO_CTA_LINK_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function heroSlideFormFromSlide(slide: ResolvedHeroSlide): HeroSlideForm {
  return {
    caption: slide.caption ?? '',
    ctaLabel: slide.ctaLabel ?? '',
    ctaUrl: slide.ctaUrl ?? '',
    description: slide.description ?? '',
    isActive: slide.isActive,
    isLooping: slide.isLooping,
    mediaAlt: slide.mediaAlt ?? '',
    mediaPath: slide.mediaPath ?? '',
    mediaType: slide.mediaType ?? 'IMAGE',
    posterPath: slide.posterPath ?? '',
    sortOrder: slide.sortOrder,
    sourceType: slide.sourceType,
    title: slide.title ?? '',
  };
}

export function heroSlidePayloadFromForm(form: HeroSlideForm): HeroSlideFormData {
  return {
    caption: optionalText(form.caption),
    ctaLabel: optionalText(form.ctaLabel),
    ctaUrl: optionalText(form.ctaUrl),
    description: optionalText(form.description),
    isActive: form.isActive,
    isLooping: form.isLooping,
    mediaAlt: optionalText(form.mediaAlt),
    mediaPath: optionalText(form.mediaPath),
    mediaType: form.mediaType,
    posterPath: optionalText(form.posterPath),
    sortOrder: form.sortOrder,
    sourceType: form.sourceType,
    title: optionalText(form.title),
  };
}

/** New slides go after the last existing one. */
export function nextHeroSlideSortOrder(slides: Pick<ResolvedHeroSlide, 'sortOrder'>[]) {
  if (!slides.length) return 0;
  return Math.max(...slides.map((slide) => slide.sortOrder)) + 1;
}
