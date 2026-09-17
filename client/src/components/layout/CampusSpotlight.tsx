import { useEffect, useState } from 'react';

type SpotlightSlide = {
  image: string;
  alt: string;
  quote: string;
  cite: string;
};

type CampusSpotlightProps = {
  slides: SpotlightSlide[];
};

export default function CampusSpotlight({ slides }: CampusSpotlightProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5500);

    return () => window.clearInterval(interval);
  }, [slides.length, isPaused]);

  return (
    <section
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-0 mt-20 w-screen translate-y-7 overflow-hidden opacity-0 transition-[opacity,transform] duration-[900ms] ease-out data-[revealed=true]:translate-y-0 data-[revealed=true]:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none max-[980px]:mt-14 max-[680px]:left-auto max-[680px]:right-auto max-[680px]:ml-0 max-[680px]:mr-0 max-[680px]:mt-[42px] max-[680px]:w-full"
      id="campus-spotlight"
      data-reveal
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="relative aspect-[16/4] w-full bg-[var(--charcoal)] max-[680px]:aspect-[4/3]">
        <div className="relative h-full w-full">
          {slides.map((slide, index) => (
            <div
              key={slide.cite}
              className={`absolute inset-0 z-[1] transition-[opacity,visibility] duration-[800ms] ease-in-out ${
                index === activeIndex ? 'visible z-[2] opacity-100' : 'invisible opacity-0'
              }`}
            >
              <img
                className={`block h-full w-full object-cover transition-transform duration-[6000ms] ease-in-out ${
                  index === activeIndex ? 'scale-[1.04]' : 'scale-100'
                }`}
                src={slide.image}
                alt={slide.alt}
              />

              <div className="absolute inset-0 z-[2] bg-[linear-gradient(180deg,rgba(36,23,24,0.15)_0%,rgba(36,23,24,0.48)_55%,rgba(36,23,24,0.82)_100%)]" />

              <div className="absolute left-1/2 top-1/2 z-[3] w-full max-w-[900px] -translate-x-1/2 -translate-y-1/2 px-16 text-center text-[var(--white)] max-[980px]:px-12 max-[680px]:px-6">
                <blockquote className="m-0 mb-4 text-[clamp(21px,2.3vw,30px)] font-[var(--f-voice)] italic leading-[1.4] text-[var(--white)] [text-shadow:0_2px_12px_rgba(36,23,24,0.4)] max-[680px]:text-[clamp(19px,5.5vw,24px)]">
                  "{slide.quote}"
                </blockquote>

                <cite className="block text-[12px] font-semibold uppercase not-italic tracking-[1.5px] text-[var(--gold)]">
                  {slide.cite}
                </cite>
              </div>
            </div>
          ))}
        </div>

        {/* Progress */}
        {slides.length > 1 && (
          <div className="absolute bottom-5 left-1/2 z-[4] flex -translate-x-1/2 items-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.cite}
                type="button"
                aria-label={`Go to quote ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 cursor-pointer rounded-full transition-all duration-500 ${
                  index === activeIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/45 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
