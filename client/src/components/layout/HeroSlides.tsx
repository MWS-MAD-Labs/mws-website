import { ArrowBigLeftDash, ArrowBigRightDash } from 'lucide-react';
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

  // Menandakan perubahan slide berasal dari user,
  // bukan dari auto-slide parent.
  const isManualNavigation = useRef(false);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  /*
   * Preload hero images/posters.
   */
  useEffect(() => {
    slides.forEach((slide) => {
      const src = slide.poster || slide.image;

      if (!src) return;

      const image = new Image();
      image.src = src;
    });
  }, [slides]);

  /*
   * Handle perubahan activeIndex dari parent.
   *
   * Behavior:
   * - Video aktif + perubahan otomatis -> abaikan.
   * - Manual navigation -> tetap diproses.
   * - Slide berikutnya VIDEO -> langsung tampil tanpa transition.
   * - Slide berikutnya IMAGE -> transition normal.
   */
  useEffect(() => {
    if (activeIndex === currentIndexRef.current) {
      return;
    }

    const currentSlide = slides[currentIndexRef.current];
    const nextSlide = slides[activeIndex];

    if (!currentSlide || !nextSlide) {
      return;
    }

    /*
     * Kalau current slide adalah video dan perubahan bukan
     * berasal dari tombol user, jangan pindah slide.
     *
     * Ini membuat video tetap looping dan tidak terganggu
     * oleh auto-slide.
     */
    if (currentSlide.mediaType === 'VIDEO' && !isManualNavigation.current) {
      return;
    }

    // Reset manual flag setelah perubahan diproses.
    isManualNavigation.current = false;

    /*
     * Clear transition sebelumnya jika masih berjalan.
     */
    if (transitionTimer.current !== null) {
      window.clearTimeout(transitionTimer.current);
      transitionTimer.current = null;
    }

    /*
     * VIDEO:
     * Langsung ganti tanpa transition 900ms.
     */
    if (nextSlide.mediaType === 'VIDEO') {
      currentIndexRef.current = activeIndex;

      queueMicrotask(() => {
        setCurrentIndex(activeIndex);
        setIncomingIndex(null);
        setIsTransitioning(false);
      });

      return;
    }

    /*
     * IMAGE:
     * Gunakan transition normal.
     */
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

  /*
   * Cleanup timer saat component unmount.
   */
  useEffect(() => {
    return () => {
      if (transitionTimer.current !== null) {
        window.clearTimeout(transitionTimer.current);
      }
    };
  }, []);

  /*
   * Manual navigation handlers.
   */
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

  /*
   * Belum ada hero slide dari CMS.
   */
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
            } `}
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
            } `}
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

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* =========================================================
          PREVIOUS
      ========================================================= */}
      <button
        type="button"
        onClick={handlePrevious}
        aria-label="Previous slide"
        disabled={isTransitioning}
        className="absolute left-8 top-1/2 z-30 -translate-y-1/2 text-2xl text-white transition-opacity hover:opacity-70 disabled:pointer-events-none disabled:opacity-50"
      >
        <ArrowBigLeftDash/>
      </button>

      {/* =========================================================
          NEXT
      ========================================================= */}
      <button
        type="button"
        onClick={handleNext}
        aria-label="Next slide"
        disabled={isTransitioning}
        className="absolute right-8 top-1/2 z-30 -translate-y-1/2 text-2xl text-white transition-opacity hover:opacity-70 disabled:pointer-events-none disabled:opacity-50"
      >
        <ArrowBigRightDash/>
      </button>

      {/* =========================================================
          HERO CONTENT
      ========================================================= */}
      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="px-14 pb-16 md:px-16 md:pb-20">
          {/* Current text */}
          {!isTransitioning && (
            <div
              key={`text-${currentIndex}`}
              className="animate-hero-text-in max-w-[600px] text-white"
            >
              {currentSlide.headline && (
                <h1 className="text-5xl font-bold leading-[0.95] tracking-tight text-white">
                  {currentSlide.headline}
                </h1>
              )}

              {currentSlide.caption && (
                <p className="mt-6 max-w-[500px] text-base leading-relaxed">
                  {currentSlide.caption}
                </p>
              )}

              <Link
                to={currentSlide.ctaHref ?? DEFAULT_CTA_HREF}
                className="mt-7 inline-flex items-center gap-3 text-sm font-medium transition-opacity hover:opacity-70"
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
              className="animate-hero-text-in max-w-[600px] text-white"
            >
              {incomingSlide.headline && (
                <h1 className="text-5xl font-bold leading-[0.95] tracking-tight text-white">
                  {incomingSlide.headline}
                </h1>
              )}

              {incomingSlide.caption && (
                <p className="mt-6 max-w-[500px] text-base leading-relaxed">
                  {incomingSlide.caption}
                </p>
              )}

              <Link
                to={incomingSlide.ctaHref ?? DEFAULT_CTA_HREF}
                className="mt-7 inline-flex items-center gap-3 text-sm font-medium"
              >
                {incomingSlide.ctaLabel ?? DEFAULT_CTA_LABEL}

                <span>→</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-8 right-10 z-30 flex items-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id ?? slide.image}
            type="button"
            onClick={() => handleSelectSlide(index)}
            disabled={isTransitioning}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 disabled:pointer-events-none ${
              index === activeIndex ? 'w-8 bg-white' : 'w-2 bg-white/60'
            } `}
          />
        ))}
      </div>
    </section>
  );
}
