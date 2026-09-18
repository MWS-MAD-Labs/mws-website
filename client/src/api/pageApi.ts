import { apiRequest } from "@/lib/api";

export type HeroSlideData = {
  id: string;
  image: string;
  alt: string;
  headline?: string;
  caption?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export type AdmissionProgramData = {
  id: string;
  title: string;
  age: string;
  description: string;
  image: string;
  path: string;
  adminWhatsapp: string;
  contactLabel?: string;
  exploreLabel?: string;
};

export type InfoCardData = {
  category: string;
  image: string;
  alt: string;
  title: string;
  tag: string;
  text: string;
  path: string;
  action: string;
};

export type SpotlightSlideData = {
  image: string;
  alt: string;
  quote: string;
  cite: string;
};

export type CommunityVoiceData = {
  id: string;
  role: string;
  name: string;
  grade: string | null;
  image: string;
  quote: string;
};

export type HomePageData = {
  heroSlides: HeroSlideData[];
  background: { body: string };
  infoCards: InfoCardData[];
  programs: AdmissionProgramData[];
  communityVoices: CommunityVoiceData[];
  affiliations: {
    title: string;
    text: string;
    logos: string[];
    logosLabel?: string;
  };
  spotlightSlides: SpotlightSlideData[];
};

export type AdmissionsPageData = {
  programs: AdmissionProgramData[];
};

export type OurSchoolPageData = {
  hero: { title: string; image: string; imageAlt: string };
  background: {
    title: string;
    image: string;
    imageAlt: string;
    paragraphs: string[];
  };
  visionMission: {
    title: string;
    image: string;
    imageAlt: string;
    paragraphs: string[];
  };
  philosophy: {
    title: string;
    paragraphs: string[];
  };
  faq: Array<{ question: string; answer: string }>;
};

export type CommunityGalleryImageData = {
  id: string;
  src: string;
  alt: string;
  size: "large" | "tall" | "normal";
};

export type CommunityNewsData = {
  id: string;
  title: string;
  image: string;
  path: string;
};

export type CommunityStoriesPageData = {
  hero: { title: string; image: string; imageAlt: string };
  introTitle: string;
  introBody: string[];
  galleryImages: CommunityGalleryImageData[];
  news: CommunityNewsData[];
};

async function getPage<T>(slug: string): Promise<T> {
  const response = await apiRequest<{ data: T }>(`/api/pages/${slug}`);
  return response!.data;
}

export const pageApi = {
  home: () => getPage<HomePageData>("home"),
  admissions: () => getPage<AdmissionsPageData>("admissions"),
  ourSchool: () => getPage<OurSchoolPageData>("our-school"),
  communityStories: () =>
    getPage<CommunityStoriesPageData>("community-stories"),
};
