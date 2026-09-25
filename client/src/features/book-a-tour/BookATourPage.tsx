import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import { contactPageApi } from '@/api/contactPageApi';
import {
  defaultContactPageContent,
  type ContactPageContent,
  withContactPageFallback,
} from '@/features/contact/contactPageData';
import { asset } from '@/data/site';

const tourMessage =
  'Hello MWS Admissions Team, I would like to book a school tour. Could you please help me with the available schedule?';

function whatsappNumber(value: string) {
  return value.replace(/\D/g, '');
}

export default function BookATourPage() {
  const [contactContent, setContactContent] = useState<ContactPageContent>(
    defaultContactPageContent,
  );

  useEffect(() => {
    let cancelled = false;

    contactPageApi
      .publicContactPage()
      .then((page) => {
        if (!cancelled) {
          setContactContent(withContactPageFallback(page.content));
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  const whatsappHref = useMemo(() => {
    const number = whatsappNumber(contactContent.directContacts.whatsapp);
    return `https://wa.me/${number}?text=${encodeURIComponent(tourMessage)}`;
  }, [contactContent.directContacts.whatsapp]);

  return (
    <main>
      <section className="w-full bg-white px-6 py-[96px] max-[680px]:px-5 max-[680px]:py-[68px] md:px-10 md:py-[118px]">
        <div className="mx-auto grid w-full max-w-[1240px] grid-cols-[0.92fr_1.08fr] items-center gap-14 max-[900px]:grid-cols-1 max-[900px]:gap-9">
          <div className="max-w-[600px]">
            <h1 className="text-[clamp(44px,5.4vw,78px)] font-semibold leading-[0.98] tracking-[-0.035em] text-[var(--charcoal)]">
              Plan Your Visit to MWS
            </h1>

            <p className="mt-7 text-base leading-[1.85] text-[var(--charcoal)] md:text-lg">
              Visiting campus is the best way to understand the rhythm of school life at
              Millennia World School. Meet our admissions team, explore the learning
              environment, and ask the questions that matter most to your family.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[var(--burgundy)] px-6 py-3 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
              >
                <MessageCircle size={17} strokeWidth={1.8} />
                Book Your Tour
              </a>

              <Link
                to="/admission"
                className="inline-flex items-center gap-2 border border-[rgba(36,23,24,0.18)] px-6 py-3 text-sm font-semibold text-[var(--charcoal)] transition-colors duration-200 hover:border-[var(--burgundy)] hover:text-[var(--burgundy)]"
              >
                Admission Information
                <ArrowUpRight size={16} strokeWidth={1.8} />
              </Link>
            </div>
          </div>

          <div className="overflow-hidden border border-[rgba(36,23,24,0.1)] bg-[var(--warm-white)]">
            <img
              src={asset('DSC04079.jpg')}
              alt="Millennia World School campus visit"
              className="block aspect-[5/4] w-full object-cover max-[900px]:aspect-[16/10]"
            />
          </div>
        </div>
      </section>

      <section className="w-full bg-[var(--warm-white)] px-6 py-[90px] max-[680px]:px-5 max-[680px]:py-[64px] md:px-10">
        <div className="mx-auto grid w-full max-w-[1240px] grid-cols-[0.78fr_1.22fr] gap-14 max-[900px]:grid-cols-1 max-[900px]:gap-8">
          <div>
            <h2 className="max-w-[460px] text-[clamp(34px,4vw,54px)] font-semibold leading-[1.04] tracking-[-0.03em] text-[var(--charcoal)]">
              How to Book Your Tour
            </h2>
          </div>

          <div className="grid gap-6 text-[var(--charcoal)]">
            <p className="max-w-[720px] text-base leading-[1.85] md:text-lg">
              Tour scheduling is handled directly by our admissions team through WhatsApp.
              Send us a message and we will help confirm available visit times, answer
              initial questions, and guide you through the next admission steps.
            </p>

            <div className="grid gap-4 border-t border-[rgba(36,23,24,0.16)] pt-7 md:grid-cols-3">
              {[
                ['01', 'Message admissions through WhatsApp.'],
                ['02', 'Share your preferred visit date and student level.'],
                ['03', 'Our team confirms the available schedule manually.'],
              ].map(([number, text]) => (
                <div key={number} className="border-l border-[var(--gold)] pl-4">
                  <p className="text-sm font-semibold text-[var(--burgundy)]">{number}</p>
                  <p className="mt-2 text-sm leading-[1.75] text-[var(--charcoal-muted)]">
                    {text}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-[var(--burgundy)] px-6 py-3 text-sm font-semibold text-[var(--burgundy)] transition-colors duration-200 hover:bg-[var(--burgundy)] hover:text-white"
              >
                Book Your Tour
                <ArrowUpRight size={16} strokeWidth={1.8} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-white px-6 py-[84px] max-[680px]:px-5 max-[680px]:py-[60px] md:px-10">
        <div className="mx-auto grid w-full max-w-[1240px] grid-cols-3 gap-6 max-[900px]:grid-cols-1">
          {[
            ['Tour focus', 'Campus environment, learning spaces, school routines, and admissions questions.'],
            ['Who to bring', 'Parents or guardians are welcome to bring the prospective student when possible.'],
            ['Before visiting', 'Please wait for admissions confirmation before coming to campus.'],
          ].map(([title, text]) => (
            <article key={title} className="border border-[rgba(36,23,24,0.12)] p-7">
              <h3 className="text-xl font-semibold leading-tight text-[var(--charcoal)]">
                {title}
              </h3>
              <p className="mt-4 text-sm leading-[1.75] text-[var(--charcoal-muted)]">
                {text}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
