export type HeroSlideMediaType = "IMAGE" | "VIDEO";

export type HeroSlideSourceType =
  | "MANUAL"
  | "PROGRAM"
  | "ADMISSION"
  | "CAMPUS_TOUR"
  | "CURRICULUM"
  | "AFFILIATION"
  | "ACADEMIC"
  | "KINDERGARTEN"
  | "ELEMENTARY"
  | "JUNIOR_HIGH"
  | "OUR_SCHOOL"
  | "CONTACT";

export type ResolvedHeroSlide = {
  id: string;
  sourceType: HeroSlideSourceType;
  sourceId: string | null;
  title: string | null;
  description: string | null;
  caption: string | null;
  mediaType: HeroSlideMediaType | null;
  mediaPath: string | null;
  mediaAlt: string | null;
  posterPath: string | null;
  isLooping: boolean;
  ctaLabel: string | null;
  ctaUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};
