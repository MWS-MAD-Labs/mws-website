import { apiRequest, normalizePublicAssetUrls } from "@/lib/api";

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

export type AcademicStatus = "DRAFT" | "PUBLISHED";
export type AcademicRichText = string | string[];

export type AcademicLevelData = {
  levelKey: "kindergarten" | "elementary" | "high-school";
  status?: AcademicStatus;
  draftSavedAt?: string | null;
  publishedAt?: string | null;
  program: {
    title: string;
    age: string | null;
    description: string | null;
    image: string | null;
    imageAlt: string | null;
    path: string | null;
    sortOrder: number;
    isActive: boolean;
  };
  page: {
    isPublished: boolean;
    galleryId: string | null;
    hero: {
      title: string;
      description: string;
      image: string;
      imageAlt: string;
    };
    overview: {
      introTitle: string;
      intro: AcademicRichText;
      introImage: string;
      introImageAlt: string;
      curriculumTitle: string;
      curriculumDescription: AcademicRichText;
      curriculumFile?: string | null;
      curriculumLabel?: string | null;
      closingText?: string | null;
    };
    sections: Array<{
      title: string;
      text: string;
      image: string;
      imageAlt: string;
      imagePosition?: "left" | "right";
    }>;
    faq?: Array<{ question: string; answer: string }>;
  };
};

async function getPage<T>(slug: string): Promise<T> {
  const response = await apiRequest<{ data: T }>(`/api/pages/${slug}`);
  return normalizePublicAssetUrls(response!.data);
}

export const pageApi = {
  home: () => getPage<HomePageData>("home"),
  admissions: () => getPage<AdmissionsPageData>("admissions"),
  ourSchool: () => getPage<OurSchoolPageData>("our-school"),
  communityStories: () =>
    getPage<CommunityStoriesPageData>("community-stories"),
  academicLevels: () => getPage<AcademicLevelData[]>("academic"),
  academicLevel: (
    levelKey: AcademicLevelData["levelKey"],
    options: { previewDraft?: boolean } = {},
  ) =>
    getPage<AcademicLevelData>(
      `academic/${levelKey}${options.previewDraft ? "?preview=draft" : ""}`,
    ),
};
