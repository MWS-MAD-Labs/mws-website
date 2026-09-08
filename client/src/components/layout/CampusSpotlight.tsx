import { useState } from "react";

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

  return (
    <section
      className="relative left-1/2 right-1/2 my-20 w-screen -ml-[50vw] -mr-[50vw] translate-y-7 overflow-hidden opacity-0 transition-[opacity,transform] duration-[900ms] ease-out data-[revealed=true]:translate-y-0 data-[revealed=true]:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none max-[980px]:my-14 max-[680px]:left-auto max-[680px]:right-auto max-[680px]:my-[42px] max-[680px]:ml-0 max-[680px]:mr-0 max-[680px]:w-full"
      id="campus-spotlight"
      data-reveal
    >
      <div className="relative h-[80vh] max-h-[720px] min-h-[500px] w-full bg-[var(--charcoal)] max-[980px]:h-[62vh] max-[980px]:min-h-[440px] max-[680px]:aspect-[4/5] max-[680px]:h-auto max-[680px]:min-h-[420px] max-[430px]:min-h-[380px]">
        <div className="relative h-full w-full">
          {slides.map((slide, index) => (
            <div
              key={slide.cite}
              className={`absolute inset-0 z-[1] transition-[opacity,visibility] duration-[800ms] ease-in-out ${
                index === activeIndex ? "visible z-[2] opacity-100" : "invisible opacity-0"
              }`}
            >
              <picture>
                <img
                  className={`block h-full w-full object-cover transition-transform duration-[6000ms] ease-in-out ${
                    index === activeIndex ? "scale-[1.04]" : "scale-100"
                  }`}
                  src={slide.image}
                  alt={slide.alt}
                />
              </picture>
              <div className="absolute inset-0 z-[2] bg-[linear-gradient(180deg,rgba(36,23,24,0.2)_0%,rgba(36,23,24,0.5)_50%,rgba(36,23,24,0.85)_100%)] backdrop-blur-[4px]" />
              <div className="absolute left-1/2 top-1/2 z-[3] w-full max-w-[960px] -translate-x-1/2 -translate-y-1/2 px-20 py-[60px] text-center text-[var(--white)] max-[980px]:max-w-[760px] max-[980px]:px-16 max-[980px]:py-[42px] max-[980px]:pl-7 max-[680px]:px-[18px] max-[680px]:pb-[72px] max-[680px]:pt-7">
                <blockquote className="m-0 mb-4 font-[var(--f-voice)] text-[clamp(22px,2.5vw,32px)] italic leading-[1.35] text-[var(--white)] [text-shadow:0_2px_12px_rgba(36,23,24,0.4)] max-[680px]:text-[clamp(19px,6vw,24px)]">
                  "{slide.quote}"
                </blockquote>
                <cite className="block text-[13px] not-italic font-semibold uppercase tracking-[1.5px] text-[var(--gold)]">
                  {slide.cite}
                </cite>
              </div>
            </div>
          ))}
        </div>

        <button
          className="absolute left-8 top-1/2 z-[4] flex h-[52px] w-[52px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/15 text-[28px] text-[var(--white)] backdrop-blur-lg transition-all duration-300 hover:border-white/90 hover:bg-white/90 hover:text-[var(--charcoal)] max-[768px]:left-4 max-[768px]:h-10 max-[768px]:w-10 max-[768px]:text-xl max-[680px]:bottom-[18px] max-[680px]:top-auto max-[680px]:translate-y-0 max-[680px]:transform-none max-[680px]:left-[18px]"
          type="button"
          aria-label="Previous photo"
          onClick={() =>
            setActiveIndex((current) =>
              current === 0 ? slides.length - 1 : current - 1,
            )
          }
        >
          &#8249;
        </button>
        <button
          className="absolute right-8 top-1/2 z-[4] flex h-[52px] w-[52px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/15 text-[28px] text-[var(--white)] backdrop-blur-lg transition-all duration-300 hover:border-white/90 hover:bg-white/90 hover:text-[var(--charcoal)] max-[768px]:right-4 max-[768px]:h-10 max-[768px]:w-10 max-[768px]:text-xl max-[680px]:bottom-[18px] max-[680px]:top-auto max-[680px]:translate-y-0 max-[680px]:transform-none max-[680px]:right-[18px]"
          type="button"
          aria-label="Next photo"
          onClick={() =>
            setActiveIndex((current) => (current + 1) % slides.length)
          }
        >
          &#8250;
        </button>
      </div>
    </section>
  );
}
