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
        <h3 className="text-sm font-semibold text-[#241718]">{title}</h3>
        <span className="text-[11px] text-gray-400">{unit}</span>
      </div>

      {!items.length ? (
        <p className="rounded-md border border-dashed border-gray-200 px-3 py-6 text-center text-sm text-gray-500">
          {emptyText}
        </p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li key={item.key}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-gray-800" title={item.detail ?? item.label}>
                  {item.label}
                  {item.detail ? (
                    <span className="ml-1.5 text-xs text-gray-400">{item.detail}</span>
                  ) : null}
                </span>
                <span className="shrink-0 tabular-nums text-gray-900">
                  {formatFullCount(item.value)}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-[#7e1518]"
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
