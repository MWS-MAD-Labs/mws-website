import Parallax from '@/components/motion/Parallax';
import SplitHeading from '@/components/motion/SplitHeading';

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
    <Parallax className="relative h-full min-h-[520px] max-[1024px]:min-h-[420px] max-[680px]:min-h-[300px]">
      <img src={image} alt={imageAlt} className="block h-full w-full object-cover" />
    </Parallax>
  );

  const textBlock = (
    <div className="max-w-[600px]">
      <SplitHeading
        text={title}
        className="mb-5 text-[clamp(30px,8vw,48px)] font-semibold leading-[1.1] tracking-[-0.025em] text-[var(--charcoal)] md:mb-7"
      />

      <div className="space-y-5 text-[15px] leading-7 text-[var(--charcoal-muted)]">{children}</div>
    </div>
  );

  return (
    <section className="w-full bg-white py-[64px] md:py-[12px]">
      <div className="mx-auto grid w-full max-w-[1240px] items-stretch gap-9 px-5 sm:px-6 md:gap-20 md:px-10 lg:grid-cols-2">
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
