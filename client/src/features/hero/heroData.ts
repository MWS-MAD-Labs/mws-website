import { asset } from "@/data/site";

export type ResolvedHeroSlide = {
  id?: string;
  image: string;
  alt: string;
  headline: string;
  caption: string;
  sortOrder?: number;
};

export type HeroSlideSource = Omit<ResolvedHeroSlide, "headline" | "caption"> & {
  headline: string | null;
  caption: string | null;
};

export const defaultHeroSlides: ResolvedHeroSlide[] = [
  {
    image: asset("_DSC4760.jpg"),
    alt: "Children collaborating on a classroom activity",
    headline: "",
    caption: "",
  },
  {
    image: asset("Elementary.jpg"),
    alt: "Students walking through a sunlit campus courtyard",
    headline: "",
    caption: "",
  },
  {
    image: asset("DSC04079.jpg"),
    alt: "View of the school's campus architecture",
    headline: "",
    caption: "",
  },
];

export function withHeroFallback(slides: HeroSlideSource[]): ResolvedHeroSlide[] {
  if (!slides.length) return defaultHeroSlides;

  return slides.map((slide, index) => {
    const fallback = defaultHeroSlides[index % defaultHeroSlides.length];

    return {
      ...slide,
      image: slide.image || fallback.image,
      alt: slide.alt || fallback.alt,
      headline: slide.headline ?? fallback.headline,
      caption: slide.caption ?? fallback.caption,
      sortOrder: slide.sortOrder ?? index,
    };
  });
}
