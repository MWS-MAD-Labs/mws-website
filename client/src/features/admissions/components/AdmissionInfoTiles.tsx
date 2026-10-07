import { type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { AdmissionInfoTile } from '@/features/admissions/admissionPageData';
import { focusRing } from '@/features/admissions/admissionPublicConfig';

const isExternal = (url: string) => /^(https?:|mailto:|tel:)/i.test(url);

function SmartLink({
  to,
  className,
  children,
}: {
  to: string;
  className?: string;
  children: ReactNode;
}) {
  return isExternal(to) ? (
    <a href={to} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}

type AdmissionInfoTilesProps = {
  tiles: AdmissionInfoTile[];
};

export default function AdmissionInfoTiles({ tiles }: AdmissionInfoTilesProps) {
  if (!tiles.length) return null;

  return (
    <section
      className="subpage-section border-t border-[var(--charcoal)]/20"
      aria-label="More admission information"
    >
      <ul className="wrap grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {tiles.map((tile, index) => (
          <li key={`${tile.title}-${index}`}>
            <SmartLink
              to={tile.linkUrl}
              className={`group relative isolate flex h-full min-h-[280px] items-end overflow-hidden bg-[var(--charcoal)] text-white sm:min-h-[340px] lg:min-h-[420px] ${focusRing}`}
            >
              {tile.image ? (
                <img
                  src={tile.image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-700 group-focus-visible:scale-105 group-hover:scale-105 motion-reduce:transition-none"
                />
              ) : null}

              {/* Base shade so the title is always readable, darker shade on hover */}
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
              />

              <span
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-black/50 opacity-0 transition-opacity duration-300 group-focus-visible:opacity-100 group-hover:opacity-100 motion-reduce:transition-none"
              />

              <span className="block w-full p-5 sm:p-7 md:p-8">
                <span className="flex items-center justify-between gap-4">
                  <span className="block text-xl font-semibold leading-snug sm:text-2xl">
                    {tile.title}
                  </span>

                  <ArrowUpRight size={22} aria-hidden="true" className="shrink-0" />
                </span>

                <span className="grid grid-rows-[1fr] opacity-100 transition-[grid-template-rows,opacity] duration-300 motion-reduce:transition-none [@media(hover:hover)]:grid-rows-[0fr] [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-visible:grid-rows-[1fr] [@media(hover:hover)]:group-focus-visible:opacity-100 [@media(hover:hover)]:group-hover:grid-rows-[1fr] [@media(hover:hover)]:group-hover:opacity-100">
                  <span className="block overflow-hidden">
                    <span className="mt-3 block leading-7 text-white/90">{tile.description}</span>

                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                      {tile.linkLabel}

                      <ArrowRight size={16} aria-hidden="true" />
                    </span>
                  </span>
                </span>
              </span>
            </SmartLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
