type AffiliationsProps = {
  title: string;
  text: string;
  logos: string[];
};

const affiliationShape =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'%3E%3Cpath fill='%23D6A13A' fill-opacity='0.14' d='M46.2,-64.3C61.4,-53.3,76.3,-41.1,82.4,-25.3C88.5,-9.5,85.8,9.9,77.3,25.5C68.8,41.1,54.5,52.9,39.3,62.5C24.1,72.1,8,79.4,-8.3,79.8C-24.6,80.2,-41.1,73.7,-54.8,63.1C-68.5,52.5,-79.4,37.9,-83.2,21.4C-87,4.9,-83.7,-13.5,-75.4,-28.1C-67.1,-42.7,-53.8,-53.5,-39.9,-64.8C-26.9,-76,-13.5,-87.7,1,-89C15.5,-90.4,31,-75.3,46.2,-64.3Z' transform='translate(120 120)'/%3E%3C/svg%3E\")";

export default function Affiliations({ title, text, logos }: AffiliationsProps) {
  return (
    <section
      className="relative isolate mx-auto flex max-w-[1240px] translate-y-7 flex-col items-center overflow-hidden px-12 py-[120px] text-center opacity-0 transition-[opacity,transform] duration-[900ms] ease-out data-[revealed=true]:translate-y-0 data-[revealed=true]:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none max-[980px]:w-[min(100%_-_40px,1240px)] max-[980px]:px-0 max-[980px]:py-[76px] max-[680px]:w-[min(100%_-_32px,1240px)] max-[680px]:py-[60px] max-[430px]:w-[min(100%_-_28px,1240px)]"
      id="affiliations"
      data-reveal
    >
      <span
        className="pointer-events-none absolute top-[22px] z-[-1] h-[380px] w-[380px] bg-contain bg-no-repeat"
        style={{
          backgroundImage: affiliationShape,
          right: "calc((1240px - 100vw) / 2 - 140px)",
        }}
        aria-hidden="true"
      />

      <div className="mb-[60px] max-w-[800px] text-center max-[680px]:mb-8">
        <h2 className="mb-4 text-[clamp(32px,3.5vw,44px)] font-semibold leading-[1.25] tracking-normal text-[var(--charcoal)] max-[680px]:text-[clamp(28px,9vw,34px)]">
          {title}
        </h2>
        <p className="m-0 text-base leading-[1.6] text-[var(--charcoal-muted)]">
          {text}
        </p>
      </div>

      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,rgba(36,23,24,0)_0%,rgba(36,23,24,1)_10%,rgba(36,23,24,1)_90%,rgba(36,23,24,0)_100%)] [-webkit-mask-image:linear-gradient(to_right,rgba(36,23,24,0)_0%,rgba(36,23,24,1)_10%,rgba(36,23,24,1)_90%,rgba(36,23,24,0)_100%)]">
        <div className="flex w-max animate-marqueeScroll items-center gap-20 hover:[animation-play-state:paused] motion-reduce:animate-none max-[980px]:gap-12 max-[680px]:gap-8">
          {[...logos, ...logos].map((src, index) => (
            <div key={`${src}-${index}`}>
              <img
                className="h-[75px] w-auto object-contain grayscale opacity-55 transition-[filter,opacity,transform] duration-300 hover:scale-105 hover:grayscale-0 hover:opacity-100 max-[980px]:h-[58px] max-[680px]:h-[46px]"
                src={src}
                alt="MWS learning partner"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
