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
    <nav aria-label="Breadcrumb" className="text-sm text-[#64748B]">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {item.path ? (
              <Link to={item.path} className="transition-colors hover:text-[#1C2434]">
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}

            {index < items.length - 1 ? <span aria-hidden="true">/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
