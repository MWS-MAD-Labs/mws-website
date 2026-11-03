import Parallax from '@/components/motion/Parallax';
import SplitHeading from '@/components/motion/SplitHeading';

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
    <section className="w-full bg-[var(--warm-white)] py-[64px] md:py-[120px]">
      <div className="mx-auto grid w-full max-w-[1240px] items-center gap-9 px-5 sm:px-6 md:gap-20 md:px-10 lg:grid-cols-[0.9fr_1.1fr]">
        <Parallax className="relative aspect-[4/3] md:aspect-[5/4]">
          <img src={image} alt={imageAlt} className="block h-full w-full object-cover" />
        </Parallax>

        <div className="max-w-[560px]">
          <SplitHeading
            text={title}
            className="mb-5 text-[clamp(30px,8vw,48px)] font-semibold leading-[1.1] tracking-[-0.025em] text-[var(--charcoal)] md:mb-7"
          />

          <div className="space-y-5 text-[15px] leading-7 text-[var(--charcoal-muted)]">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
