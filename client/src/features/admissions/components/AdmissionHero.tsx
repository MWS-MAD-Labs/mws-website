import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { AdmissionPageContent } from '@/features/admissions/admissionPageData';
import { focusRing } from '@/features/admissions/admissionPublicConfig';

type AdmissionHeroProps = {
  content: AdmissionPageContent;
  generalHref: string;
};

export default function AdmissionHero({ content, generalHref }: AdmissionHeroProps) {
  return (
    <section className="relative isolate flex min-h-[520px] items-end overflow-hidden bg-[var(--charcoal)] md:min-h-[560px]">
      <img
        src={content.heroImage}
        alt={content.heroImageAlt}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/35 to-black/10"
      />

      <div className="wrap w-full pb-10 pt-28 sm:pt-32 md:pb-16">
        <div className="max-w-3xl">
          <h1 className="text-[40px] font-semibold leading-[1.03] text-white sm:text-[52px] md:text-[64px] lg:text-[76px]">
            {content.heroTitle}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-white/90 md:text-lg">
            {content.heroSubtitle}
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            to="/book-a-tour"
            className={`inline-flex w-full items-center justify-center gap-2 bg-white px-6 py-3 text-sm font-semibold text-[var(--burgundy)] transition-colors hover:bg-[var(--warm-white)] sm:w-auto ${focusRing}`}
          >
            Book a tour
            <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
          </Link>

          <a
            href={generalHref}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex w-full items-center justify-center gap-2 border border-white/60 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-[var(--burgundy)] sm:w-auto ${focusRing}`}
          >
            <MessageCircle size={17} strokeWidth={1.8} aria-hidden="true" />
            Message admissions
          </a>
        </div>
      </div>
    </section>
  );
}
