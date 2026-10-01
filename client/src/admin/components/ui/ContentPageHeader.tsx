import type { ReactNode } from 'react';
import ContentBreadcrumb from '@/admin/components/ui/Breadcrumb';

type BreadcrumbItem = {
  label: string;
  path?: string;
};

type ContentPageHeaderProps = {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function ContentPageHeader({
  breadcrumbs,
  title,
  description,
  action,
}: ContentPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <ContentBreadcrumb items={breadcrumbs} />

        <h1 className="mt-1 text-xl font-semibold text-[#1C2434]">{title}</h1>

        {description ? <p className="mt-1 text-sm text-[#64748B]">{description}</p> : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
