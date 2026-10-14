import type { ResolvedHeroSlide } from '@/features/hero/heroData';

export type HeroSlideStatus = {
  helperText: string;
  label: 'Hidden' | 'Needs media' | 'Needs copy' | 'Ready';
  tone: 'neutral' | 'warning' | 'success';
};

export function getHeroSlideStatus(
  slide: Pick<ResolvedHeroSlide, 'caption' | 'isActive' | 'mediaPath' | 'title'>,
): HeroSlideStatus {
  if (!slide.mediaPath) {
    return {
      helperText: slide.isActive
        ? 'Active, but hidden from the website until media is selected'
        : 'Hidden and missing hero media',
      label: 'Needs media',
      tone: 'warning',
    };
  }

  if (!slide.title && !slide.caption) {
    return {
      helperText: slide.isActive
        ? 'Visible with media, but missing headline or caption'
        : 'Hidden and missing headline or caption',
      label: 'Needs copy',
      tone: 'warning',
    };
  }

  if (!slide.isActive) {
    return {
      helperText: 'Hidden from website',
      label: 'Hidden',
      tone: 'neutral',
    };
  }

  return {
    helperText: 'Visible on website',
    label: 'Ready',
    tone: 'success',
  };
}

export function getHeroSlideStatusClasses(status: HeroSlideStatus) {
  if (status.tone === 'success') return 'bg-[#10B981]/10 text-[#047857]';
  if (status.tone === 'warning') return 'bg-[#F59E0B]/10 text-[#D97706]';
  return 'bg-[#F1F5F9] text-[#64748B]';
}
