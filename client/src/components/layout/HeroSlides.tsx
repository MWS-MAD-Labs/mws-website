import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

type HeroSlide = {
  id?: string;
  image: string;
  video?: string;
  poster?: string;
  mediaType?: 'IMAGE' | 'VIDEO';
  isLooping?: boolean;
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

const DEFAULT_CTA_LABEL = 'Learn More';
const DEFAULT_CTA_HREF = '/admission';

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
  const isManualNavigation = useRef(false);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    slides.forEach((slide) => {
      const src = slide.poster || slide.image;

      if (!src) return;

      const image = new Image();
      image.src = src;
    });
  }, [slides]);

  useEffect(() => {
    if (activeIndex === currentIndexRef.current) {
      return;
    }

    const currentSlide = slides[currentIndexRef.current];
    const nextSlide = slides[activeIndex];

    if (!currentSlide || !nextSlide) {
      return;
    }

    if (currentSlide.mediaType === 'VIDEO' && !isManualNavigation.current) {
      return;
    }

    isManualNavigation.current = false;

    if (transitionTimer.current !== null) {
      window.clearTimeout(transitionTimer.current);
      transitionTimer.current = null;
    }

    if (nextSlide.mediaType === 'VIDEO') {
      currentIndexRef.current = activeIndex;

      queueMicrotask(() => {
        setCurrentIndex(activeIndex);
        setIncomingIndex(null);
        setIsTransitioning(false);
      });

      return;
    }

    queueMicrotask(() => {
      setIncomingIndex(activeIndex);
      setIsTransitioning(true);
    });

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
  }, [activeIndex, slides]);

  useEffect(() => {
    return () => {
      if (transitionTimer.current !== null) {
        window.clearTimeout(transitionTimer.current);
      }
    };
  }, []);

  const handlePrevious = () => {
    isManualNavigation.current = true;
    onPrevious();
  };

  const handleNext = () => {
    isManualNavigation.current = true;
    onNext();
  };

  const handleSelectSlide = (index: number) => {
    isManualNavigation.current = true;
    onSelectSlide(index);
  };

  const currentSlide = slides[currentIndex];
  const incomingSlide = incomingIndex !== null ? slides[incomingIndex] : null;

  if (!currentSlide) {
    return (
      <section id="hero" className="relative h-screen min-h-[680px] w-full overflow-hidden">
        <div className="absolute inset-0 overflow-hidden bg-black" />
      </section>
    );
  }

  return (
    <section id="hero" className="relative h-screen min-h-[680px] w-full overflow-hidden">
      {/* =========================================================
          HERO MEDIA
      ========================================================= */}
      <div className="absolute inset-0 overflow-hidden bg-black">
        {currentSlide.mediaType === 'VIDEO' && currentSlide.video ? (
          <video
            src={currentSlide.video}
            poster={currentSlide.poster || currentSlide.image || undefined}
            className={`absolute inset-0 h-full w-full object-cover will-change-transform ${
              isTransitioning ? 'animate-hero-out' : ''
            }`}
            autoPlay
            loop={currentSlide.isLooping ?? true}
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            src={currentSlide.image}
            alt={currentSlide.alt}
            className={`absolute inset-0 h-full w-full object-cover will-change-transform ${
              isTransitioning ? 'animate-hero-out' : ''
            }`}
          />
        )}

        {/* Incoming slide hanya digunakan untuk IMAGE transition */}
        {incomingSlide && incomingSlide.mediaType !== 'VIDEO' && (
          <img
            key={incomingIndex}
            src={incomingSlide.image}
            alt={incomingSlide.alt}
            className="animate-hero-in absolute inset-0 h-full w-full object-cover will-change-transform"
          />
        )}
      </div>

      {/* =========================================================
          OVERLAY
      ========================================================= */}
      <div className="pointer-events-none absolute inset-0 bg-black/20" />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

      {/* =========================================================
          HERO CONTENT
      ========================================================= */}
      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="px-6 pb-28 sm:px-10 sm:pb-28 md:px-16 md:pb-32">
          {/* Current text */}
          {!isTransitioning && (
            <div
              key={`text-${currentIndex}`}
              className="animate-hero-text-in max-w-[600px] text-white"
            >
              {currentSlide.headline && (
                <h1 className="text-4xl font-bold leading-[0.95] tracking-tight text-white sm:text-5xl">
                  {currentSlide.headline}
                </h1>
              )}

              {currentSlide.caption && (
                <p className="mt-5 max-w-[500px] text-sm leading-relaxed sm:mt-6 sm:text-base">
                  {currentSlide.caption}
                </p>
              )}

              <Link
                to={currentSlide.ctaHref ?? DEFAULT_CTA_HREF}
                className="mt-6 inline-flex items-center gap-3 text-sm font-medium text-white transition-opacity hover:opacity-70 sm:mt-7"
              >
                {currentSlide.ctaLabel ?? DEFAULT_CTA_LABEL}

                <span aria-hidden="true">→</span>
              </Link>
            </div>
          )}

          {/* Incoming text */}
          {isTransitioning && incomingSlide && (
            <div
              key={`text-in-${incomingIndex}`}
              className="animate-hero-text-in max-w-[600px] text-white"
            >
              {incomingSlide.headline && (
                <h1 className="text-4xl font-bold leading-[0.95] tracking-tight text-white sm:text-5xl">
                  {incomingSlide.headline}
                </h1>
              )}

              {incomingSlide.caption && (
                <p className="mt-5 max-w-[500px] text-sm leading-relaxed sm:mt-6 sm:text-base">
                  {incomingSlide.caption}
                </p>
              )}

              <Link
                to={incomingSlide.ctaHref ?? DEFAULT_CTA_HREF}
                className="mt-6 inline-flex items-center gap-3 text-sm font-medium text-white transition-opacity hover:opacity-70 sm:mt-7"
              >
                {incomingSlide.ctaLabel ?? DEFAULT_CTA_LABEL}

                <span aria-hidden="true">→</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
          HERO NAVIGATION
      ========================================================= */}
      <div className="absolute bottom-6 right-5 z-30 flex items-center gap-4 text-white sm:bottom-8 sm:right-10 sm:gap-5">
        {/* Slide indicators */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={slide.id ?? slide.image}
                type="button"
                onClick={() => handleSelectSlide(index)}
                disabled={isTransitioning}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={isActive ? 'true' : undefined}
                className="group flex items-center gap-2 disabled:pointer-events-none"
              >
                <span
                  className={`text-[10px] font-semibold tracking-[0.16em] transition-opacity duration-300 sm:text-[11px] ${
                    isActive ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'
                  }`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>

                <span
                  className={`h-px transition-all duration-300 ${
                    isActive
                      ? 'w-8 bg-white sm:w-10'
                      : 'w-2 bg-white/50 group-hover:w-4 group-hover:bg-white'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Previous / Next */}
        <div className="flex items-center border-l border-white/30 pl-2 sm:pl-3">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={isTransitioning}
            aria-label="Previous slide"
            className="flex h-9 w-9 items-center justify-center text-white transition-opacity hover:opacity-60 disabled:pointer-events-none disabled:opacity-40 sm:h-10 sm:w-10"
          >
            <ChevronLeft size={20} strokeWidth={1.5} className="sm:h-[22px] sm:w-[22px]" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={isTransitioning}
            aria-label="Next slide"
            className="flex h-9 w-9 items-center justify-center text-white transition-opacity hover:opacity-60 disabled:pointer-events-none disabled:opacity-40 sm:h-10 sm:w-10"
          >
            <ChevronRight size={20} strokeWidth={1.5} className="sm:h-[22px] sm:w-[22px]" />
          </button>
        </div>
      </div>
    </section>
  );
}
