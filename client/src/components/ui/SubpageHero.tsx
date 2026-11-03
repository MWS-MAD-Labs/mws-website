import Parallax from '@/components/motion/Parallax';
import SplitHeading from '@/components/motion/SplitHeading';

type SubpageHeroProps = {
  title: string;
  image: string;
  imageAlt: string;
  breadcrumbs?: Array<{ label: string; path?: string }>;
};

export default function SubpageHero({ title, image, imageAlt }: SubpageHeroProps) {
  return (
    <section className="relative h-[320px] overflow-hidden md:h-[380px]">
      <Parallax className="absolute inset-0" distance={40}>
        <img src={image} alt={imageAlt} className="h-full w-full object-cover" />
      </Parallax>

      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 flex h-full items-end">
        <div className="mx-auto w-full max-w-7xl px-6 pb-12 md:px-8 md:pb-16">
          <SplitHeading
            as="h1"
            text={title}
            stagger={0.07}
            className="max-w-3xl font-serif text-4xl font-medium leading-tight text-white md:text-5xl lg:text-6xl"
          />
        </div>
      </div>
    </section>
  );
}
