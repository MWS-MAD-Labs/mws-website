import { useEffect, useRef, useState } from 'react';
import { pageApi, type CommunityGalleryImageData } from '@/api/pageApi';
import ContentBreadcrumb from '@/components/ui/ContentBreadcrumb';
import SubpageHero from '@/components/ui/SubpageHero';
import AdmissionsCta from '@/components/layout/AdmissionsCta';

const LOGO_SRC =
  'https://millenniaws.sch.id/wp-content/uploads/2021/11/Millennia-World-School-Logo-Only.svg';

const IMAGE_ACTIVITY = 'http://localhost:7001/assets-mws/DSC04079.jpg';

const DEFAULT_ACTIVITY_IMAGE: CommunityGalleryImageData = {
  id: 'default-activity',
  src: IMAGE_ACTIVITY,
  alt: 'Students learning at Millennia World School',
  caption: null,
  size: 'large',
};

const HAPPINESS = [
  { letter: 'H', label: 'HEALTH' },
  { letter: 'A', label: 'ARTISTIC ABILITY' },
  { letter: 'P', label: 'PRACTICAL SKILLS' },
  { letter: 'P', label: 'PASSION' },
  { letter: 'I', label: 'INTELLECT' },
  { letter: 'N', label: 'NATURALISTIC ABILITY' },
  { letter: 'E', label: 'EXCELLENCE' },
  { letter: 'S', label: 'SOCIAL RESPONSIBILITY' },
  { letter: 'S', label: 'SPIRITUAL WELL-BEING' },
];

export default function AboutUs() {
  const [activityImages, setActivityImages] = useState<CommunityGalleryImageData[]>([
    DEFAULT_ACTIVITY_IMAGE,
  ]);
  const [selectedImage, setSelectedImage] = useState<CommunityGalleryImageData | null>(null);

  const happinessSectionRef = useRef<HTMLElement>(null);
  const [visibleHappinessCount, setVisibleHappinessCount] = useState(1);

  useEffect(() => {
    const section = happinessSectionRef.current;
    if (!section) return;

    let frameId = 0;

    const updateProgress = () => {
      cancelAnimationFrame(frameId);

      frameId = requestAnimationFrame(() => {
        if (window.innerWidth < 768) {
          setVisibleHappinessCount(HAPPINESS.length);
          return;
        }

        const rect = section.getBoundingClientRect();
        const scrollDistance = section.offsetHeight - window.innerHeight;

        if (scrollDistance <= 0) {
          setVisibleHappinessCount(HAPPINESS.length);
          return;
        }

        const progress = Math.max(0, Math.min(1, -rect.top / scrollDistance));
        const revealProgress = Math.min(1, progress / 0.75);

        const count = Math.min(
          HAPPINESS.length,
          Math.floor(revealProgress * HAPPINESS.length) + 1,
        );

        setVisibleHappinessCount((current) => Math.max(current, count));
      });
    };

    updateProgress();

    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    pageApi
      .communityStories()
      .then((data) => {
        if (!isMounted) return;

        setActivityImages(
          data.galleryImages.length > 0 ? data.galleryImages : [DEFAULT_ACTIVITY_IMAGE],
        );
      })
      .catch(() => {
        if (!isMounted) return;
        setActivityImages([DEFAULT_ACTIVITY_IMAGE]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage]);

  return (
    <main className="bg-white text-[var(--charcoal)]">
      <SubpageHero
        title="Our School"
        image="about-us"
        imageAlt="Millennia World School campus"
      />

      <ContentBreadcrumb
        items={[
          { label: 'Home', path: '/' },
          { label: 'About MWS' },
          { label: 'Our School' },
        ]}
      />

      {/* MWS BACKGROUND */}
      <section className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        <h2 className="text-center text-3xl font-bold leading-tight tracking-tight md:text-5xl">
          MWS BACKGROUND
        </h2>

        <div className="mt-8 space-y-5 text-lg leading-8 text-[var(--charcoal)]/80">
          <p className="text-justify">
            In the 21st century, every educational system faces the challenge of preparing young
            generations for a life of the future that is not only complex, but constantly changing
            as well, and hence, mostly unknown and unpredictable. However, it is clear that
            intellectual flexibility, creative thinking, independent judgment, moral discernment,
            refined written and oral communication skills, and the ability to collaborate
            effectively are essential to success in today’s ever changing world. Millennia World
            School (MWS) offers a developmentally appropriate, experiential approach towards
            education. We use Science to inspire artistic thinking and Art to inspire scientific
            thinking. Each subject is interlaced with every other subject while providing nuance,
            context and deeper meaning for each. Music, art and movement are as important to the
            curriculum as Math, Science and Languages. Through playful and engaging learning
            strategies we develop and create compassionate and critical thinkers. We also provide a
            safe, caring and nurturing environment in order for children to blossom. We aim to
            develop and inspire lifelong learners and enable them to fully develop their talents,
            dispositions and capabilities. Millennia World School’s Education is based on the
            principle that the subjects are not meant just to be read and tested on, but rather to
            be experienced. Through these deep, meaningful learning experiences children develop and
            cultivate intellectual, emotional, physical capabilities to become individuals who are
            trailblazers and future leaders. To fulfil this dream, Millennia World School was
            established in 2017.
          </p>

          <div className="bg-[var(--burgundy)] px-6 py-6">
            <p className="text-justify text-base leading-7 text-[var(--white)] md:text-lg md:leading-8">
              In the 21st century, every educational system faces the challenge of preparing young
              generations for a life that is not only complex, but constantly changing as well.
              Millennia World School (MWS) offers a developmentally appropriate experiential
              approach towards education. We aim to develop and inspire lifelong learners and
              enable them to fully develop their talents, dispositions and capabilities.
            </p>
          </div>
        </div>
      </section>

      {/* OUR MISSION & OUR VISION */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div className="flex justify-center md:justify-start">
            <img
              src={IMAGE_ACTIVITY}
              alt="Students learning at Millennia World School"
              className="h-auto w-full max-w-lg object-cover"
            />
          </div>

          <div className="flex flex-col gap-10 md:gap-14">
            <div>
              <h2 className="mb-3 text-2xl font-bold leading-tight tracking-tight text-[var(--burgundy)] md:mb-4 md:text-3xl">
                Our Mission
              </h2>

              <p className="text-justify text-base leading-7 text-[var(--charcoal)]/80 md:text-lg md:leading-8">
                Discover and foster individual and group potential to achieve fulfilling lives.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-2xl font-bold leading-tight tracking-tight text-[var(--burgundy)] md:mb-4 md:text-3xl">
                Our Vision
              </h2>

              <p className="text-justify text-base leading-7 text-[var(--charcoal)]/80 md:text-lg md:leading-8">
                A globalized society based on compassion where every individual connects to others
                using their maximum potential through the values of Truth, Beauty and Goodness to
                achieve happiness.
              </p>
            </div>
          </div>
        </div>

        {/* OUR PHILOSOPHY */}
        <div className="mt-16 border-t border-[var(--charcoal)]/15 pt-12 md:mt-24 md:pt-16">
          <h2 className="mb-6 text-center text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Our Philosophy
          </h2>

          <p className="text-justify text-base leading-7 text-[var(--charcoal)]/80 md:text-lg md:leading-8">
            Our Philosophy is based on profound understanding of human development that addresses
            the needs of growing children and aims at developing their love of learning, sense of
            meaning and purpose. At MWS, we emphasize the role of imagination in learning, striving
            to integrate holistically the intellectual, practical, and artistic development of
            students. At the heart of our philosophy lies the concept of H.A.P.P.I.N.E.S.S that
            covers the development of the following aspects: Health, Artistic Ability, Practical
            Skills, Passion, Intellect, and Naturalistic Ability. We aim to develop and inspire
            lifelong learners and enable them to fully develop their talents, dispositions and
            capabilities. Millennia World School's education is based on the principle that
            subjects are not meant just to be read and tested on, but rather to be experienced.
            Through these deep, meaningful learning experiences, children develop and cultivate
            their intellectual, emotional, and physical capabilities to become trailblazers and
            future leaders. To fulfill this dream, Millennia World School was established in 2017.
          </p>
        </div>
      </section>

      {/* H.A.P.P.I.N.E.S.S */}
      <section
        ref={happinessSectionRef}
        data-no-aos
        className="relative mx-auto max-w-7xl px-6 md:h-[180vh] md:px-10 lg:px-12"
      >
        <div className="grid items-stretch md:sticky md:top-0 md:h-screen md:grid-cols-[0.85fr_1.15fr] md:gap-12 lg:gap-20">
          <div className="relative hidden md:block">
            <div className="sticky top-0 flex h-screen items-center justify-center">
              <img
                src={LOGO_SRC}
                alt="Millennia World School logo"
                className="h-auto w-full max-w-[220px] object-contain lg:max-w-[260px]"
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-col justify-center py-16 md:py-10">
            <header className="mb-6 border-b border-[var(--charcoal)]/15 pb-5 md:mb-7">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--burgundy)]/70">
                Our Philosophy
              </p>

              <h2 className="text-3xl font-bold leading-tight tracking-tight text-[var(--charcoal)] md:text-4xl">
                H.A.P.P.I.N.E.S.S
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--charcoal)]/70 md:text-base md:leading-7">
                Nine essential qualities that inspire every student to grow, discover their
                potential, and lead a meaningful life.
              </p>
            </header>

            <ul className="divide-y divide-[var(--charcoal)]/10">
              {HAPPINESS.map((item, i) => {
                const isVisible = i < visibleHappinessCount;

                return (
                  <li
                    key={`${item.letter}-${item.label}`}
                    aria-hidden={!isVisible}
                    className={`happiness-item group flex items-center gap-4 py-3 md:gap-6 md:py-4 ${
                      isVisible ? 'happiness-item-visible' : 'happiness-item-hidden'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--burgundy)]/25 text-lg font-semibold text-[var(--burgundy)] transition-colors duration-300 group-hover:border-[var(--burgundy)] group-hover:bg-[var(--burgundy)] group-hover:text-white md:size-12 md:text-xl"
                    >
                      {item.letter}
                    </span>

                    <h3 className="text-sm font-bold uppercase leading-snug tracking-[0.06em] text-[var(--charcoal)] transition-colors duration-300 group-hover:text-[var(--burgundy)] sm:text-base md:text-lg">
                      {item.label}
                    </h3>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="bg-[var(--warm-white)] px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-3xl font-bold leading-tight tracking-tight text-[var(--charcoal)] md:mb-12 md:text-5xl">
            Core Values
          </h2>

          <div className="grid grid-cols-7 gap-1">
            {activityImages.map((image) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedImage(image)}
                className="group aspect-square overflow-hidden bg-[var(--charcoal)] text-left"
                aria-label={`View ${image.alt}`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {selectedImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(36,23,24,0.94)] p-5 md:p-10"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setSelectedImage(null)}
        >
          <figure className="max-w-[92vw]" onClick={(event) => event.stopPropagation()}>
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-h-[82vh] max-w-[92vw] object-contain"
            />

            {selectedImage.caption ? (
              <figcaption className="mx-auto mt-4 max-w-[760px] text-center text-sm leading-6 text-white/85 md:text-base">
                {selectedImage.caption}
              </figcaption>
            ) : null}
          </figure>
        </div>
      )}

      <section className="mx-auto max-w-3xl px-6 py-16 text-center md:py-24">
        <p className="text-xl leading-8 text-[var(--charcoal)]/80 md:text-2xl md:leading-10">
          We aim to develop and inspire lifelong learners who fully develop their talents,
          dispositions and capabilities. Through deep, meaningful learning experiences, children
          become trailblazers and future leaders. To fulfil this dream, Millennia World School was
          established in 2017.
        </p>
      </section>

      <AdmissionsCta
        headline="Ready to begin your journey at MWS?"
        primary={{
          label: 'Start Your Application',
          to: '/admission',
        }}
        secondary={{
          label: 'Visit Our Campus',
          to: '/contact',
        }}
      />
    </main>
  );
}

