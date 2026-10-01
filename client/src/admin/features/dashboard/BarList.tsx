import { formatFullCount } from './format';

type BarListItem = {
  key: string;
  label: string;
  detail?: string;
  value: number;
};

/**
 * Ranked list with an inline magnitude bar. Values sit beside the bar in ink
 * colour; the bar only carries magnitude.
 */
export default function BarList({
  title,
  unit,
  items,
  emptyText,
}: {
  title: string;
  unit: string;
  items: BarListItem[];
  emptyText: string;
}) {
  const max = Math.max(...items.map((item) => item.value), 0);

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-[#1C2434]">{title}</h3>
        <span className="text-[11px] text-[#64748B]">{unit}</span>
      </div>

      {!items.length ? (
        <p className="rounded-md border border-dashed border-[#E2E8F0] px-3 py-6 text-center text-sm text-[#64748B]">
          {emptyText}
        </p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li key={item.key}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-[#1C2434]" title={item.detail ?? item.label}>
                  {item.label}
                  {item.detail ? (
                    <span className="ml-1.5 text-xs text-[#64748B]">{item.detail}</span>
                  ) : null}
                </span>
                <span className="shrink-0 tabular-nums text-[#1C2434]">
                  {formatFullCount(item.value)}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#F1F5F9]">
                <div
                  className="h-full rounded-full bg-[#3C50E0]"
                  style={{ width: `${max ? Math.max((item.value / max) * 100, 2) : 0}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
