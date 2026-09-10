import PageActions from "../ui/PageActions";
import PageStatusBadge from "../ui/PageStatusBadge";
import type { ManagedPage } from "../../config/pages";

type PagesTableProps = {
  pages: ManagedPage[];
};

export default function PagesTable({ pages }: PagesTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[rgba(36,23,24,0.14)] bg-white shadow-sm">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead className="border-b border-[rgba(36,23,24,0.14)] bg-[#faf8f3] text-xs uppercase text-[#625759]">
          <tr>
            <th className="px-4 py-3 font-semibold">Page</th>
            <th className="px-4 py-3 font-semibold">Template</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr
              key={page.id}
              className="border-b border-[rgba(36,23,24,0.08)] last:border-b-0"
            >
              <td className="px-4 py-3">
                <div className="font-medium text-[#241718]">{page.title}</div>
                <div className="mt-1 text-xs text-[#625759]">{page.path}</div>
              </td>
              <td className="px-4 py-3 text-[#625759]">{page.template}</td>
              <td className="px-4 py-3">
                <PageStatusBadge status={page.status} />
              </td>
              <td className="px-4 py-3">
                <PageActions page={page} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
