type EditorialFeatureProps = {
  title: string;
  children: React.ReactNode;
  image: string;
  imageAlt: string;
};

export default function EditorialFeature({
  title,
  children,
  image,
  imageAlt,
}: EditorialFeatureProps) {
  return (
    <section className="w-full bg-[var(--warm-white)] py-[96px] md:py-[120px]">
      <div className="mx-auto grid w-full max-w-[1240px] items-center gap-12 px-6 md:gap-20 md:px-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="overflow-hidden">
          <img
            src={image}
            alt={imageAlt}
            className="block aspect-[4/3] w-full object-cover md:aspect-[5/4]"
          />
        </div>

        <div className="max-w-[560px]">
          <h2 className="mb-7 text-[clamp(32px,4vw,48px)] font-semibold leading-[1.1] tracking-[-0.025em] text-[var(--charcoal)]">
            {title}
          </h2>

          <div className="space-y-5 text-[15px] leading-7 text-[var(--charcoal-muted)]">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
