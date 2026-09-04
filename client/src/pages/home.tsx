import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import CommunityVoices from "../components/ui/CommunityVoices";
import ProgramCards from "../components/ui/ProgramCards";
import { asset, logoUrl } from "../data/site";

const heroSlides = [
  {
    image: asset("_DSC4760.jpg"),
    alt: "Children collaborating on a classroom activity",
    headline: "Where curiosity finds its first language.",
    caption:
      "An international school for preschool through junior high, built around a single idea: a child's world should grow larger every day.",
  },
  {
    image: asset("Elementary.jpg"),
    alt: "Students walking through a sunlit campus courtyard",
    headline: "Learning that steps outside the classroom.",
    caption:
      "Gardens, courtyards, and open studios where a lesson can start indoors and finish somewhere entirely different.",
  },
  {
    image: asset("DSC04079.jpg"),
    alt: "View of the school's campus architecture",
    headline: "A place designed to be grown up in.",
    caption:
      "From a child's first day away from home to the threshold of adolescence, on a single campus.",
  },
];

const infoCards = [
  {
    category: "admissions",
    image: asset("_DSC4760.jpg"),
    alt: "MWS Admissions",
    title: "How to Apply",
    tag: "Enrollment",
    text: "Curabitur cubilia velit sed arcu elit sunt exercitation.",
    path: "/admission",
    action: "Start Application",
  },
  {
    category: "campuses",
    image: asset("Elementary.jpg"),
    alt: "MWS Campus",
    title: "Sunlit Classrooms",
    tag: "Campus Tour",
    text: "Ipsum ut ante posuere aliqua enim ad non tempor.",
    path: "/admission",
    action: "Book a Tour",
  },
  {
    category: "academic",
    image: asset("DSC04079.jpg"),
    alt: "MWS Academic",
    title: "Inquiry Learning",
    tag: "Curriculum",
    text: "Lacus aliquip culpa laboris voluptate aute excepteur.",
    path: "/academic",
    action: "Explore Programs",
  },
  {
    category: "news",
    image: asset("_DSC4760.jpg"),
    alt: "MWS News",
    title: "STEAM Exhibition",
    tag: "News",
    text: "Veniam esse ea officia sint ex odio id.",
    path: "/news",
    action: "Read Story",
  },
  {
    category: "admissions",
    image: asset("Elementary.jpg"),
    alt: "MWS Admissions",
    title: "Tuition & Fees",
    tag: "Tuition",
    text: "Pariatur minim dolore orci faucibus deserunt nulla.",
    path: "/admission",
    action: "View Fees",
  },
];

const filters = [
  { label: "Admissions", value: "admissions" },
  { label: "Campuses", value: "campuses" },
  { label: "Academic", value: "academic" },
  { label: "News", value: "news" },
];

const spotlightSlides = [
  {
    image: asset("_DSC4760.jpg"),
    alt: "Campus Life at MWS",
    quote:
      "Occaecat anim eiusmod tincidunt curabitur, do praesent nulla fermentum laborum orci - mollit ad ipsum et. Culpa elit non suscipit..",
    cite: "Campus Life at Millennia World School",
  },
  {
    image: asset("Elementary.jpg"),
    alt: "Inquiry and culture at MWS",
    quote:
      "Integer esse excepteur, posuere minim amet commodo luctus id a dolore tempor dolor.",
    cite: "Student Life & Culture",
  },
  {
    image: asset("DSC04079.jpg"),
    alt: "Learning environment",
    quote:
      "Laboris adipiscing fugiat gravida sed, sint faucibus veniam. Velit nibh nostrud exercitation deserunt magna.",
    cite: "Our Learning Spaces",
  },
];

const partnerLogos = [
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/CharterForCompassion.jpg",
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/ClimateChangeSchool.jpg",
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/ClimateActionProject.jpg",
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/CommonSenseEducation.jpg",
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/ResponsiveClassroom.jpg",
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/iEran.jpg",
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/Climate-Action.jpg",
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/EraseMeanness.jpg",
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/Empatico.jpg",
];

export default function Home() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [filter, setFilter] = useState("admissions");
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const slickListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroSlides.length);
    }, 2600);

    return () => window.clearInterval(timer);
  }, []);

  const currentHero = heroSlides[heroIndex];

  return (
    <main>
      <section className="hero" id="hero">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.image}
            className={`hero-slide ${index === heroIndex ? "active" : ""}`}
            data-index={index}
          >
            <img src={slide.image} alt={slide.alt} />
          </div>
        ))}

        <div className="hero-scrim" />

        <div className="hero-content">
          <div className="hero-content-inner">
            <h1 id="hero-headline">{currentHero.headline}</h1>
            <p id="hero-caption">{currentHero.caption}</p>
          </div>
        </div>

        <div className="hero-nav" role="tablist" aria-label="Hero slides">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.headline}
              className={index === heroIndex ? "active" : ""}
              type="button"
              data-slide={index}
              aria-label={`Slide ${index + 1}`}
              onClick={() => setHeroIndex(index)}
            />
          ))}
        </div>

        <button
          className="hero-arrow prev"
          type="button"
          aria-label="Previous slide"
          onClick={() =>
            setHeroIndex((current) =>
              current === 0 ? heroSlides.length - 1 : current - 1,
            )
          }
        >
          &#8249;
        </button>
        <button
          className="hero-arrow next"
          type="button"
          aria-label="Next slide"
          onClick={() => setHeroIndex((current) => (current + 1) % heroSlides.length)}
        >
          &#8250;
        </button>

        <div className="hero-scroll-cue">
          <span>Scroll</span>
          <i />
        </div>
      </section>

      <section className="philosophy reveal" id="philosophy">
        <span className="shape shape-tl" aria-hidden="true" />
        <span className="shape shape-tr" aria-hidden="true" />
        <span className="shape shape-bl" aria-hidden="true" />
        <span className="shape shape-br" aria-hidden="true" />

        <div className="logo-text">
          <div className="wrap">
            <p>
              Vitae pretium reprehenderit sit quis lorem luctus ultrices.
              Tincidunt augue suscipit fermentum qui nostrud primis.
            </p>
          </div>
          <div>
            <img src={logoUrl} alt="Logo" />
          </div>
        </div>

        <section className="info-section reveal" id="info-section">
          <div className="wrap">
            <div className="info-header">
              <h2>Everything you need to know about joining MWS.</h2>
            </div>

            <div className="taxonomy-bar">
              <div
                className="filter-nav"
                role="tablist"
                aria-label="Information categories"
              >
                {filters.map((item) => (
                  <button
                    key={item.value}
                    className={`filter-btn ${filter === item.value ? "active" : ""}`}
                    type="button"
                    data-filter={item.value}
                    role="tab"
                    aria-selected={filter === item.value}
                    onClick={() => setFilter(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="slider-controls">
                <button
                  className="slider-btn prev-btn"
                  type="button"
                  aria-label="Previous Slide"
                  onClick={() =>
                    slickListRef.current?.scrollBy({
                      left: -340,
                      behavior: "smooth",
                    })
                  }
                >
                  &#8249;
                </button>
                <button
                  className="slider-btn next-btn"
                  type="button"
                  aria-label="Next Slide"
                  onClick={() =>
                    slickListRef.current?.scrollBy({
                      left: 340,
                      behavior: "smooth",
                    })
                  }
                >
                  &#8250;
                </button>
              </div>
            </div>
          </div>

          <div className="holderBoxes">
            <div className="holderBoxesContent">
              <div className="slickList" ref={slickListRef}>
                <div className="slick-track">
                  {infoCards
                    .filter((card) => card.category === filter)
                    .map((card) => (
                      <div className="holderBox" data-category={card.category} key={card.title}>
                        <div className="innerBox">
                          <picture>
                            <img src={card.image} alt={card.alt} />
                          </picture>
                          <div className="boxOverlay" />
                          <div className="boxContent">
                            <h3 className="boxTitle">{card.title}</h3>
                            <span className="boxTag">{card.tag}</span>
                            <p className="boxDesc">{card.text}</p>
                            <Link to={card.path} className="boxLink">
                              {card.action} <span>&rarr;</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <ProgramCards />

        <section className="campus-spotlight reveal" id="campus-spotlight">
          <div className="spotlight-slider">
            <div className="spotlight-track">
              {spotlightSlides.map((slide, index) => (
                <div
                  key={slide.cite}
                  className={`spotlight-slide ${
                    index === spotlightIndex ? "active" : ""
                  }`}
                >
                  <picture>
                    <img src={slide.image} alt={slide.alt} />
                  </picture>
                  <div className="spotlight-overlay" />
                  <div className="spotlight-caption">
                    <blockquote>"{slide.quote}"</blockquote>
                    <cite>{slide.cite}</cite>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="spotlight-arrow prev"
              type="button"
              aria-label="Previous photo"
              onClick={() =>
                setSpotlightIndex((current) =>
                  current === 0 ? spotlightSlides.length - 1 : current - 1,
                )
              }
            >
              &#8249;
            </button>
            <button
              className="spotlight-arrow next"
              type="button"
              aria-label="Next photo"
              onClick={() =>
                setSpotlightIndex((current) => (current + 1) % spotlightSlides.length)
              }
            >
              &#8250;
            </button>
          </div>
        </section>

        <section className="affiliations wrap reveal" id="affiliations">
          <div className="affiliations-head">
            <h2>Global partners in learning.</h2>
            <p>
              Consectetur ullamco primis cubilia, quis aliqua irure incididunt.
              Feugiat reprehenderit pretium consequat, ultrices est lorem sit
              cupidatat.
            </p>
          </div>

          <div className="affiliations-marquee">
            <div className="marquee-track">
              {[...partnerLogos, ...partnerLogos].map((src, index) => (
                <div className="logo-item" key={`${src}-${index}`}>
                  <img src={src} alt="MWS learning partner" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <CommunityVoices />
      </section>
    </main>
  );
}
