

type SubpageHeroProps = {
  title: string;
  image: string;
  imageAlt: string;
};

export default function SubpageHero({
  title,
  image,
  imageAlt,
}: SubpageHeroProps) {
  return (
    <section className="subpage-hero">
      <img src={image} alt={imageAlt} />
      <div className="subpage-hero-scrim" />
      <div className="subpage-hero-content">
        <h1>{title}</h1>
      </div>
    </section>
  );
}
