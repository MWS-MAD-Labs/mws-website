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

export default function ProgramAcademic({ programs = defaultPrograms }: ProgramAcademicProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const items = programs.length ? programs : defaultPrograms;

  return (
    <section
      id="academic-programs"
      aria-labelledby="classes-title"
      className="w-full bg-white px-7 py-[100px] max-[680px]:px-5 max-[680px]:py-[60px]"
    >
      <div className="relative mx-auto w-full max-w-[1600px] overflow-hidden px-[40px] py-[60px] ">
        <DecorativeDoodles/>
        {/* Heading */}
        <div className="mb-10 text-center">
          <h2
            id="classes-title"
            className="text-[44px] font-semibold leading-[1.2] text-[var(--charcoal)] max-[680px]:text-[clamp(28px,9vw,34px)]"
          >
            Programs for every learning stage
          </h2>
        </div>

        {/* Programs */}
        <div className="flex h-[560px] w-full overflow-hidden border bg-[var(--charcoal)] max-[980px]:h-[500px] max-[680px]:h-auto max-[680px]:flex-col">
          {items.map((program, index) => {
            const isActive = index === activeIndex;
            const description = program.text ?? program.description ?? "";

            return (
              <article
                key={program.id}
                className={`group relative overflow-hidden transition-[flex] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] max-[680px]:flex-none ${
                  isActive ? 'flex-[5]' : 'flex-[1]'
                }`}
              >
                {/* Image */}
                <img
                  src={program.image}
                  alt={program.title}
                  className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isActive
                      ? 'scale-100 brightness-[0.8]'
                      : 'scale-[1.02] brightness-[0.55] grayscale-[0.1]'
                  } group-hover:scale-[1.03]`}
                />

                {/* Overlay */}
                <div
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    isActive ? 'bg-black/10' : 'bg-black/30'
                  }`}
                />

                {/* Collapsed */}
                {!isActive && (
                  <button
                    type="button"
                    aria-label={`Open ${program.title}`}
                    aria-expanded={false}
                    onClick={() => setActiveIndex(index)}
                    className="absolute inset-0 z-10 flex h-full w-full cursor-pointer items-center justify-center"
                  >
                    <span className="rotate-180 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-transform duration-500 [writing-mode:vertical-rl] group-hover:tracking-[0.25em]">
                      {program.title}
                    </span>
                  </button>
                )}

                {/* Active Content */}
                {isActive && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

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
      </div>
    </section>
  );
}
