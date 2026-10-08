import { useEffect, useState } from 'react';

import { pageApi, type AdmissionFaqPageData } from '@/api/pageApi';
import ContentBreadcrumb from '@/components/ui/ContentBreadcrumb';
import FaqSection from '@/components/ui/FaqSection';
import SubpageHero from '@/components/ui/SubpageHero';
import { asset } from '../data/site';

const fallbackData: AdmissionFaqPageData = {
  title: 'Admission FAQ',
  description: 'Answers to common questions families ask before joining Millennia World School.',
  items: [],
};

export default function AdmissionFaqPage() {
  const [data, setData] = useState<AdmissionFaqPageData>(fallbackData);
  const [isLoading, setIsLoading] = useState(true);
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
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main>
      <SubpageHero
        title={data.title}
        image={asset('DSC05350.jpg')}
        imageAlt="Admission FAQ at Millennia World School"
      />

      <ContentBreadcrumb
        items={[
          { label: 'Home', path: '/' },
          { label: 'Admission', path: '/admission' },
          { label: 'FAQ' },
        ]}
      />

      {isLoading ? (
        <section className="bg-[var(--warm-white)] px-6 py-[90px] max-[680px]:px-5 md:px-10">
          <div className="mx-auto w-full max-w-[1240px] border border-[var(--border)] bg-white px-6 py-10 text-center text-base text-[var(--charcoal-muted)]" role="status">
            Loading admission FAQ...
          </div>
        </section>
      ) : loadError ? (
        <section className="bg-[var(--warm-white)] px-6 py-[90px] max-[680px]:px-5 md:px-10">
          <div className="mx-auto w-full max-w-[1240px] border border-[var(--border)] bg-white px-6 py-10 text-center text-base text-[var(--charcoal-muted)]" role="alert">
            Unable to load admission FAQ right now. Please try again later.
          </div>
        </section>
      ) : data.items.length ? (
        <FaqSection
          title="Frequently asked questions"
          description={data.description}
          items={data.items}
        />
      ) : (
        <section className="bg-[var(--warm-white)] px-6 py-[90px] max-[680px]:px-5 md:px-10">
          <div className="mx-auto w-full max-w-[1240px] border border-[var(--border)] bg-white px-6 py-10 text-center text-base text-[var(--charcoal-muted)]">
            No admission FAQ is published yet.
          </div>
        </section>
      )}
    </main>
  );
}
