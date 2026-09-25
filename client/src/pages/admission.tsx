import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import { contactPageApi } from '@/api/contactPageApi';
import { pageApi, type AdmissionProgramData } from '@/api/pageApi';
import ContentBreadcrumb from '@/components/ui/ContentBreadcrumb';
import { asset } from '@/data/site';
import {
  defaultContactPageContent,
  type ContactPageContent,
  withContactPageFallback,
} from '@/features/contact/contactPageData';

const admissionsMessage =
  'Hello MWS Admissions Team, I would like to ask about admissions. Could you please help me with the next steps?';

const fallbackPrograms: AdmissionProgramData[] = [
  {
    id: 'kindergarten',
    title: 'Kindergarten',
    age: 'Age 2-6',
    description:
      'A nurturing first step into learning, where children build curiosity, confidence, communication, and positive relationships through meaningful experiences.',
    image: asset('Kindergarten.jpg'),
    path: '/academic/kindergarten',
    adminWhatsapp: '6281211112222',
    contactLabel: 'Contact Admissions',
    exploreLabel: 'Explore',
  },
  {
    id: 'elementary',
    title: 'Elementary',
    age: 'Age 6-12',
    description:
      'A stage for building strong academic foundations while developing independence, creativity, collaboration, and a deeper understanding of the world.',
    image: asset('Elementary.jpg'),
    path: '/academic/elementary',
    adminWhatsapp: '6281211112222',
    contactLabel: 'Contact Admissions',
    exploreLabel: 'Explore',
  },
  {
    id: 'high-school',
    title: 'High School',
    age: 'Age 12-15',
    description:
      'The secondary pathway helps students strengthen academic confidence, leadership, and readiness for more independent learning.',
    image: asset('JH.jpg'),
    path: '/academic/high-school',
    adminWhatsapp: '6281211112222',
    contactLabel: 'Contact Admissions',
    exploreLabel: 'Explore',
  },
];

const applicationSteps = [
  {
    number: '01',
    title: 'Start a conversation',
    description:
      'Contact admissions or book a school tour so our team can understand your family, preferred level, and timeline.',
  },
  {
    number: '02',
    title: 'Visit the campus',
    description:
      'Meet the admissions team, explore the learning environment, and discuss the program that best fits your child.',
  },
  {
    number: '03',
    title: 'Submit documents',
    description:
      'Share the required student and family documents for review by the school administration team.',
  },
  {
    number: '04',
    title: 'Confirm enrollment',
    description:
      'After review and confirmation, our team will guide you through final enrollment and onboarding details.',
  },
];

function whatsappNumber(value: string) {
  return value.replace(/\D/g, '');
}

function admissionWhatsappHref(contactContent: ContactPageContent) {
  const number = whatsappNumber(contactContent.directContacts.whatsapp);
  return `https://wa.me/${number}?text=${encodeURIComponent(admissionsMessage)}`;
}

export default function Admission() {
  const [admissionPrograms, setAdmissionPrograms] =
    useState<AdmissionProgramData[]>(fallbackPrograms);
  const [contactContent, setContactContent] = useState<ContactPageContent>(
    defaultContactPageContent,
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    pageApi
      .admissions()
      .then((data) => {
        if (!isMounted) return;
        setAdmissionPrograms(data.programs.length ? data.programs : fallbackPrograms);
        setLoadError(null);
      })
      .catch((error) => {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : 'Unable to load admissions content.');
      });

    contactPageApi
      .publicContactPage()
      .then((page) => {
        if (isMounted) setContactContent(withContactPageFallback(page.content));
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  const contactAdmissionsHref = useMemo(
    () => admissionWhatsappHref(contactContent),
    [contactContent],
  );

  return (
    <main>
      {loadError && (
        <p className="sr-only" role="status">
          {loadError}
        </p>
      )}

      <section className="w-full bg-white px-6 py-[96px] max-[680px]:px-5 max-[680px]:py-[68px] md:px-10 md:py-[118px]">
        <div className="mx-auto grid w-full max-w-[1240px] grid-cols-[0.9fr_1.1fr] items-center gap-14 max-[900px]:grid-cols-1 max-[900px]:gap-9">
          <div className="max-w-[620px]">
            <h1 className="text-[clamp(44px,5.4vw,78px)] font-semibold leading-[0.98] tracking-[-0.035em] text-[var(--charcoal)]">
              Start Your Journey at MWS
            </h1>

            <p className="mt-7 text-base leading-[1.85] text-[var(--charcoal)] md:text-lg">
              Choosing a school is a meaningful family decision. Millennia World School
              welcomes families who are looking for a caring environment where students can
              grow academically, socially, and personally.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/book-a-tour"
                className="inline-flex items-center gap-2 bg-[var(--burgundy)] px-6 py-3 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
              >
                Book a Tour
                <ArrowUpRight size={16} strokeWidth={1.8} />
              </Link>

              <a
                href={contactAdmissionsHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-[rgba(36,23,24,0.18)] px-6 py-3 text-sm font-semibold text-[var(--charcoal)] transition-colors duration-200 hover:border-[var(--burgundy)] hover:text-[var(--burgundy)]"
              >
                <MessageCircle size={17} strokeWidth={1.8} />
                Contact Admissions
              </a>
            </div>
          </div>

          <div className="overflow-hidden border border-[rgba(36,23,24,0.1)] bg-[var(--warm-white)]">
            <img
              src={asset('DSC04079.jpg')}
              alt="Students and families at Millennia World School"
              className="block aspect-[5/4] w-full object-cover max-[900px]:aspect-[16/10]"
            />
          </div>
        </div>
      </section>

      <ContentBreadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Admission' }]} />

      <section className="w-full bg-[var(--warm-white)] px-6 py-[88px] max-[680px]:px-5 max-[680px]:py-[62px] md:px-10">
        <div className="mx-auto grid w-full max-w-[1240px] grid-cols-[0.78fr_1.22fr] gap-14 max-[900px]:grid-cols-1 max-[900px]:gap-8">
          <div>
            <h2 className="max-w-[480px] text-[clamp(34px,4vw,54px)] font-semibold leading-[1.04] tracking-[-0.03em] text-[var(--charcoal)]">
              Admission Information
            </h2>
          </div>

          <div className="grid gap-7">
            <p className="max-w-[760px] text-base leading-[1.85] text-[var(--charcoal)] md:text-lg">
              Our admissions team supports each family personally. We help you understand
              the available programs, visit options, document requirements, and the most
              suitable entry pathway for your child.
            </p>

            <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
              {admissionPrograms.map((program) => (
                <Link
                  key={program.id}
                  to={program.path}
                  className="group border border-[rgba(36,23,24,0.12)] bg-white p-5 transition-colors duration-200 hover:border-[var(--burgundy)]"
                >
                  <h3 className="text-lg font-semibold leading-tight text-[var(--charcoal)]">
                    {program.title}
                  </h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold)]">
                    {program.age}
                  </p>
                  <p className="mt-4 text-sm leading-[1.7] text-[var(--charcoal-muted)]">
                    {program.description}
                  </p>
                  <span className="mt-5 inline-flex text-sm font-semibold text-[var(--burgundy)]">
                    {program.exploreLabel || 'Explore'} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-white px-6 py-[92px] max-[680px]:px-5 max-[680px]:py-[64px] md:px-10">
        <div className="mx-auto w-full max-w-[1240px]">
          <h2 className="max-w-[620px] text-[clamp(34px,4vw,54px)] font-semibold leading-[1.04] tracking-[-0.03em] text-[var(--charcoal)]">
            How to Apply
          </h2>

          <div className="mt-12 grid grid-cols-4 gap-5 max-[1100px]:grid-cols-2 max-[680px]:grid-cols-1">
            {applicationSteps.map((step) => (
              <article key={step.number} className="border-t border-[var(--gold)] pt-5">
                <p className="text-sm font-semibold text-[var(--burgundy)]">{step.number}</p>
                <h3 className="mt-5 text-xl font-semibold leading-tight text-[var(--charcoal)]">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-[1.75] text-[var(--charcoal-muted)]">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-[var(--warm-white)] px-6 py-[88px] max-[680px]:px-5 max-[680px]:py-[62px] md:px-10">
        <div className="mx-auto grid w-full max-w-[1240px] grid-cols-2 gap-6 max-[900px]:grid-cols-1">
          <article className="border border-[rgba(36,23,24,0.12)] bg-white p-8 md:p-10">
            <h2 className="text-[clamp(28px,3vw,40px)] font-semibold leading-tight tracking-[-0.02em] text-[var(--charcoal)]">
              Requirements / Eligibility
            </h2>
            <ul className="mt-7 grid gap-4 text-sm leading-[1.75] text-[var(--charcoal-muted)]">
              <li>Student age or grade placement should align with the selected program level.</li>
              <li>Previous school records may be requested for transferring students.</li>
              <li>Families may be invited for a conversation with the admissions team.</li>
              <li>Final placement is confirmed after document review and school guidance.</li>
            </ul>
          </article>

          <article className="border border-[rgba(36,23,24,0.12)] bg-white p-8 md:p-10">
            <h2 className="text-[clamp(28px,3vw,40px)] font-semibold leading-tight tracking-[-0.02em] text-[var(--charcoal)]">
              Important Information
            </h2>
            <p className="mt-7 text-sm leading-[1.8] text-[var(--charcoal-muted)]">
              Admission conversations and school tours are arranged manually by our team.
              Please contact admissions before visiting so we can prepare the right schedule,
              program information, and guidance for your family.
            </p>
            <p className="mt-5 text-sm leading-[1.8] text-[var(--charcoal-muted)]">
              Required documents, assessment steps, and enrollment timing may vary depending
              on the student level and current school calendar.
            </p>
          </article>
        </div>
      </section>

      <section className="w-full bg-[var(--burgundy)] px-6 py-[90px] max-[680px]:px-5 max-[680px]:py-[65px] md:px-10">
        <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-10 max-[800px]:flex-col max-[800px]:items-start">
          <h2 className="max-w-[720px] text-[clamp(34px,4vw,54px)] font-semibold leading-[1.08] tracking-[-0.025em] text-[var(--warm-white)]">
            Ready to take the next step with MWS?
          </h2>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <Link
              to="/book-a-tour"
              className="inline-flex min-h-12 items-center gap-3 bg-[var(--warm-white)] px-7 py-3.5 text-sm font-semibold text-[var(--burgundy)] transition-colors duration-200 hover:bg-white"
            >
              Book a Tour
              <span aria-hidden="true">→</span>
            </Link>

            <a
              href={contactAdmissionsHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center gap-3 border border-[rgba(255,255,255,0.45)] px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-[var(--burgundy)]"
            >
              Contact Admissions
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
