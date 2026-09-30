import { useState } from 'react';
import { Link } from 'react-router-dom';
import { programCards } from '../../data/site';
import DecorativeDoodles from './DecorativeDoodles';

type ProgramAcademicItem = {
  id: string;
  title: string;
  age: string;
  text?: string;
  description?: string;
  image: string;
  path: string;
};

type ProgramAcademicProps = {
  programs?: ProgramAcademicItem[];
};

const defaultPrograms: ProgramAcademicItem[] = programCards;

function getSelectorLabel(program: ProgramAcademicItem) {
  if (program.id === 'high-school' && program.title === 'High School') {
    return 'Junior High';
  }

  return program.title;
}

export default function ProgramAcademic({ programs = defaultPrograms }: ProgramAcademicProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const items = programs.length ? programs : defaultPrograms;
  const selectedIndex = activeIndex < items.length ? activeIndex : 0;
  const activeProgram = items[selectedIndex] ?? items[0];

  return (
    <section
      id="academic-programs"
      aria-labelledby="classes-title"
      className="w-full bg-white px-5 py-[64px] sm:px-6 sm:py-[76px] md:px-7 md:py-[100px]"
    >
      <div className="relative isolate mx-auto w-full max-w-[1600px] overflow-hidden py-6 sm:py-8 md:px-10 md:py-[60px]">
        <DecorativeDoodles />

        {/* Heading */}
        <div className="relative z-10 mb-8 text-center sm:mb-10 md:mb-12">
          <h2
            id="classes-title"
            className="mx-auto max-w-[820px] text-[44px] font-semibold leading-[1.2] text-[var(--charcoal)] max-[680px]:text-[clamp(28px,9vw,34px)]"
          >
            Programs for every learning stage
          </h2>
        </div>

        {/* Desktop and tablet accordion */}
        <div className="relative z-10 flex h-[560px] w-full overflow-hidden border bg-[var(--charcoal)] max-[980px]:h-[500px] max-[680px]:hidden">
          {items.map((program, index) => {
            const isActive = index === selectedIndex;
            const description = program.text ?? program.description ?? '';
            const selectorLabel = getSelectorLabel(program);

            return (
              <article
                key={program.id}
                className={`group relative overflow-hidden transition-[flex] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  isActive ? 'flex-[5]' : 'flex-[1]'
                }`}
              >
                {/* Image */}
                <img
                  src={program.image}
                  alt={program.title}
                  className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                    isActive
                      ? 'scale-100 brightness-[0.8]'
                      : 'scale-[1.02] brightness-[0.55] grayscale-[0.1]'
                  } group-hover:scale-[1.03]`}
                />

                {/* Overlay */}
                <div
                  className={`pointer-events-none absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${
                    isActive ? 'bg-black/10' : 'bg-black/30'
                  }`}
                />

                {/* Collapsed */}
                {!isActive && (
                  <button
                    type="button"
                    aria-label={`Open ${selectorLabel}`}
                    aria-expanded={false}
                    onClick={() => setActiveIndex(index)}
                    className="absolute inset-0 z-20 flex h-full w-full cursor-pointer items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-white"
                  >
                    <span className="rotate-180 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-transform duration-500 [writing-mode:vertical-rl] group-hover:tracking-[0.25em] motion-reduce:transition-none">
                      {selectorLabel}
                    </span>
                  </button>
                )}

                {/* Active Content */}
                {isActive && (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                    <div className="absolute bottom-0 left-0 z-10 w-full p-8 md:p-10 lg:p-14">
                      <div className="max-w-[560px] text-white">
                        <h3 className="text-4xl font-semibold leading-[1] tracking-tight text-white md:text-5xl lg:text-6xl">
                          {program.title}
                        </h3>

                        <span className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                          {program.age}
                        </span>

                        <p className="mt-5 max-w-[500px] text-sm leading-7 text-white/85 md:text-[15px]">
                          {description}
                        </p>

                        <Link
                          to={program.path}
                          className="mt-7 inline-flex items-center gap-3 border-b border-white/60 pb-2 text-sm font-semibold text-white transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
                        >
                          Learn More
                          <span>→</span>
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>

        {/* Mobile program cards */}
        <div className="relative z-10 grid grid-cols-1 gap-5 min-[681px]:hidden">
          {items.map((program) => {
            const description = program.text ?? program.description ?? '';

            return (
              <article
                key={program.id}
                className="overflow-hidden border border-[rgba(36,23,24,0.14)] bg-white"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[var(--charcoal)]">
                  <img
                    src={program.image}
                    alt={program.title}
                    className="h-full w-full object-cover"
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                  <div className="absolute bottom-0 left-0 p-5">
                    <h3 className="text-[clamp(28px,9vw,40px)] font-semibold leading-none tracking-tight text-white">
                      {program.title}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="px-5 py-5 sm:px-6 sm:py-6">
                  <span className="text-[var(--charcoal)]/60 block text-[11px] font-semibold uppercase tracking-[0.18em]">
                    {program.age}
                  </span>

                  <p className="text-[var(--charcoal)]/75 mt-3 text-sm leading-7">{description}</p>

                  <Link
                    to={program.path}
                    className="border-[var(--charcoal)]/40 mt-5 inline-flex items-center gap-3 border-b pb-2 text-sm font-semibold text-[var(--charcoal)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
                  >
                    Learn More
                    <span>→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
