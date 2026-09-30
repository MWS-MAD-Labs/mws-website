import { Link } from 'react-router-dom';

type BreadcrumbItem = {
  label: string;
  path?: string;
};

type ContentBreadcrumbProps = {
  items: BreadcrumbItem[];
};

export default function ContentBreadcrumb({ items }: ContentBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="bg-[#f8f5f0]">
      <div className="mx-auto w-full max-w-[1240px] overflow-x-auto px-5 py-4 [scrollbar-width:none] sm:px-6 md:px-10 md:py-5 [&::-webkit-scrollbar]:hidden">
        <ol className="flex w-max min-w-full items-center gap-2.5 text-sm text-[var(--charcoal-muted)]">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={`${item.label}-${index}`} className="flex shrink-0 items-center gap-2.5">
                {item.path && !isLast ? (
                  <Link
                    to={item.path}
                    className="whitespace-nowrap transition-colors hover:text-[var(--burgundy)]"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={
                      isLast
                        ? 'whitespace-nowrap font-medium text-[var(--charcoal)]'
                        : 'whitespace-nowrap'
                    }
                  >
                    {item.label}
                  </span>
                )}

                {!isLast && (
                  <span aria-hidden="true" className="text-[var(--charcoal-muted)]">
                    /
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
