import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pageApi, type AdmissionProgramData } from '@/api/pageApi';
import SubpageHero from '../components/ui/SubpageHero';
import ContentBreadcrumb from '@/components/ui/ContentBreadcrumb';
import { asset } from '../data/site';

const programs: AdmissionProgramData[] = [
  {
    id: "kindergarten",
    title: "Kindergarten",
    age: "Age 2–6",
    description:
      "A nurturing first step into learning, where children build curiosity, confidence, communication, and positive relationships through meaningful experiences.",
    image: asset("DSC04079.jpg"),
    path: "/academic/kindergarten",
    adminWhatsapp: "6281234567890",
    contactLabel: "Contact",
    exploreLabel: "Explore",
  },
  {
    id: "elementary",
    title: "Elementary",
    age: "Age 6–12",
    description:
      "A stage for building strong academic foundations while developing independence, creativity, collaboration, and a deeper understanding of the world.",
    image: asset("DSC04079.jpg"),
    path: "/academic/elementary",
    adminWhatsapp: "6281234567891",
    contactLabel: "Contact",
    exploreLabel: "Explore",
  },
  {
    id: "junior-high",
    title: "Junior High",
    age: "Age 12–15",
    description:
      "Students develop greater independence, strengthen critical thinking, and prepare for the opportunities and challenges of the next stage of their education.",
    image: asset("DSC04079.jpg"),
    path: "/academic/junior-high",
    adminWhatsapp: "6281234567892",
    contactLabel: "Contact",
    exploreLabel: "Explore",
  },
];

export default function Admission() {
  const [admissionPrograms, setAdmissionPrograms] = useState<AdmissionProgramData[]>(programs);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    pageApi
      .admissions()
      .then((data) => {
        if (!isMounted) return;
        setAdmissionPrograms(data.programs.length ? data.programs : programs);
        setLoadError(null);
      })
      .catch((error) => {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : 'Unable to load admissions content.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main>
      {loadError && (
        <p className="sr-only" role="status">
          {loadError}
        </p>
      )}

      {/* Hero */}
      <SubpageHero
        title="Admissions"
        image={asset('DSC04079.jpg')}
        imageAlt="Millennia World School campus"
      />

      {/* Breadcrumb */}
      <ContentBreadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Admissions' }]} />

      {/* Introduction */}
      <section className="relative w-full bg-[var(--white)] px-6 py-[100px] max-[680px]:px-5 max-[680px]:py-[70px] md:px-10 md:py-[120px]">
        <div className="mx-auto grid w-full max-w-[1240px] grid-cols-[0.9fr_1.1fr] items-center gap-16 max-[900px]:grid-cols-1 max-[900px]:gap-8">
          <h2 className="max-w-[500px] text-[clamp(36px,4vw,56px)] font-semibold leading-[1.08] tracking-[-0.025em] text-[var(--charcoal)]">
            Begin your journey with MWS.
          </h2>

          <div className="max-w-[650px]">
            <p className="text-base leading-[1.8] text-[var(--charcoal)] md:text-lg">
              Choosing the right school is an important decision for every family. At Millennia
              World School, we believe education should help every student discover their strengths,
              develop confidence, and grow into a compassionate member of the world community.
            </p>

            <p className="mt-6 text-base leading-[1.8] text-[var(--charcoal-muted)]">
              From the early years to junior high, our learning environment is designed to support
              students at every stage of their development.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose MWS */}
      <section className="w-full bg-[var(--warm-white)] px-6 py-[110px] max-[680px]:px-5 max-[680px]:py-[70px] md:px-10 md:py-[120px]">
        <div className="mx-auto grid w-full max-w-[1240px] grid-cols-[0.75fr_1.25fr] items-center gap-16 max-[900px]:grid-cols-1 max-[900px]:gap-10">
          {/* Content */}
          <div className="max-w-[460px]">
            <p className="mb-3 text-[18px] font-medium leading-tight text-[var(--charcoal-muted)]">
              Why Choose
            </p>

            <h2 className="text-[clamp(40px,4.2vw,60px)] font-semibold leading-[1.02] tracking-[-0.03em] text-[var(--charcoal)]">
              Millennia
              <br />
              World School
            </h2>

            <p className="mt-8 text-base leading-[1.85] text-[var(--charcoal-muted)]">
              At MWS, we see every student as an individual with their own potential, interests, and
              journey. Our learning environment is designed to nurture curiosity, build confidence,
              and encourage students to grow academically, personally, and socially.
            </p>
          </div>

          {/* Image */}
          <div className="relative aspect-[5/4] overflow-hidden max-[900px]:aspect-[16/9]">
            <img
              src={asset('DSC04079.jpg')}
              alt="Students learning at Millennia World School"
              className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.02]"
            />
          </div>
        </div>
      </section>

      {/* Connect With Us */}
      <section className="w-full bg-[var(--white)] px-6 py-[110px] max-[680px]:px-5 max-[680px]:py-[70px] md:px-10 md:py-[120px]">
        <div className="mx-auto w-full max-w-[1240px]">
          {/* Section Heading */}
          <div className="mb-14 max-w-[720px]">
            <h2 className="text-[clamp(34px,3.5vw,48px)] font-semibold leading-[1.08] tracking-[-0.02em] text-[var(--charcoal)]">
              Connect with us!
            </h2>

            <p className="mt-5 max-w-[650px] text-base leading-[1.8] text-[var(--charcoal-muted)]">
              Explore the learning journey at MWS and find the program that best supports your
              child's next stage.
            </p>
          </div>

          {/* Program Cards */}
          <div className="grid grid-cols-3 gap-6 max-[900px]:grid-cols-1">
            {admissionPrograms.map((program) => (
              <article
                key={program.id}
                className="group flex h-full flex-col overflow-hidden border border-[var(--border)] bg-[var(--white)]"
              >
                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden bg-[var(--warm-white)]">
                  <img
                    src={program.image}
                    alt={`${program.title} at Millennia World School`}
                    className="h-full w-full object-cover grayscale-[0.08] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-7 md:p-8">
                  <div>
                    <h3 className="text-[22px] font-semibold leading-tight text-[var(--charcoal)]">
                      {program.title}
                    </h3>

                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold)]">
                      {program.age}
                    </p>

                    <p className="mt-5 text-sm leading-[1.75] text-[var(--charcoal-muted)]">
                      {program.description}
                    </p>
                  </div>
                  {/* Actions */}
                  <div className="mt-auto flex items-center justify-between gap-4 pt-8">
                    <Link
                      to={program.path}
                      className="inline-flex items-center gap-2 border-b border-[var(--burgundy)] pb-1.5 text-sm font-semibold text-[var(--burgundy)] transition-colors duration-200 hover:border-[var(--charcoal)] hover:text-[var(--charcoal)]"
                    >
                      {program.exploreLabel || 'Explore'}
                      <span aria-hidden="true">→</span>
                    </Link>

                    {program.adminWhatsapp && (
                      <a
                        href={`https://wa.me/${program.adminWhatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#1ebe5d]"
                      >
                        {program.contactLabel || 'Contact'}
                        <span aria-hidden="true">↗</span>
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="w-full bg-[var(--burgundy)] px-6 py-[90px] max-[680px]:px-5 max-[680px]:py-[65px] md:px-10">
        <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-10 max-[800px]:flex-col max-[800px]:items-start">
          <h2 className="max-w-[700px] text-[clamp(34px,4vw,54px)] font-semibold leading-[1.08] tracking-[-0.025em] text-[var(--warm-white)]">
            Ready to begin your journey with MWS?
          </h2>

          <Link
            to="/contact"
            className="inline-flex min-h-12 shrink-0 items-center gap-3 bg-[var(--warm-white)] px-7 py-3.5 text-sm font-semibold text-[var(--burgundy)] transition-colors duration-200 hover:bg-white"
          >
            Book a Tour
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
