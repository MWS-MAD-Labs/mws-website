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

const infoShape =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'%3E%3Cpath fill='%237E1518' fill-opacity='0.08' d='M48.7,-69.6C64.6,-60.1,79.9,-48.5,86.6,-33C93.2,-17.6,91.1,1.7,84,18.5C76.9,35.2,64.8,49.4,50.1,62.4C35.3,75.3,17.6,87.1,0.5,86.4C-16.7,85.8,-33.4,72.7,-49.5,60.1C-65.6,47.5,-81.1,35.4,-85.9,19.8C-90.7,4.2,-84.7,-14.9,-75.7,-31.1C-66.6,-47.3,-54.5,-60.5,-39.5,-70.5C-24.6,-80.4,-12.3,-87.1,2,-89.9C16.4,-92.7,32.8,-79.2,48.7,-69.6Z' transform='translate(120 120)'/%3E%3C/svg%3E\")";

export default function InfoSection({ title, filters, cards }: InfoSectionProps) {
  const [activeFilter, setActiveFilter] = useState(filters[0]?.value ?? '');
  const slickListRef = useRef<HTMLDivElement>(null);
  const visibleCards = cards.filter((card) => card.category === activeFilter);

  return (
    <section
      className="relative w-full translate-y-7 overflow-hidden bg-[var(--warm-white)] py-[120px] opacity-0 transition-[opacity,transform] duration-[900ms] ease-out data-[revealed=true]:translate-y-0 data-[revealed=true]:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none max-[980px]:py-[76px]"
      id="info-section"
      data-reveal
    >
      <span
        className="pointer-events-none absolute left-[-140px] top-[9%] z-0 h-[460px] w-[460px] bg-contain bg-no-repeat opacity-90 max-[980px]:left-[-190px] max-[980px]:h-80 max-[980px]:w-80"
        style={{ backgroundImage: infoShape }}
        aria-hidden="true"
      />

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
            {filters.map((item) => (
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
        <div>
          <div
            className="w-full overflow-x-auto scroll-smooth pl-[max(24px,calc((100vw-1200px)/2))] pr-6 [-ms-overflow-style:none] [scrollbar-width:none] max-[980px]:px-5 [&::-webkit-scrollbar]:hidden"
            ref={slickListRef}
          >
            <div className="flex flex-nowrap gap-0">
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
      </div>
    </section>
  );
}
