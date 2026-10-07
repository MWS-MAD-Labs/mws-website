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

const defaultAdmissionsContent = {
  heroTitle: "Start your journey at MWS",
  heroSubtitle:
    "A caring place where your child can grow academically, socially, and personally.",
  heroImage: asset("DSC04079.jpg"),
  heroImageAlt: "Students and families at Millennia World School",
  menuTitle: "Admission",
  readyTitle: "Are you ready to begin your journey?",
  introTitle: "Choosing a school is a family decision.",
  introBody: [
    "Millennia World School welcomes families who are looking for a caring environment where students can grow academically, socially, and personally.",
    "Our admissions team supports each family personally, from the first message to the first day of school.",
  ],
  introMedia: {
    type: "image",
    src: asset("DSC09500.jpg"),
    alt: "Learning spaces at Millennia World School",
  },
  processTitle: "Admission process",
  processIntro: "",
  steps: [
    {
      title: "Say hello",
      description: "Send a message or book a tour.",
      detail:
        "Contact admissions or book a school tour so our team can understand your family, preferred level, and timeline.",
      image: "",
      imageAlt: "",
    },
    {
      title: "Come and see",
      description: "Visit the campus and meet our team.",
      detail:
        "Meet the admissions team, explore the learning environment, and discuss the program that best fits your child.",
      image: "",
      imageAlt: "",
    },
    {
      title: "Share your documents",
      description: "Send what we need, we are here to help.",
      detail:
        "Share the required student and family documents for review by the school administration team.",
      image: "",
      imageAlt: "",
    },
    {
      title: "Welcome to MWS",
      description: "We guide you through the first days.",
      detail:
        "After review and confirmation, our team will guide you through final enrollment and onboarding details.",
      image: "",
      imageAlt: "",
    },
  ],
  infoTiles: [
    {
      title: "Frequently asked questions",
      description: "Quick answers to what families ask us most about joining MWS.",
      linkLabel: "Read the FAQ",
      linkUrl: "/admission/faq",
      image: asset("_DSC7101.jpg"),
    },
    {
      title: "Academic calendar",
      description: "See term dates, holidays, and key school events for the year.",
      linkLabel: "View the calendar",
      linkUrl: "/school-calendar",
      image: asset("Elementary.jpg"),
    },
    {
      title: "Admission guidelines",
      description: "Requirements, document checklist, and how placement works.",
      linkLabel: "Read the guidelines",
      linkUrl: "/admission/guidelines",
      image: asset("JH.jpg"),
    },
  ],
};

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

const defaultAdmissionGuidelinesContent = {
  title: "Admission Guidelines",
  hero: {
    title: "Admission Guidelines",
    description:
      "Review the requirements, documents, and next steps for joining Millennia World School.",
  },
  body:
    "<p>Our admissions team will guide your family through every step, from initial consultation to enrollment confirmation.</p>",
  checklist: [
    "Contact the admissions team or book a school tour.",
    "Prepare the student and family documents requested by the school.",
    "Complete the placement and review process with our team.",
  ],
  documents: [
    "Student birth certificate or family card",
    "Previous school report, if available",
    "Parent or guardian contact information",
  ],
  cta: {
    label: "Message admissions",
    href: "/admission",
  },
};

const defaultPartnerLogos = [
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/CharterForCompassion.jpg",
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/ClimateChangeSchool.jpg",
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/ClimateActionProject.jpg",
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/CommonSenseEducation.jpg",
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/ResponsiveClassroom.jpg",
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
  activityTitle: "School activities and everyday moments.",
  activityDescription:
    "Browse selected photos from learning, events, and life across the MWS community.",
};

const defaultAcademicOverview = {
  title: "Academic",
  description:
    "A connected learning journey that helps students build strong foundations, explore their interests, and grow into confident independent learners.",
  coverImage: asset("DSC09500.jpg"),
  content: {
    intro: {
      title: "Learning should grow with the learner.",
      body:
        "<p>At Millennia World School, students build strong academic foundations while gradually developing the confidence and independence to take ownership of their learning.</p>",
      image: asset("_DSC7101.jpg"),
      imageAlt: "MWS students learning together",
    },
    experience: {
      title: "From guided learning to greater independence.",
      body:
        "<p>Our classrooms give students opportunities to learn through direct instruction, inquiry, discussion, projects, and collaboration. Teachers guide students closely while gradually giving them more responsibility for their ideas, decisions, and progress.</p><p>This balance allows students to develop strong academic foundations while also becoming thoughtful, curious, and responsible learners.</p>",
      image: asset("_DSC7101.jpg"),
      imageAlt: "MWS students learning together",
    },
    approach: [
      {
        title: "Learning through inquiry",
        body:
          "Students ask questions, explore ideas, collaborate with others, and connect what they learn with experiences beyond the classroom.",
      },
      {
        title: "Guided at first, independent over time",
        body:
          "Teachers guide students closely, then gradually hand over more responsibility for their ideas, decisions, and progress.",
      },
      {
        title: "Many ways to learn",
        body:
          "Direct instruction, discussion, projects, and teamwork all have a place in the classroom, so every student has room to grow.",
      },
    ],
  },
  galleryId: null as string | null,
};

function imagePath(path: string | null | undefined, fallback: string) {
  return path || fallback;
}

function isPublicAssetPath(path: string) {
  return path.startsWith("/") || path.startsWith("http");
}

function galleryImageUrl(image: Pick<GalleryImage, "id" | "path">) {
  if (isPublicAssetPath(image.path)) return image.path;
  return `/api/gallery-images/${image.id}/file`;
}

function firstGalleryImage(gallery: ProgramWithAdmissions["gallery"] | null) {
  return gallery?.images[0] ? galleryImageUrl(gallery.images[0]) : null;
}

function heroSlideResponse(slide: HeroSlide) {
  if (!slide.mediaPath) return null;

  const isVideo = slide.mediaType === "VIDEO";
  const posterPath = isVideo ? slide.posterPath || null : null;

  return {
    id: slide.id,
    image: isVideo ? posterPath || "" : slide.mediaPath,
    ...(isVideo ? { video: slide.mediaPath } : {}),
    ...(posterPath ? { poster: posterPath } : {}),
    mediaType: slide.mediaType || "IMAGE",
    isLooping: slide.isLooping,
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
  return {
    id: news.id,
    title: news.title,
    excerpt: news.excerpt,
    image: imagePath(news.coverImage, asset("DSC04079.jpg")),
    path: `/news/${news.slug}`,
    publishedAt: news.publishedAt,
  };
}

function infoCardFromNews(news: NewsPostWithGallery) {
  const category = news.category;

  return {
    category: category?.slug ?? "news",
    image: imagePath(news.coverImage, asset("DSC04079.jpg")),
    alt: news.coverImageAlt || news.title,
    title: news.title,
    tag: category?.name ?? "News",
    text: news.excerpt || "Read the latest story from Millennia World School.",
    path: `/news/${news.slug}`,
    action: "Read Story",
  };
}

function galleryImagesFromPage(page: CommunityStoriesPageRecord | null) {
  const images = page?.gallery?.images ?? [];
  if (!images.length) return [];

  return images.map((image, index) => ({
    id: image.id,
    src: galleryImageUrl(image),
    alt: image.title || image.caption || "MWS school community",
    caption: image.caption || image.title || null,
    size:
      index === 0 || index === 7 ? "large" : index === 5 ? "tall" : "normal",
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
      title:
        record?.title ||
        content.hero?.title ||
        defaultOurSchoolContent.hero.title,
      image: record?.featuredImage
        ? galleryImageUrl(record.featuredImage)
        : content.hero?.image || defaultOurSchoolContent.hero.image,
    },
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function admissionIntroMedia(value: unknown) {
  const media = asRecord(value);
  const fallback = defaultAdmissionsContent.introMedia;

  return {
    type: media.type === "video" ? "video" : "image",
    src: asString(media.src, fallback.src),
    ...(typeof media.poster === "string" && media.poster.trim()
      ? { poster: media.poster }
      : {}),
    alt: asString(media.alt, fallback.alt),
  };
}

function admissionSteps(value: unknown) {
  const items =
    Array.isArray(value) && value.length ? value : defaultAdmissionsContent.steps;

  return items.map((item, index) => {
    const step = asRecord(item);
    const fallback =
      defaultAdmissionsContent.steps[index] ?? defaultAdmissionsContent.steps[0]!;

    return {
      title: asString(step.title, fallback.title),
      description: asString(step.description, fallback.description),
      detail: asString(step.detail, fallback.detail ?? fallback.description),
      image: typeof step.image === "string" ? step.image : fallback.image,
      imageAlt: typeof step.imageAlt === "string" ? step.imageAlt : fallback.imageAlt,
    };
  });
}

function admissionInfoTiles(value: unknown) {
  const items =
    Array.isArray(value) && value.length
      ? value
      : defaultAdmissionsContent.infoTiles;

  return items.map((item, index) => {
    const tile = asRecord(item);
    const fallback =
      defaultAdmissionsContent.infoTiles[index] ??
      defaultAdmissionsContent.infoTiles[0]!;

    return {
      title: asString(tile.title, fallback.title),
      description: asString(tile.description, fallback.description),
      linkLabel: asString(tile.linkLabel, fallback.linkLabel),
      linkUrl: asString(tile.linkUrl, fallback.linkUrl),
      image: typeof tile.image === "string" ? tile.image : fallback.image,
    };
  });
}

function admissionsContent(value: unknown) {
  const content = asRecord(value);

  return {
    ...defaultAdmissionsContent,
    heroTitle: asString(content.heroTitle, defaultAdmissionsContent.heroTitle),
    heroSubtitle: asString(content.heroSubtitle, defaultAdmissionsContent.heroSubtitle),
    heroImage: asString(content.heroImage, defaultAdmissionsContent.heroImage),
    heroImageAlt: asString(content.heroImageAlt, defaultAdmissionsContent.heroImageAlt),
    menuTitle: asString(content.menuTitle, defaultAdmissionsContent.menuTitle),
    readyTitle: asString(content.readyTitle, defaultAdmissionsContent.readyTitle),
    introTitle: asString(content.introTitle, defaultAdmissionsContent.introTitle),
    introBody: asStringArray(content.introBody, defaultAdmissionsContent.introBody),
    introMedia: admissionIntroMedia(content.introMedia),
    processTitle: asString(content.processTitle, defaultAdmissionsContent.processTitle),
    processIntro: asString(content.processIntro, defaultAdmissionsContent.processIntro),
    steps: admissionSteps(content.steps),
    infoTiles: admissionInfoTiles(content.infoTiles),
  };
}

function admissionGuidelinesContent(value: unknown) {
  const content = asRecord(value);
  const hero = asRecord(content.hero);
  const cta = asRecord(content.cta);

  return {
    ...defaultAdmissionGuidelinesContent,
    title: asString(content.title, defaultAdmissionGuidelinesContent.title),
    hero: {
      ...defaultAdmissionGuidelinesContent.hero,
      title: asString(hero.title, defaultAdmissionGuidelinesContent.hero.title),
      description: asString(
        hero.description,
        defaultAdmissionGuidelinesContent.hero.description,
      ),
    },
    body: asString(content.body, defaultAdmissionGuidelinesContent.body),
    checklist: asStringArray(
      content.checklist,
      defaultAdmissionGuidelinesContent.checklist,
    ),
    documents: asStringArray(
      content.documents,
      defaultAdmissionGuidelinesContent.documents,
    ),
    cta: {
      ...defaultAdmissionGuidelinesContent.cta,
      label: asString(cta.label, defaultAdmissionGuidelinesContent.cta.label),
      href: asString(cta.href, defaultAdmissionGuidelinesContent.cta.href),
    },
  };
}

function academicOverviewContent(value: unknown) {
  const content = asRecord(value);
  const intro = asRecord(content.intro);
  const experience = asRecord(content.experience);
  const approach = Array.isArray(content.approach) && content.approach.length
    ? content.approach.map(asRecord)
    : defaultAcademicOverview.content.approach;

  return {
    intro: {
      ...defaultAcademicOverview.content.intro,
      title: asString(intro.title, defaultAcademicOverview.content.intro.title),
      body: asString(intro.body, defaultAcademicOverview.content.intro.body),
      image: asString(intro.image, defaultAcademicOverview.content.intro.image),
      imageAlt: asString(intro.imageAlt, defaultAcademicOverview.content.intro.imageAlt),
    },
    experience: {
      ...defaultAcademicOverview.content.experience,
      title: asString(experience.title, defaultAcademicOverview.content.experience.title),
      body: asString(experience.body, defaultAcademicOverview.content.experience.body),
      image: asString(experience.image, defaultAcademicOverview.content.experience.image),
      imageAlt: asString(
        experience.imageAlt,
        defaultAcademicOverview.content.experience.imageAlt,
      ),
    },
    approach: approach.map((item, index) => {
      const fallback =
        defaultAcademicOverview.content.approach[index] ??
        defaultAcademicOverview.content.approach[0]!;

      return {
        title: asString(item.title, fallback.title),
        body: asString(item.body, fallback.body),
      };
    }),
  };
}

export class PageDataService {
  static async getAcademicOverview() {
    const record = await PageDataRepository.getLatestAcademicOverview();

    return {
      title: record?.title || defaultAcademicOverview.title,
      description: record?.description || defaultAcademicOverview.description,
      coverImage: imagePath(record?.coverImage, defaultAcademicOverview.coverImage),
      content: academicOverviewContent(record?.content),
      galleryId: record?.galleryId ?? defaultAcademicOverview.galleryId,
    };
  }

  static async getHeroSlides() {
    const slides = await HeroSlideRepository.listActive();
    return slides
      .map(heroSlideResponse)
      .filter((slide): slide is NonNullable<typeof slide> => slide !== null);
  }

  static async getHome() {
    const [heroSlides, programs, voices, settings, spotlights] = await Promise.all([
      this.getHeroSlides(),
      PageDataRepository.listActivePrograms(),
      PageDataRepository.listCommunityVoices(),
      PageDataRepository.getHomePageSettings(),
      PageDataRepository.listActiveCampusSpotlights(),
    ]);
    const selectedCategories = settings?.infoSectionCategories.length
      ? settings.infoSectionCategories.map((item) => item.category)
      : settings?.infoSectionCategory
        ? [settings.infoSectionCategory]
        : [];
    const categoryNewsGroups = selectedCategories.length
      ? await Promise.all(
          selectedCategories.map((category) =>
            PageDataRepository.listPublishedNewsByCategory(category.id, 5),
          ),
        )
      : [];
    const categoryNews = categoryNewsGroups.flat();

    return {
      heroSlides,
      background: {
        body: "In the 21st century, every educational system faces the challenge of preparing young generations for a life that is not only complex, but constantly changing as well. Millennia World School (MWS) offers a developmentally appropriate experiential approach towards education.",
      },
      infoTitle:
        settings?.infoSectionTitle || "Everything you need to know about joining MWS.",
      infoFilters: selectedCategories.length
        ? selectedCategories.map((category) => ({
            label: category.name,
            value: category.slug,
          }))
        : [
            { label: "Admissions", value: "admissions" },
            { label: "Campuses", value: "campuses" },
            { label: "Academic", value: "academic" },
            { label: "News", value: "news" },
          ],
      infoCards: categoryNews.length
        ? categoryNews.map(infoCardFromNews)
        : defaultInfoCards,
      programs: programs.length
        ? programs.map(programResponse)
        : defaultPrograms,
      communityVoices: voices.map((voice) => ({
        id: voice.id,
        role: voice.role,
        name: voice.name,
        grade: voice.grade,
        image: voice.imagePath,
        quote: voice.quote,
      })),
      affiliations: {
        title: "Global partners in learning.",
        text: "MWS connects learning with wider communities and partners who support student growth.",
        logos: defaultPartnerLogos,
        logosLabel: "In partnership with",
      },
      spotlightSlides: spotlights.length
        ? spotlights.map((spotlight) => ({
            image: asset("_DSC4760.jpg"),
            alt: spotlight.cite,
            quote: spotlight.text,
            cite: spotlight.cite,
          }))
        : defaultSpotlightSlides,
    };
  }

  static async getAdmissions() {
    const [programs, page] = await Promise.all([
      PageDataRepository.listActivePrograms(),
      PageDataRepository.getAdmissionsPage(),
    ]);

    return {
      content: admissionsContent(page?.content),
      programs: programs.length
        ? programs.map(programResponse)
        : defaultPrograms,
    };
  }

  static async getAdmissionFaq() {
    const items = await PageDataRepository.listAdmissionFaqs();

    return {
      title: "Admission FAQ",
      description:
        "Answers to common questions families ask before joining Millennia World School.",
      items: items.map((item) => ({
        id: item.id,
        question: item.question,
        answer: item.answer,
      })),
    };
  }

  static async getAdmissionGuidelines() {
    const page = await PageDataRepository.getCmsPage("admission-guidelines");
    return admissionGuidelinesContent(page?.body);
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
        imageAlt:
          page?.heroImageAlt || defaultCommunityStoriesContent.hero.imageAlt,
      },
      introTitle: page?.introTitle || defaultCommunityStoriesContent.introTitle,
      introBody: asStringArray(
        page?.introBody,
        defaultCommunityStoriesContent.introBody,
      ),
      activityTitle:
        page?.activityTitle || defaultCommunityStoriesContent.activityTitle,
      activityDescription:
        page?.activityDescription ||
        defaultCommunityStoriesContent.activityDescription,
      galleryImages: galleryImagesFromPage(page),
      news: news.map(newsResponse),
    };
  }
}
