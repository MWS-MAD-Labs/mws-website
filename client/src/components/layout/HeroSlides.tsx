import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

type HeroSlide = {
  image: string;
  alt: string;
  headline?: string;
  caption?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

type HeroProps = {
  slides: HeroSlide[];
  activeIndex: number;
  onSelectSlide: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
};

const TRANSITION_DURATION = 900;

// Fallback dipakai selama slide masih statis. Begitu HeroSlide dibaca dari CMS,
// ctaLabel/ctaHref datang per slide dan fallback ini tidak lagi terpakai.
const DEFAULT_CTA_LABEL = "Learn More";
const DEFAULT_CTA_HREF = "/admission";

export default function Hero({
  slides,
  activeIndex,
  onSelectSlide,
  onPrevious,
  onNext,
}: HeroProps) {
const [currentIndex, setCurrentIndex] = useState(activeIndex);
const [incomingIndex, setIncomingIndex] = useState<number | null>(null);
const [isTransitioning, setIsTransitioning] = useState(false);

const transitionTimer = useRef<number | null>(null);
const currentIndexRef = useRef(activeIndex);

useEffect(() => {
  currentIndexRef.current = currentIndex;
}, [currentIndex]);

useEffect(() => {
  slides.forEach((slide) => {
    const image = new Image();
    image.src = slide.image;
  });
}, [slides]);

useEffect(() => {
  if (activeIndex === currentIndexRef.current) {
    return;
  }

  if (transitionTimer.current !== null) {
    window.clearTimeout(transitionTimer.current);
  }

  setIncomingIndex(activeIndex);
  setIsTransitioning(true);

  transitionTimer.current = window.setTimeout(() => {
    currentIndexRef.current = activeIndex;
    setCurrentIndex(activeIndex);
    setIncomingIndex(null);
    setIsTransitioning(false);
    transitionTimer.current = null;
  }, TRANSITION_DURATION);

  return () => {
    if (transitionTimer.current !== null) {
      window.clearTimeout(transitionTimer.current);
      transitionTimer.current = null;
    }
  };
}, [activeIndex]);

  const currentSlide = slides[currentIndex];
  const incomingSlide =
    incomingIndex !== null ? slides[incomingIndex] : null;

  return (
    <section
      id="hero"
      className="relative h-screen min-h-[680px] w-full overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden bg-black">
        <img
          src={currentSlide.image}
          alt={currentSlide.alt}
          className={`
            absolute inset-0
            h-full w-full
            object-cover
            will-change-transform
            ${
              isTransitioning
                ? "animate-hero-out"
                : ""
            }
          `}
        />
        {incomingSlide && (
          <img
            key={incomingIndex}
            src={incomingSlide.image}
            alt={incomingSlide.alt}
            className="
              absolute inset-0
              h-full w-full
              object-cover
              animate-hero-in
              will-change-transform
            "
          />
        )}
      </div>
      <div className="absolute inset-0 bg-black/20" />
      <button
        type="button"
        onClick={onPrevious}
        aria-label="Previous slide"
        disabled={isTransitioning}
        className="
          absolute left-8 top-1/2 z-30
          -translate-y-1/2
          text-2xl text-white
          transition-opacity
          hover:opacity-70
          disabled:pointer-events-none
          disabled:opacity-50
        "
      >
        ←
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next slide"
        disabled={isTransitioning}
        className="
          absolute right-8 top-1/2 z-30
          -translate-y-1/2
          text-2xl text-white
          transition-opacity
          hover:opacity-70
          disabled:pointer-events-none
          disabled:opacity-50
        "
      >
        →
      </button>
      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="px-14 pb-16 md:px-16 md:pb-20">
          {/* Current text */}
          {!isTransitioning && (
            <div
              key={`text-${currentIndex}`}
              className="
                max-w-[600px]
                text-white
                animate-hero-text-in
              "
            >
              {currentSlide.headline && (
                <h1 className="
                  text-5xl
                  font-bold
                  text-white
                  leading-[0.95]
                  tracking-tight
                ">
                  {currentSlide.headline}
                </h1>
              )}

              {currentSlide.caption && (
                <p className="
                  mt-6
                  max-w-[500px]
                  text-base
                  leading-relaxed
                ">
                  {currentSlide.caption}
                </p>
              )}

              <Link
                to={currentSlide.ctaHref ?? DEFAULT_CTA_HREF}
                className="
                  mt-7
                  inline-flex
                  items-center
                  gap-3
                  text-sm
                  font-medium
                  transition-opacity
                  hover:opacity-70
                "
              >
                {currentSlide.ctaLabel ?? DEFAULT_CTA_LABEL}
                <span>→</span>
              </Link>
            </div>
          )}

          {/* Incoming text */}
          {isTransitioning && incomingSlide && (
            <div
              key={`text-in-${incomingIndex}`}
              className="
                max-w-[600px]
                text-white
                animate-hero-text-in
              "
            >
              {incomingSlide.headline && (
                <h1 className="
                  text-5xl
                  font-bold
                  text-white
                  leading-[0.95]
                  tracking-tight
                ">
                  {incomingSlide.headline}
                </h1>
              )}

              {incomingSlide.caption && (
                <p className="
                  mt-6
                  max-w-[500px]
                  text-base
                  leading-relaxed
                ">
                  {incomingSlide.caption}
                </p>
              )}

              <Link
                to={incomingSlide.ctaHref ?? DEFAULT_CTA_HREF}
                className="
                  mt-7
                  inline-flex
                  items-center
                  gap-3
                  text-sm
                  font-medium
                "
              >
                {incomingSlide.ctaLabel ?? DEFAULT_CTA_LABEL}
                <span>→</span>
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="
        absolute
        bottom-8
        right-10
        z-30
        flex
        items-center
        gap-2
      ">
        {slides.map((slide, index) => (
          <button
            key={slide.image}
            type="button"
            onClick={() => onSelectSlide(index)}
            disabled={isTransitioning}
            aria-label={`Go to slide ${index + 1}`}
            className={`
              h-1.5
              rounded-full
              transition-all
              duration-300
              disabled:pointer-events-none
              ${
                index === activeIndex
                  ? "w-8 bg-white"
                  : "w-2 bg-white/60"
              }
            `}
          />
        ))}
      </div>
    </section>
  );
}