import type { GalleryImage, HeroSlide } from "@prisma/client";
import { HeroSlideRepository } from "../repositories/hero-slide-repository";
import {
  PageDataRepository,
  type CommunityStoriesPageRecord,
  type NewsPostWithGallery,
  type OurSchoolPageRecord,
  type ProgramWithAdmissions,
} from "../repositories/page-data-repository";

const asset = (fileName: string) => `/assets-mws/${fileName}`;

const defaultHeroSlides = [
  {
    id: "default-hero-1",
    image: asset("_DSC4760.jpg"),
    alt: "Children collaborating on a classroom activity",
    headline: "Learning starts with curiosity.",
    caption: "At Millennia World School, students learn to explore, question, and create.",
  },
  {
    id: "default-hero-2",
    image: asset("Elementary.jpg"),
    alt: "Students walking through a sunlit campus courtyard",
    headline: "A place to grow together.",
    caption: "A learning environment designed to encourage curiosity, confidence, and connection.",
  },
  {
    id: "default-hero-3",
    image: asset("DSC04079.jpg"),
    alt: "View of the school's campus architecture",
    headline: "More than a classroom.",
    caption: "Discover an environment where learning extends beyond the walls of the classroom.",
  },
];

const defaultPrograms = [
  {
    id: "kindergarten",
    title: "Kindergarten",
    age: "Age 2-6",
    description:
      "A nurturing first step into learning, where children build curiosity, confidence, communication, and positive relationships through meaningful experiences.",
    image: asset("DSC04079.jpg"),
    path: "/academic/kindergarten",
    adminWhatsapp: "6281234567890",
  },
  {
    id: "elementary",
    title: "Elementary",
    age: "Age 6-12",
    description:
      "A stage for building strong academic foundations while developing independence, creativity, collaboration, and a deeper understanding of the world.",
    image: asset("DSC04079.jpg"),
    path: "/academic/elementary",
    adminWhatsapp: "6281234567891",
  },
  {
    id: "junior-high",
    title: "Junior High",
    age: "Age 12-15",
    description:
      "Students develop greater independence, strengthen critical thinking, and prepare for the opportunities and challenges of the next stage of their education.",
    image: asset("DSC04079.jpg"),
    path: "/academic/junior-high",
    adminWhatsapp: "6281234567892",
  },
];

const defaultInfoCards = [
  {
    category: "admissions",
    image: asset("_DSC4760.jpg"),
    alt: "MWS Admissions",
    title: "How to Apply",
    tag: "Enrollment",
    text: "Learn the steps for joining Millennia World School.",
    path: "/admission",
    action: "Start Application",
  },
  {
    category: "campuses",
    image: asset("Elementary.jpg"),
    alt: "MWS Campus",
    title: "Sunlit Classrooms",
    tag: "Campus Tour",
    text: "Discover spaces designed for inquiry and connection.",
    path: "/admission",
    action: "Book a Tour",
  },
  {
    category: "academic",
    image: asset("DSC04079.jpg"),
    alt: "MWS Academic",
    title: "Inquiry Learning",
    tag: "Curriculum",
    text: "Explore learning experiences across every stage.",
    path: "/academic",
    action: "Explore Programs",
  },
  {
    category: "news",
    image: asset("_DSC4760.jpg"),
    alt: "MWS News",
    title: "STEAM Exhibition",
    tag: "News",
    text: "Read stories from our school community.",
    path: "/news",
    action: "Read Story",
  },
];

const defaultSpotlightSlides = [
  {
    image: asset("_DSC4760.jpg"),
    alt: "Campus Life at MWS",
    quote:
      "Learning at MWS grows through meaningful experiences, relationships, and curiosity.",
    cite: "Campus Life at Millennia World School",
  },
  {
    image: asset("Elementary.jpg"),
    alt: "Inquiry and culture at MWS",
    quote: "Students are encouraged to ask better questions and grow together.",
    cite: "Student Life & Culture",
  },
];

const defaultPartnerLogos = [
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/CharterForCompassion.jpg",
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/ClimateChangeSchool.jpg",
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/ClimateActionProject.jpg",
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/CommonSenseEducation.jpg",
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/ResponsiveClassroom.jpg",
];

const defaultCommunityVoices = [
  {
    id: "default-voice-1",
    role: "Student",
    name: "Kianna A.",
    grade: "Grade 7 Student",
    image: asset("_DSC4760.jpg"),
    quote:
      "MWS gave me the confidence to speak up in front of people and explore my love for science projects.",
  },
  {
    id: "default-voice-2",
    role: "Parent",
    name: "Sarah & David M.",
    grade: "Parents of Grade 2 & 5",
    image: asset("Elementary.jpg"),
    quote:
      "Finding a school that values character as much as academics was essential for us.",
  },
];

const defaultOurSchoolContent = {
  hero: {
    title: "Our School",
    image: asset("DSC04079.jpg"),
    imageAlt: "Millennia World School Campus",
  },
  background: {
    title: "MWS Background",
    image: asset("DSC04079.jpg"),
    imageAlt: "Millennia World School campus",
    paragraphs: [
      "In the 21st century, every educational system faces the challenge of preparing young generations for a life of the future that is not only complex, but constantly changing as well.",
      "We aim to develop and inspire lifelong learners and enable them to fully develop their talents, dispositions and capabilities.",
    ],
  },
  visionMission: {
    title: "Our Vision & Mission",
    image: asset("DSC04079.jpg"),
    imageAlt: "Students learning at Millennia World School",
    paragraphs: [
      "Discover and foster individual and group potential to achieve fulfilling lives.",
      "A globalized society based on compassion where every individual connects to others using their maximum potential.",
    ],
  },
  philosophy: {
    title: "Our Philosophy",
    paragraphs: [
      "Our Philosophy is based on profound understanding of human development that addresses the needs of growing children and aims at developing their love of learning.",
      "Through meaningful learning experiences children develop intellectual, emotional, and physical capabilities.",
    ],
  },
  faq: [
    {
      question: "What learning programs does MWS offer?",
      answer:
        "Millennia World School offers learning programs designed to support students across different stages of their educational journey.",
    },
    {
      question: "How does MWS approach student learning?",
      answer:
        "Our approach focuses on developing students academically while supporting personal, social, and practical development.",
    },
  ],
};

const defaultCommunityStoriesContent = {
  hero: {
    title: "Community Stories",
    image: asset("Elementary.jpg"),
    imageAlt: "MWS School Community Stories",
  },
  introTitle: "The moments that make\nour community.",
  introBody: [
    "From everyday learning to special moments across the school, these are some of the experiences that bring the MWS community together.",
    "Explore moments from life at MWS through our community gallery.",
  ],
};

const defaultGalleryImages = Array.from({ length: 8 }, (_, index) => ({
  id: `default-gallery-${index + 1}`,
  src: asset(index % 2 === 0 ? "Elementary.jpg" : "DSC04079.jpg"),
  alt: "MWS school community",
  size: index === 0 || index === 7 ? "large" : index === 5 ? "tall" : "normal",
}));

function imagePath(path: string | null | undefined, fallback: string) {
  return path || fallback;
}

function galleryImageUrl(image: Pick<GalleryImage, "id" | "path">) {
  if (image.path.startsWith("/") || image.path.startsWith("http")) return image.path;
  return `/api/gallery-images/${image.id}/file`;
}

function firstGalleryImage(
  gallery: ProgramWithAdmissions["gallery"] | NewsPostWithGallery["gallery"] | null,
) {
  return gallery?.images[0] ? galleryImageUrl(gallery.images[0]) : null;
}

function heroSlideResponse(slide: HeroSlide) {
  return {
    id: slide.id,
    image: imagePath(slide.mediaPath, asset("_DSC4760.jpg")),
    alt: slide.mediaAlt || slide.title || "MWS hero image",
    headline: slide.title || undefined,
    caption: slide.caption || slide.description || undefined,
    ctaLabel: slide.ctaLabel || undefined,
    ctaHref: slide.ctaUrl || undefined,
  };
}

function programResponse(program: ProgramWithAdmissions) {
  const admission = program.admissions[0] ?? null;
  const galleryImage = firstGalleryImage(admission?.gallery ?? program.gallery);

  return {
    id: program.id,
    title: program.title,
    age: program.ageRange || "",
    description: admission?.description || program.description || "",
    image: imagePath(program.imagePath || galleryImage, asset("DSC04079.jpg")),
    path: program.path || "/academic",
    adminWhatsapp: admission?.adminWhatsapp || "",
    contactLabel: admission?.contactLabel || "Contact",
    exploreLabel: admission?.exploreLabel || "Explore",
  };
}

function newsResponse(news: NewsPostWithGallery) {
  const galleryImage = firstGalleryImage(news.gallery);
  return {
    id: news.id,
    title: news.title,
    excerpt: news.excerpt,
    image: imagePath(news.imagePath || galleryImage, asset("DSC04079.jpg")),
    path: `/news/${news.slug}`,
    publishedAt: news.publishedAt,
  };
}

function galleryImagesFromPage(page: CommunityStoriesPageRecord | null) {
  const images = page?.gallery?.images ?? [];
  if (!images.length) return defaultGalleryImages;

  return images.map((image, index) => ({
    id: image.id,
    src: galleryImageUrl(image),
    alt: image.title || image.caption || "MWS school community",
    size: index === 0 || index === 7 ? "large" : index === 5 ? "tall" : "normal",
  }));
}

function asStringArray(value: unknown, fallback: string[]) {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : fallback;
}

function ourSchoolContent(record: OurSchoolPageRecord | null) {
  const content =
    record?.content && typeof record.content === "object"
      ? (record.content as Partial<typeof defaultOurSchoolContent>)
      : {};

  return {
    ...defaultOurSchoolContent,
    ...content,
    hero: {
      ...defaultOurSchoolContent.hero,
      ...(content.hero ?? {}),
      title: record?.title || content.hero?.title || defaultOurSchoolContent.hero.title,
      image:
        record?.featuredImage
          ? galleryImageUrl(record.featuredImage)
          : content.hero?.image || defaultOurSchoolContent.hero.image,
    },
  };
}

export class PageDataService {
  static async getHeroSlides() {
    const slides = await HeroSlideRepository.listActive();
    return slides.length ? slides.map(heroSlideResponse) : defaultHeroSlides;
  }

  static async getHome() {
    const [heroSlides, programs, voices] = await Promise.all([
      this.getHeroSlides(),
      PageDataRepository.listActivePrograms(),
      PageDataRepository.listCommunityVoices(),
    ]);

    return {
      heroSlides,
      background: {
        body:
          "In the 21st century, every educational system faces the challenge of preparing young generations for a life that is not only complex, but constantly changing as well. Millennia World School (MWS) offers a developmentally appropriate experiential approach towards education.",
      },
      infoCards: defaultInfoCards,
      programs: programs.length ? programs.map(programResponse) : defaultPrograms,
      communityVoices: voices.length
        ? voices.map((voice) => ({
            id: voice.id,
            role: voice.role,
            name: voice.name,
            grade: voice.grade,
            image: voice.imagePath,
            quote: voice.quote,
          }))
        : defaultCommunityVoices,
      affiliations: {
        title: "Global partners in learning.",
        text:
          "MWS connects learning with wider communities and partners who support student growth.",
        logos: defaultPartnerLogos,
        logosLabel: "In partnership with",
      },
      spotlightSlides: defaultSpotlightSlides,
    };
  }

  static async getAdmissions() {
    const programs = await PageDataRepository.listActivePrograms();
    return {
      programs: programs.length ? programs.map(programResponse) : defaultPrograms,
    };
  }

  static async getOurSchool() {
    const record = await PageDataRepository.getLatestOurSchool();
    return ourSchoolContent(record);
  }

  static async getCommunityStories() {
    const [page, news] = await Promise.all([
      PageDataRepository.getCommunityStoriesPage(),
      PageDataRepository.listPublishedNews(4),
    ]);

    return {
      hero: {
        ...defaultCommunityStoriesContent.hero,
        title: page?.title || defaultCommunityStoriesContent.hero.title,
        image: page?.heroImagePath || defaultCommunityStoriesContent.hero.image,
        imageAlt: page?.heroImageAlt || defaultCommunityStoriesContent.hero.imageAlt,
      },
      introTitle: page?.introTitle || defaultCommunityStoriesContent.introTitle,
      introBody: asStringArray(page?.introBody, defaultCommunityStoriesContent.introBody),
      galleryImages: galleryImagesFromPage(page),
      news: news.length
        ? news.map(newsResponse)
        : [
            {
              id: "default-news-1",
              title: "Learning through meaningful experiences",
              image: asset("Elementary.jpg"),
              path: "/news/learning-through-meaningful-experiences",
            },
            {
              id: "default-news-2",
              title: "Moments from our school community",
              image: asset("DSC04079.jpg"),
              path: "/news/moments-from-our-school-community",
            },
          ],
    };
  }
}
