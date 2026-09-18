type BackgroundProps = {
  body: string;
  logoSrc: string;
};

export default function Background({
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


        {/* Pernyataan utama */}


        {/* Penjelasan pendukung */}
        <p className="mt-7 max-w-[62ch] text-center text-base leading-[1.75] text-[var(--charcoal-muted)]">
          {body}
        </p>
      </div>
    </section>
  );
}
