import type { PageStatus } from "../../config/pages";

type PageStatusBadgeProps = {
  status: PageStatus;
};

export default function PageStatusBadge({ status }: PageStatusBadgeProps) {
  const statusClass =
    status === "Published"
      ? "border-[#10B981]/20 bg-[#10B981]/10 text-[#047857]"
      : "border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#D97706]";

  return (
    <span
      className={`inline-flex min-w-[86px] items-center justify-center rounded-md border px-2.5 py-1 text-xs font-semibold ${statusClass}`}
    >
      {status}
    </span>
  );
}
