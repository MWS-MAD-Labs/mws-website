import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

type InfoFilter = {
  label: string;
  value: string;
};

type InfoCard = {
  category: string;
  image: string;
  alt: string;
  title: string;
  tag: string;
  text: string;
  path: string;
  action: string;
};

type InfoSectionProps = {
  title: string;
  filters: InfoFilter[];
  cards: InfoCard[];
};


const ALL_FILTER_VALUE = 'all';

export default function InfoSection({ title, filters, cards }: InfoSectionProps) {
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER_VALUE);
  const slickListRef = useRef<HTMLDivElement>(null);
  const renderedFilters = [{ label: 'All', value: ALL_FILTER_VALUE }, ...filters];
  const visibleCards =
    activeFilter === ALL_FILTER_VALUE
      ? cards
      : cards.filter((card) => card.category === activeFilter);

  return (
    <section
      className="relative w-full translate-y-7 overflow-hidden bg-[var(--warm-white)] py-[120px] opacity-0 transition-[opacity,transform] duration-[900ms] ease-out data-[revealed=true]:translate-y-0 data-[revealed=true]:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none max-[980px]:py-[76px]"
      id="info-section"
      data-reveal
    >
      <svg
        className="pointer-events-none absolute -right-6 top-6 z-0 h-[624px] w-[480px] text-[var(--burgundy,#6b1f2a)] opacity-[0.22] max-[980px]:h-[390px] max-[980px]:w-[300px] max-[680px]:hidden"
        viewBox="0 0 400 520"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M390 510 Q330 300 60 40" />

        <g transform="translate(367 446)">
          <ellipse transform="rotate(-155)" cx="26" rx="26" ry="9" />
          <ellipse transform="rotate(-65)" cx="26" rx="26" ry="9" />
        </g>
        <g transform="translate(335 380)">
          <ellipse transform="rotate(-160)" cx="26" rx="26" ry="9" />
          <ellipse transform="rotate(-70)" cx="26" rx="26" ry="9" />
        </g>
        <g transform="translate(294 311)">
          <ellipse transform="rotate(-167)" cx="26" rx="26" ry="9" />
          <ellipse transform="rotate(-77)" cx="26" rx="26" ry="9" />
        </g>
        <g transform="translate(242 240)">
          <ellipse transform="rotate(-173)" cx="26" rx="26" ry="9" />
          <ellipse transform="rotate(-83)" cx="26" rx="26" ry="9" />
        </g>
        <g transform="translate(182 167)">
          <ellipse transform="rotate(-178)" cx="26" rx="26" ry="9" />
          <ellipse transform="rotate(-88)" cx="26" rx="26" ry="9" />
        </g>
        <g transform="translate(112 92)">
          <ellipse transform="rotate(-181)" cx="26" rx="26" ry="9" />
          <ellipse transform="rotate(-91)" cx="26" rx="26" ry="9" />
        </g>
        <ellipse transform="translate(60 40) rotate(-138)" cx="26" rx="26" ry="9" />
      </svg>

      <div className="relative z-[1] mx-auto max-w-[1240px] px-12 max-[980px]:w-[min(100%_-_40px,1240px)] max-[980px]:px-0 max-[680px]:w-[min(100%_-_32px,1240px)] max-[430px]:w-[min(100%_-_28px,1240px)]">
        <div className="mx-auto mb-10 max-w-[700px] text-center max-[680px]:mb-7 max-[680px]:text-left">
          <h2 className="text-[clamp(28px,3vw,40px)] tracking-normal text-[var(--charcoal)] max-[680px]:text-[clamp(28px,9vw,34px)]">
            {title}
          </h2>
        </div>

        <div className="mb-8 flex w-full items-center justify-between border-b border-[var(--border)] max-[980px]:flex-col max-[980px]:items-start max-[980px]:gap-4">
          <div
            className="flex flex-wrap items-center justify-center gap-9 max-[980px]:w-full max-[980px]:flex-nowrap max-[980px]:justify-start max-[980px]:gap-5 max-[980px]:overflow-x-auto max-[980px]:pb-0.5 max-[980px]:[scrollbar-width:none] max-[430px]:gap-4 max-[980px]:[&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Information categories"
          >
            {renderedFilters.map((item) => (
              <button
                key={item.value}
                className={`relative cursor-pointer border-0 bg-transparent pb-4 text-base font-[var(--f-body)] font-medium text-[var(--charcoal-muted)] outline-none transition-colors duration-200 hover:text-[var(--charcoal-muted)] max-[980px]:flex-[0_0_auto] max-[980px]:text-sm ${
                  activeFilter === item.value
                    ? "font-semibold text-[var(--charcoal)] after:absolute after:bottom-[-1px] after:left-0 after:h-0.5 after:w-full after:rounded-t-sm after:bg-[var(--charcoal)] after:content-[''] hover:text-[var(--charcoal)]"
                    : ''
                }`}
                type="button"
                data-filter={item.value}
                role="tab"
                aria-selected={activeFilter === item.value}
                onClick={() => setActiveFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 pb-3 max-[980px]:self-end">
            <button
              className="cursor-pointer border-0 bg-transparent px-2 text-xl leading-none text-[var(--charcoal)]"
              type="button"
              aria-label="Previous Slide"
              onClick={() =>
                slickListRef.current?.scrollBy({
                  left: -340,
                  behavior: 'smooth',
                })
              }
            >
              &#8249;
            </button>
            <button
              className="cursor-pointer border-0 bg-transparent px-2 text-xl leading-none text-[var(--charcoal)]"
              type="button"
              aria-label="Next Slide"
              onClick={() =>
                slickListRef.current?.scrollBy({
                  left: 340,
                  behavior: 'smooth',
                })
              }
            >
              &#8250;
            </button>
          </div>
        </div>
      </div>

      <div className="relative left-1/2 right-1/2 z-[1] -ml-[50vw] -mr-[50vw] w-screen">
        <div
          className="w-full overflow-x-auto scroll-smooth pb-[52px] pl-[max(24px,calc((100vw-1200px)/2))] pr-6 [-ms-overflow-style:none] [scrollbar-width:none] max-[980px]:px-5 [&::-webkit-scrollbar]:hidden"
          ref={slickListRef}
        >
          <div className="relative flex w-max flex-nowrap gap-3 before:pointer-events-none before:absolute before:-bottom-[52px] before:-left-[100vw] before:-right-[50px] before:h-[220px] before:bg-[var(--burgundy,#6b1f2a)] before:content-['']">
            {visibleCards.map((card) => (
              <div
                className="group relative w-[300px] flex-[0_0_300px] cursor-pointer overflow-hidden max-[980px]:w-[clamp(230px,42vw,300px)] max-[980px]:flex-[0_0_clamp(230px,42vw,300px)] max-[680px]:w-[min(78vw,280px)] max-[680px]:flex-[0_0_min(78vw,280px)] max-[430px]:w-[min(84vw,260px)] max-[430px]:flex-[0_0_min(84vw,260px)]"
                data-category={card.category}
                key={card.title}
              >
                <div className="relative aspect-[9/16] w-full overflow-hidden bg-[var(--charcoal)]">
                  <picture>
                    <img
                      className="block h-full w-full object-cover transition-[transform,filter] duration-500 ease-in-out group-hover:scale-105 group-hover:blur-[8px] group-hover:brightness-50"
                      src={card.image}
                      alt={card.alt}
                    />
                  </picture>
                  <div className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(0,0,0,0)_50%,rgba(0,0,0,0.75)_100%)] transition-colors duration-[400ms] group-hover:bg-[rgba(0,0,0,0.65)]" />
                  <div className="absolute inset-0 z-[2] flex flex-col justify-end px-6 py-8 text-white max-[680px]:px-[18px] max-[680px]:py-6">
                    <h3 className="mb-1.5 text-[22px] font-bold leading-[1.25] text-white transition-transform duration-[400ms] max-[680px]:text-[19px]">
                      {card.title}
                    </h3>
                    <span className="mb-0 text-[13px] font-medium text-white/85 transition-[opacity,transform] duration-[400ms]">
                      {card.tag}
                    </span>
                    <p className="mb-0 max-h-0 translate-y-[15px] overflow-hidden text-[13px] leading-[1.5] text-white/90 opacity-0 transition-[opacity,transform,max-height,margin] duration-300 group-hover:mb-4 group-hover:mt-3 group-hover:max-h-[120px] group-hover:translate-y-0 group-hover:opacity-100 max-[680px]:mb-3 max-[680px]:mt-2.5 max-[680px]:max-h-none max-[680px]:translate-y-0 max-[680px]:overflow-visible max-[680px]:opacity-100">
                      {card.text}
                    </p>
                    <Link
                      to={card.path}
                      className="inline-flex max-h-0 translate-y-[15px] items-center gap-2 overflow-hidden text-[13px] font-semibold text-white opacity-0 transition-[opacity,transform,max-height] duration-300 group-hover:max-h-10 group-hover:translate-y-0 group-hover:opacity-100 max-[680px]:max-h-none max-[680px]:translate-y-0 max-[680px]:overflow-visible max-[680px]:opacity-100"
                    >
                      {card.action}
                      <span className="transition-transform duration-200 group-hover:translate-x-[5px]">
                        &rarr;
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
