import type { PageStatus } from "../../config/pages";

type PageStatusBadgeProps = {
  status: PageStatus;
};

export default function PageStatusBadge({ status }: PageStatusBadgeProps) {
  const statusClass =
    status === "Published"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex min-w-[86px] items-center justify-center rounded-md border px-2.5 py-1 text-xs font-semibold ${statusClass}`}
    >
      {status}
    </span>
  );
}
