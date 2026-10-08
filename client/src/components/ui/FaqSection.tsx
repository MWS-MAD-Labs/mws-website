import { useId, useState } from 'react';
import DOMPurify from 'dompurify';

type FaqItem = {
  question: string;
  answer: string;
};

type FaqSectionProps = {
  id?: string;
  title?: string;
  description?: string;
  items: FaqItem[];
};

export default function FaqSection({
  id,
  title = 'Frequently Asked Questions',
  description,
  items,
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section
      id={id}
      className="w-full bg-[var(--warm-white)] px-6 py-[90px] max-[680px]:px-5 max-[680px]:py-[65px] md:px-10 md:py-[110px]"
    >
      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-[360px_minmax(0,1fr)] items-start gap-16 max-[980px]:grid-cols-1 max-[980px]:gap-10">
        {/* Intro */}
        <div className="min-[981px]:sticky min-[981px]:top-28">
          <span className="mb-4 block h-[3px] w-12 bg-[var(--gold)]" />
          <h2 className="m-0 text-[clamp(30px,3.5vw,44px)] font-bold leading-[1.15] text-[var(--charcoal)]">
            {title}
          </h2>
          {description ? (
            <p className="mb-0 mt-4 text-base leading-[1.8] text-[var(--charcoal-muted)]">
              {description}
            </p>
          ) : null}
        </div>

        {/* Accordion */}
        <div className="border-t border-[var(--border)]">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            const buttonId = `${baseId}-q-${index}`;
            const panelId = `${baseId}-a-${index}`;

            return (
              <div key={`${index}-${item.question}`} className="border-b border-[var(--border)]">
                <h3 className="m-0">
                  <button
                    id={buttonId}
                    type="button"
                    className="group flex w-full cursor-pointer items-center justify-between gap-6 border-0 bg-transparent py-6 text-left max-[680px]:py-5"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                  >
                    <span
                      className={`text-base font-semibold leading-snug transition-colors duration-200 md:text-lg ${
                        isOpen
                          ? 'text-[var(--burgundy)]'
                          : 'text-[var(--charcoal)] group-hover:text-[var(--burgundy)]'
                      }`}
                    >
                      {item.question}
                    </span>

                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center text-xl font-light leading-none transition-all duration-300 ${
                        isOpen
                          ? 'rotate-45 text-[var(--burgundy)]'
                          : 'group-hover:bg-[var(--burgundy)]/10 text-[var(--burgundy)]'
                      }`}
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  aria-hidden={!isOpen}
                  className={`grid transition-[grid-template-rows,opacity,visibility] duration-300 ${
                    isOpen
                      ? 'visible grid-rows-[1fr] opacity-100'
                      : 'invisible grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div
                      className="public-rich-text max-w-[720px] pb-7 pr-12 text-[15px] leading-7 text-[var(--charcoal-muted)] max-[680px]:pr-0"
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
