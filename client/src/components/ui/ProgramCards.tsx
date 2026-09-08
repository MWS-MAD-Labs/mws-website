import { Link } from "react-router-dom";
import { programCards } from "../../data/site";

export default function ProgramCards() {
  return (
    <section
      className="bg-transparent px-0 py-[120px] max-[980px]:px-7 max-[980px]:py-[76px] max-[680px]:px-5 max-[680px]:py-[60px]"
      id="academic-programs"
      aria-labelledby="classes-title"
    >
      <div className="relative mx-auto max-w-full overflow-hidden px-[72px] py-[72px] before:absolute before:right-0 before:top-0 before:h-1 before:w-[180px] before:bg-[var(--gold)] before:content-[''] max-[980px]:px-6 max-[980px]:py-11 max-[680px]:px-4 max-[680px]:py-[30px]">
        <div className="mx-auto w-full max-w-[760px] text-center">
          <h2
            className="mx-auto mb-10 max-w-[800px] text-center text-[44px] font-semibold leading-[1.2] tracking-normal text-[var(--charcoal)] max-[680px]:text-[clamp(28px,9vw,34px)]"
            id="classes-title"
          >
            Programs for every learning stage
          </h2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-8 max-[980px]:gap-[22px] max-[680px]:grid-cols-1">
          {programCards.map((program, index) => (
            <article
              key={program.id}
              className={`group relative flex flex-col overflow-hidden border border-[var(--border)] bg-[var(--white)] transition-[transform,box-shadow,border-color] duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] before:absolute before:left-0 before:top-0 before:z-[3] before:h-[3px] before:w-full before:bg-[var(--burgundy)] before:opacity-100 before:transition-opacity before:duration-300 before:content-[''] hover:-translate-y-2 hover:border-[var(--border)] hover:shadow-[0_20px_40px_rgba(36,23,24,0.07)] ${
                index === 1 ? "delay-100" : ""
              } ${index === 2 ? "delay-200" : ""}`}
              id={program.id}
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--charcoal)]">
                <img
                  className="block h-full w-full object-cover transition-[transform,filter] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08] group-hover:brightness-95"
                  src={program.image}
                  alt={program.title}
                />
              </div>
              <div className="flex grow flex-col bg-[var(--white)] px-7 py-8 max-[980px]:px-[22px] max-[980px]:py-6 max-[430px]:px-[18px] max-[430px]:py-[22px]">
                <h3 className="mb-3 text-2xl font-semibold leading-[1.3] text-[var(--charcoal)] transition-colors duration-200 group-hover:text-[var(--burgundy)]">
                  {program.title}
                </h3>
                <span className="-mt-1 mb-4 inline-block self-start bg-transparent p-0 text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--burgundy)]">
                  {program.age}
                </span>
                <p className="mb-6 grow text-[15px] leading-[1.6] text-[var(--charcoal-muted)]">
                  {program.text}
                </p>
                <Link
                  className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-[var(--charcoal)] transition-colors duration-200 after:text-base after:transition-transform after:duration-[250ms] after:content-['→'] group-hover:text-[var(--burgundy)] group-hover:after:translate-x-1"
                  to={program.path}
                >
                  Learn More
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
