import { useEffect, useState } from 'react';

import { pageApi, type AdmissionFaqPageData } from '@/api/pageApi';
import ContentBreadcrumb from '@/components/ui/ContentBreadcrumb';
import FaqSection from '@/components/ui/FaqSection';

const fallbackData: AdmissionFaqPageData = {
  title: 'Admission FAQ',
  description: 'Answers to common questions families ask before joining Millennia World School.',
  items: [],
};

export default function AdmissionFaqPage() {
  const [data, setData] = useState<AdmissionFaqPageData>(fallbackData);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    pageApi
      .admissionFaq()
      .then((nextData) => {
        if (!mounted) return;
        setData(nextData);
        setLoadError(null);
      })
      .catch((error) => {
        if (!mounted) return;
        setLoadError(error instanceof Error ? error.message : 'Unable to load admission FAQ.');
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main>
      {loadError ? (
        <p className="sr-only" role="status">
          {loadError}
        </p>
      ) : null}

      <section className="bg-[var(--warm-white)] pt-28 md:pt-36">
        <div className="mx-auto w-full max-w-[1100px] px-5 sm:px-6 md:px-10">
          <ContentBreadcrumb
            items={[
              { label: 'Home', path: '/' },
              { label: 'Admission', path: '/admission' },
              { label: 'FAQ' },
            ]}
          />
          <div className="max-w-[760px] py-10 md:py-16">
            <h1 className="text-[clamp(38px,8vw,72px)] font-semibold leading-none text-[var(--charcoal)]">
              {data.title}
            </h1>
            <p className="mt-5 text-base leading-7 text-[var(--charcoal-muted)] md:text-lg">
              {data.description}
            </p>
          </div>
        </div>
      </section>

      {data.items.length ? (
        <FaqSection items={data.items} />
      ) : (
        <section className="bg-[var(--warm-white)] py-20">
          <div className="mx-auto w-full max-w-[1000px] px-5 text-sm text-[var(--charcoal-muted)] sm:px-6 md:px-10">
            No admission FAQ is published yet.
          </div>
        </section>
      )}
    </main>
  );
}
