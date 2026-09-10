import { ExternalLink, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import type { ManagedPage } from "../../config/pages";

type PageActionsProps = {
  page: ManagedPage;
};

export default function PageActions({ page }: PageActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Link
        to={`/admin/pages/${page.id}/edit`}
        className="inline-flex items-center gap-2 rounded-lg border border-[rgba(36,23,24,0.14)] px-4 py-2 text-[13px] font-bold text-[#241718] transition-colors hover:bg-[#7e1518]/5"
        aria-label={`Edit ${page.title}`}
      >
        <Pencil size={14} />
        <span>Edit</span>
      </Link>
      <a
        href={page.path}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-lg border border-[rgba(36,23,24,0.14)] px-4 py-2 text-[13px] font-bold text-[#241718] transition-colors hover:bg-[#7e1518]/5"
        aria-label={`View ${page.title}`}
      >
        <ExternalLink size={14} />
        <span>View</span>
      </a>
    </div>
  );
}
