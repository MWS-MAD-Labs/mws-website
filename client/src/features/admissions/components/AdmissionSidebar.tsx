import { ArrowRight, ArrowUpRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { AdmissionProgramData } from '@/api/pageApi';
import { focusRing, primaryButton } from '@/features/admissions/admissionPublicConfig';

type AdmissionSidebarProps = {
  generalHref: string;
  menuTitle: string;
  programs: AdmissionProgramData[];
  readyTitle: string;
};

export default function AdmissionSidebar({
  generalHref,
  menuTitle,
  programs,
  readyTitle,
}: AdmissionSidebarProps) {
  return (
    <aside className="min-w-0 lg:sticky lg:top-28">
      <nav aria-label="Admission menu" className="border border-black/10 bg-white">
        <p className="border-b border-black/10 px-5 py-4 text-lg font-semibold">{menuTitle}</p>
        <ul>
          {programs.map((program) => (
            <li key={program.id} className="border-b border-black/10">
              <Link
                to={program.path}
                className={`group flex items-center justify-between gap-3 px-4 py-4 transition-colors hover:bg-black/[0.03] sm:px-5 ${focusRing}`}
              >
                <span>
                  <span className="block font-medium group-hover:text-[var(--burgundy)]">
                    {program.title}
                  </span>
                  {program.age ? (
                    <span className="block text-sm text-[var(--charcoal-muted)]">
                      {program.age}
                    </span>
                  ) : null}
                </span>
                <ArrowRight
                  size={16}
                  aria-hidden="true"
                  className="shrink-0 text-[var(--charcoal-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--burgundy)]"
                />
              </Link>
            </li>
          ))}
          <li>
            <Link
              to="/book-a-tour"
              className={`flex items-center justify-between gap-3 bg-[var(--warm-white)] px-5 py-4 font-semibold text-[var(--burgundy)] transition-colors hover:bg-black/[0.04] ${focusRing}`}
            >
              Book a tour
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </li>
        </ul>
      </nav>

      <div className="mt-5 border border-black/10 bg-white p-4 sm:mt-6 sm:p-5">
        <p className="text-lg font-semibold leading-snug">{readyTitle}</p>
        <a
          href={generalHref}
          target="_blank"
          rel="noreferrer"
          className={`${primaryButton} mt-5 w-full`}
        >
          <MessageCircle size={16} strokeWidth={1.8} aria-hidden="true" />
          Start your application
        </a>
      </div>
    </aside>
  );
}
