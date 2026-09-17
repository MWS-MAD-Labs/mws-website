type EditorialSplitProps = {
  title: string;
  children: React.ReactNode;
  image: string;
  imageAlt: string;
  imagePosition?: 'left' | 'right';
};

export default function EditorialSplit({
  title,
  children,
  image,
  imageAlt,
  imagePosition = 'right',
}: EditorialSplitProps) {
  const imageFirst = imagePosition === 'left';

  const imageBlock = (
    <div className="h-full min-h-[520px] overflow-hidden max-[1024px]:min-h-[420px] max-[680px]:min-h-0">
      <img
        src={image}
        alt={imageAlt}
        className="block h-full min-h-[520px] w-full object-cover max-[1024px]:min-h-[420px] max-[680px]:min-h-[300px]"
      />
    </div>
  );

  const textBlock = (
    <div className="max-w-[600px]">
      <h2 className="mb-7 text-[clamp(32px,4vw,48px)] font-semibold leading-[1.1] tracking-[-0.025em] text-[var(--charcoal)]">
        {title}
      </h2>

      <div className="space-y-5 text-[15px] leading-7 text-[var(--charcoal-muted)]">{children}</div>
    </div>
  );

  return (
    <section className="w-full bg-white  md:py-[12px]">
      <div className="mx-auto grid w-full max-w-[1240px] items-stretch gap-12 px-6 md:gap-20 md:px-10 lg:grid-cols-2">
        {imageFirst ? (
          <>
            {imageBlock}
            {textBlock}
          </>
        ) : (
          <>
            {textBlock}
            {imageBlock}
          </>
        )}
      </div>
    </section>
  );
}
