import { ArrowUpRight } from 'lucide-react';

import type { AdmissionStepItem } from '@/features/admissions/admissionPageData';
import { focusRing, stepFallbackImages } from '@/features/admissions/admissionPublicConfig';

type AdmissionProcessProps = {
  steps: AdmissionStepItem[];
  title: string;
};

type AdmissionStepCardProps = {
  index: number;
  step: AdmissionStepItem;
};

function AdmissionStepCard({ index, step }: AdmissionStepCardProps) {
  const image = step.image || stepFallbackImages[index % stepFallbackImages.length];

  return (
    <li>
      <article
        className={`group relative isolate flex min-h-[450px] w-full items-end overflow-hidden bg-[var(--charcoal)] text-white ${focusRing}`}
      >
        <picture className="absolute inset-0 -z-20 block h-full w-full">
          <img
            src={image}
            alt={step.imageAlt || ''}
            loading="lazy"
            className="block h-full w-full scale-100 object-cover object-center blur-0 transition-all duration-1000 [transition-timing-function:cubic-bezier(.34,.615,.4,.985)] group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transition-none"
          />
        </picture>

        {/* Base shade */}
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
        />

        {/* Darker shade on hover/focus */}
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
        />

        {/* Step number */}
        <span
          aria-hidden="true"
          className="absolute left-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white text-sm font-semibold text-[var(--burgundy)]"
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="block w-full p-5 sm:p-7 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <h3 className="block text-xl text-white font-semibold leading-snug sm:text-2xl">{step.title}</h3>

            <ArrowUpRight size={22} aria-hidden="true" className="shrink-0" />
          </div>

          <div className="grid grid-rows-[1fr] opacity-100 transition-[grid-template-rows,opacity] duration-300 motion-reduce:transition-none [@media(hover:hover)]:grid-rows-[0fr] [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:grid-rows-[1fr] [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-visible:grid-rows-[1fr] [@media(hover:hover)]:group-focus-visible:opacity-100">
            <div className="overflow-hidden">
              {step.description ? (
                <p className="mt-3 block text-sm font-semibold text-white/90">{step.description}</p>
              ) : null}

              {step.detail ? (
                <p className="mt-3 block leading-7 text-white/90">{step.detail}</p>
              ) : null}
            </div>
          </div>
        </div>
      </article>
    </li>
  );
}

export default function AdmissionProcess({ steps, title }: AdmissionProcessProps) {
  if (!steps.length) return null;

  return (
    <section
      className="subpage-section bg-[var(--warm-white)]"
      aria-labelledby="admission-process-title"
    >
      <div className="wrap">
        <div className="pb-7 text-center md:pb-8">
          <div className="mx-auto w-fit border-b border-black/10 pb-7 md:pb-8">
            <h2
              id="admission-process-title"
              className="max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl"
            >
              {title}
            </h2>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8">
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {steps.map((step, index) => (
            <AdmissionStepCard key={`${step.title}-${index}`} index={index} step={step} />
          ))}
        </ol>
      </div>
    </section>
  );
}
