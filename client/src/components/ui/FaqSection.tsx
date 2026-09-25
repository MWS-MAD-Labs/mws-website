import { useState } from 'react';
import DOMPurify from 'dompurify';

type FaqItem = {
  question: string;
  answer: string;
};

type FaqSectionProps = {
  id?: string;
  items: FaqItem[];
};

export default function FaqSection({ id, items }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id={id} className="w-full bg-[var(--warm-white)] py-[96px] md:py-[120px]">
      <div className="mx-auto w-full max-w-[1000px] px-6 md:px-10">
        <h2 className="mb-12 text-[clamp(32px,4vw,48px)] font-semibold leading-[1.1] tracking-[-0.025em] text-[var(--charcoal)]">
          Frequently Asked Questions
        </h2>

        <div className="border-t border-[var(--border)]">
          {items.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={item.question} className="border-b border-[var(--border)]">
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-between gap-8 py-6 text-left"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="text-base font-semibold text-[var(--charcoal)] md:text-lg">
                    {item.question}
                  </span>

                  <span
                    className={`shrink-0 text-2xl font-light text-[var(--burgundy)] transition-transform duration-300 ${
                      isOpen ? 'rotate-45' : ''
                    }`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>

                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div
                      className="max-w-[760px] pb-6 text-[15px] leading-7 text-[var(--charcoal-muted)]"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(item.answer || ''),
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
