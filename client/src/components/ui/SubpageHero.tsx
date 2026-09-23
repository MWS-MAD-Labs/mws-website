type SubpageHeroProps = {
  title: string;
  image: string;
  imageAlt: string;
  breadcrumbs?: Array<{ label: string; path?: string }>;
};

export default function SubpageHero({ title, image, imageAlt }: SubpageHeroProps) {
  return (
    <section className="relative h-[320px] overflow-hidden md:h-[380px]">
      <img src={image} alt={imageAlt} className="absolute inset-0 h-full w-full object-cover" />

      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 flex h-full items-end">
        <div className="mx-auto w-full max-w-7xl px-6 pb-12 md:px-8 md:pb-16">
          <h1 className="max-w-3xl font-serif text-4xl font-medium leading-tight text-white md:text-5xl lg:text-6xl">
            {title}
          </h1>
        </div>
      </div>
    </section>
  );
}
