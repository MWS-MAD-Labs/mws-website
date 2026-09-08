type PhilosophyProps = {
  text: string;
  logoSrc: string;
  logoAlt?: string;
};

const philosophyShapeTl =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cpath fill='%23D6A13A' fill-opacity='0.25' d='M0 0 L200 0 C200 110.45 110.45 200 0 200 Z'/%3E%3C/svg%3E\")";

const philosophyShapeTr =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Cpath fill='%23B94A4E' fill-opacity='0.2' d='M300 0 L300 300 C134.31 300 0 165.69 0 0 Z'/%3E%3C/svg%3E\")";

export default function Philosophy({
  text,
  logoSrc,
  logoAlt = "Logo",
}: PhilosophyProps) {
  return (
    <section
      className="relative w-full translate-y-7 overflow-hidden text-center opacity-0 transition-[opacity,transform] duration-[900ms] ease-out data-[revealed=true]:translate-y-0 data-[revealed=true]:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none max-[980px]:pb-[110px] max-[980px]:pt-[88px] max-[680px]:pt-[68px]"
      id="philosophy"
      data-reveal
    >
      <span
        className="pointer-events-none absolute left-0 top-0 z-0 h-[220px] w-[220px] bg-contain bg-left-top bg-no-repeat max-[980px]:h-[150px] max-[980px]:w-[150px]"
        style={{ backgroundImage: philosophyShapeTl }}
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute right-0 top-0 z-0 h-[380px] w-[380px] bg-contain bg-right-top bg-no-repeat max-[980px]:h-[230px] max-[980px]:w-[230px]"
        style={{ backgroundImage: philosophyShapeTr }}
        aria-hidden="true"
      />

      <div className="flex flex-col items-center text-center max-[980px]:gap-6">
        <div className="mx-auto max-w-[1240px] px-12 max-[980px]:w-[min(100%_-_40px,1240px)] max-[980px]:px-0 max-[680px]:w-[min(100%_-_32px,1240px)] max-[430px]:w-[min(100%_-_28px,1240px)]">
          <p className="relative z-[1] mx-auto max-w-[900px] font-[var(--f-voice)] text-[clamp(14px,2.2vw,20px)] font-medium italic leading-[1.2] text-[var(--white)] max-[680px]:text-[17px] max-[680px]:leading-[1.45]">
            {text}
          </p>
        </div>
        <div>
          <img
            className="mt-8 block h-auto w-[50px] max-[980px]:mt-0 max-[980px]:w-[46px]"
            src={logoSrc}
            alt={logoAlt}
          />
        </div>
      </div>
    </section>
  );
}
