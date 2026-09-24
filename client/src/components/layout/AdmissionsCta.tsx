import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type CtaAction = {
  label: string;
  to: string;
};

type AdmissionsCtaProps = {
  headline: string;
  primary: CtaAction;
  secondary?: CtaAction;
};

export default function AdmissionsCta({ headline, primary, secondary }: AdmissionsCtaProps) {
  return (
    <section
      id="admissions-cta"
      aria-labelledby="admissions-cta-title"
      className="w-full bg-[var(--burgundy)] px-6 py-[96px] max-[680px]:px-5 max-[680px]:py-[72px] md:px-10 md:py-[104px]"
    >
      <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-12 max-[900px]:flex-col max-[900px]:items-start max-[900px]:gap-8">
        {/* Content */}
        <div className="max-w-[620px]">
          <h2
            id="admissions-cta-title"
            className="text-balance text-[clamp(34px,4.2vw,56px)] font-semibold leading-[1.08] tracking-[-0.025em] text-[var(--warm-white)]"
          >
            {headline}
          </h2>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap items-center gap-3 max-[680px]:w-full max-[680px]:flex-col max-[680px]:items-stretch">
          <Link
            to={primary.to}
            className="inline-flex min-h-12 items-center justify-center gap-3 bg-[var(--warm-white)] px-7 py-3.5 text-sm font-semibold text-[var(--burgundy)] transition-colors duration-200 hover:bg-white"
          >
            {primary.label}
            <span aria-hidden="true"><ArrowRight/></span>
          </Link>

          {secondary && (
            <Link
              to={secondary.to}
              className="inline-flex min-h-12 items-center justify-center gap-3 border border-white/45 px-7 py-3.5 text-sm font-semibold text-[var(--warm-white)] transition-colors duration-200 hover:border-white hover:bg-white/10"
            >
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
