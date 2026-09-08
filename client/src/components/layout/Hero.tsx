type HeroSlide = {
  image: string;
  alt: string;
  headline: string;
  caption: string;
};

type HeroProps = {
  slides: HeroSlide[];
  activeIndex: number;
  onSelectSlide: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
};

export default function Hero({
  slides,
  activeIndex,
  onSelectSlide,
  onPrevious,
  onNext,
}: HeroProps) {
  const currentHero = slides[activeIndex];

  return (
    <section
      className="group relative h-screen min-h-[640px] overflow-hidden bg-[var(--deep-charcoal)] max-[980px]:h-auto max-[980px]:min-h-[680px] max-[680px]:min-h-[620px] max-[560px]:min-h-[640px]"
      id="hero"
    >
      {slides.map((slide, index) => (
        <div
          key={slide.image}
          className={`absolute inset-0 transition-[opacity,visibility] duration-[1600ms] ease-in-out ${
            index === activeIndex
              ? "visible z-[1] opacity-100"
              : "invisible opacity-0"
          }`}
          data-index={index}
        >
          <img
            className={`h-full w-full object-cover transition-transform duration-[8000ms] ease-linear ${
              index === activeIndex ? "scale-100" : "scale-[1.08]"
            }`}
            src={slide.image}
            alt={slide.alt}
          />
        </div>
      ))}

      <div className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(to_top,rgba(15,13,12,0.72)_0%,rgba(15,13,12,0.28)_32%,rgba(15,13,12,0)_58%),linear-gradient(to_bottom,rgba(15,13,12,0.38)_0%,rgba(15,13,12,0)_22%)]" />

      <div className="absolute inset-x-0 bottom-0 z-[3] px-12 pb-[76px] max-[980px]:px-6 max-[980px]:pb-[118px] max-[980px]:pt-[120px] max-[680px]:px-4 max-[680px]:pb-[104px] max-[680px]:pt-[100px] max-[560px]:px-[18px] max-[560px]:pb-28 max-[560px]:pt-[104px]">
        <div className="max-w-[760px] max-[980px]:max-w-[620px]">
          <h1
            className="mb-[18px] max-w-[11ch] font-[var(--f-head)] text-[clamp(34px,5.4vw,66px)] font-semibold leading-[1.08] tracking-normal text-[var(--white)] opacity-100 transition-[opacity,transform] duration-[800ms] ease-in-out max-[980px]:text-[clamp(34px,8vw,52px)] max-[680px]:max-w-[13ch] max-[680px]:text-[clamp(30px,10vw,40px)] max-[560px]:mb-3.5 max-[560px]:max-w-[12ch] max-[560px]:text-[clamp(31px,10vw,42px)] max-[430px]:text-[31px]"
            id="hero-headline"
          >
            {currentHero.headline}
          </h1>
          <p
            className="max-w-[440px] font-[var(--f-body)] text-[17px] text-[rgba(248,247,243,0.82)] opacity-100 transition-[opacity,transform] duration-[800ms] ease-in-out max-[980px]:max-w-[min(100%,520px)] max-[980px]:text-base max-[980px]:leading-[1.6] max-[680px]:max-w-full max-[680px]:text-[14.5px] max-[560px]:text-[15px]"
            id="hero-caption"
          >
            {currentHero.caption}
          </p>
        </div>
      </div>

      <div
        className="absolute bottom-[76px] right-12 z-[4] flex items-center gap-3.5 max-[980px]:bottom-[42px] max-[980px]:left-6 max-[980px]:right-6 max-[980px]:justify-start max-[680px]:bottom-7 max-[680px]:left-4 max-[680px]:right-4 max-[560px]:bottom-[34px] max-[560px]:left-[18px] max-[560px]:right-[18px] max-[560px]:gap-2.5"
        role="tablist"
        aria-label="Hero slides"
      >
        {slides.map((slide, index) => (
          <button
            key={slide.headline}
            className={`relative h-0.5 w-[34px] cursor-pointer bg-[rgba(248,247,243,0.4)] transition-colors duration-[400ms] after:absolute after:left-0 after:top-0 after:h-full after:bg-[var(--warm-white)] after:transition-[width] after:duration-300 after:content-[''] hover:bg-[rgba(248,247,243,0.65)] max-[980px]:w-[30px] max-[560px]:w-[26px] ${
              index === activeIndex ? "after:w-full" : "after:w-0"
            }`}
            type="button"
            data-slide={index}
            aria-label={`Slide ${index + 1}`}
            onClick={() => onSelectSlide(index)}
          />
        ))}
      </div>

      <button
        className="absolute left-12 top-1/2 z-[4] -translate-y-1/2 cursor-pointer border-0 bg-transparent font-[var(--f-voice)] text-[32px] text-[rgba(248,247,243,0.55)] opacity-0 transition-[opacity,color] duration-300 group-hover:opacity-100 hover:text-[var(--white)] max-[980px]:hidden"
        type="button"
        aria-label="Previous slide"
        onClick={onPrevious}
      >
        &#8249;
      </button>
      <button
        className="absolute right-12 top-1/2 z-[4] -translate-y-1/2 cursor-pointer border-0 bg-transparent font-[var(--f-voice)] text-[32px] text-[rgba(248,247,243,0.55)] opacity-0 transition-[opacity,color] duration-300 group-hover:opacity-100 hover:text-[var(--white)] max-[980px]:hidden"
        type="button"
        aria-label="Next slide"
        onClick={onNext}
      >
        &#8250;
      </button>

      <div className="absolute bottom-[26px] left-1/2 z-[4] flex -translate-x-1/2 flex-col items-center gap-2 max-[680px]:hidden">
        <span className="font-[var(--f-head)] text-[10.5px] uppercase tracking-[0.16em] text-[rgba(248,247,243,0.55)]">
          Scroll
        </span>
        <i className="relative block h-7 w-px overflow-hidden bg-[rgba(248,247,243,0.35)] after:absolute after:left-0 after:top-[-28px] after:h-7 after:w-full after:animate-scrollcue after:bg-[var(--warm-white)] after:content-[''] motion-reduce:after:animate-none motion-reduce:after:top-0" />
      </div>
    </section>
  );
}
