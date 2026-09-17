type BackgroundProps = {
  eyebrow?: string;
  headline: string;
  body: string;
  logoSrc: string;
};

export default function Background({
  eyebrow,
  headline,
  body,
  logoSrc,
}: BackgroundProps) {
  return (
    <section id="philosophy" className="w-full bg-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 pb-20 pt-24 md:px-10 md:pb-24 md:pt-28">
        {/* MWS Logo */}
        <img
          src={logoSrc}
          alt="Millennia World School"
          className="h-auto w-12"
        />

        {eyebrow && (
          <span className="label mt-8 block text-[var(--burgundy)]">
            {eyebrow}
          </span>
        )}

        {/* Pernyataan utama */}
        <h2 className="mt-5 max-w-[16ch] text-balance text-center text-[clamp(30px,4.2vw,46px)] font-semibold leading-[1.15] tracking-tight text-[var(--charcoal)]">
          {headline}
        </h2>

        {/* Penjelasan pendukung */}
        <p className="mt-7 max-w-[62ch] text-center text-base leading-[1.75] text-[var(--charcoal-muted)]">
          {body}
        </p>
      </div>
    </section>
  );
}
