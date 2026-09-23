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
      <div className="mx-auto w-full max-w-[1240px] px-6 py-5 md:px-10">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-[var(--charcoal-muted)]">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                {item.path && !isLast ? (
                  <Link to={item.path} className="transition-colors hover:text-[var(--burgundy)]">
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'font-medium text-[var(--charcoal)]' : undefined}>
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
