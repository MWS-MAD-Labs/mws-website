import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { Link } from 'react-router-dom';

import { pageApi, type AdmissionGuidelinesPageData } from '@/api/pageApi';
import ContentBreadcrumb from '@/components/ui/ContentBreadcrumb';

const fallbackData: AdmissionGuidelinesPageData = {
  title: 'Admission Guidelines',
  hero: {
    title: 'Admission Guidelines',
    description:
      'Review the requirements, documents, and next steps for joining Millennia World School.',
  },
  body:
    '<p>Our admissions team will guide your family through every step, from initial consultation to enrollment confirmation.</p>',
  checklist: [],
  documents: [],
  cta: {
    label: 'Message admissions',
    href: '/admission',
  },
};

export default function AdmissionGuidelinesPage() {
  const [data, setData] = useState<AdmissionGuidelinesPageData>(fallbackData);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    pageApi
      .admissionGuidelines()
      .then((nextData) => {
        if (!mounted) return;
        setData(nextData);
        setLoadError(null);
      })
      .catch((error) => {
        if (!mounted) return;
        setLoadError(
          error instanceof Error ? error.message : 'Unable to load admission guidelines.',
        );
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
              { label: data.title },
            ]}
          />
          <div className="max-w-[780px] py-10 md:py-16">
            <h1 className="text-[clamp(38px,8vw,72px)] font-semibold leading-none text-[var(--charcoal)]">
              {data.hero.title}
            </h1>
            <p className="mt-5 text-base leading-7 text-[var(--charcoal-muted)] md:text-lg">
              {data.hero.description}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto grid w-full max-w-[1100px] gap-10 px-5 sm:px-6 md:px-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article
            className="public-rich-text text-[var(--charcoal)]"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.body) }}
          />

          <aside className="space-y-6">
            {data.checklist.length ? (
              <section className="border-t border-[var(--border)] pt-5">
                <h2 className="text-base font-semibold text-[var(--charcoal)]">Checklist</h2>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--charcoal-muted)]">
                  {data.checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {data.documents.length ? (
              <section className="border-t border-[var(--border)] pt-5">
                <h2 className="text-base font-semibold text-[var(--charcoal)]">
                  Required documents
                </h2>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--charcoal-muted)]">
                  {data.documents.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <Link
              className="inline-flex items-center justify-center bg-[var(--burgundy)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--charcoal)]"
              to={data.cta.href}
            >
              {data.cta.label}
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
