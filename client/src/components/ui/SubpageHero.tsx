import { Link } from "react-router-dom";

type Breadcrumb = {
  label: string;
  path?: string;
};

type SubpageHeroProps = {
  title: string;
  image: string;
  imageAlt: string;
  breadcrumbs: Breadcrumb[];
};

export default function SubpageHero({
  title,
  image,
  imageAlt,
  breadcrumbs,
}: SubpageHeroProps) {
  return (
    <section className="subpage-hero">
      <img src={image} alt={imageAlt} />
      <div className="subpage-hero-scrim" />
      <div className="subpage-hero-content">
        <div className="breadcrumbs">
          {breadcrumbs.map((item, index) => (
            <span key={`${item.label}-${index}`}>
              {index > 0 && <span>/</span>}
              {item.path ? <Link to={item.path}>{item.label}</Link> : item.label}
            </span>
          ))}
        </div>
        <h1>{title}</h1>
      </div>
    </section>
  );
}
