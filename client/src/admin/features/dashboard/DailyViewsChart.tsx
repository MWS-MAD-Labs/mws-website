import { useState } from 'react';
import type { AnalyticsOverview } from '@/admin/api/adminApi';
import { formatCount, formatDay, formatFullCount, niceMax } from './format';

type Day = AnalyticsOverview['daily'][number];

const CHART_HEIGHT = 200;
const TICKS = 4;

function labelEvery(count: number) {
  if (count <= 7) return 1;
  if (count <= 31) return 5;
  return 15;
}

/**
 * Page views per day. One series, so no legend: the section title names it.
 * Each day is a focusable column with a tooltip; the table view carries the
 * exact numbers for anyone who cannot use hover.
 */
export default function DailyViewsChart({ daily }: { daily: Day[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  const max = niceMax(Math.max(...daily.map((day) => day.views), 0));
  // 4 intervals when that gives whole numbers (0/50/100/…), otherwise 5 (0/50/…/250).
  const intervals = Number.isInteger(max / TICKS) ? TICKS : 5;
  const ticks = Array.from({ length: intervals + 1 }, (_, index) => (max / intervals) * index);
  const every = labelEvery(daily.length);
  const total = daily.reduce((sum, day) => sum + day.views, 0);
  const active = activeIndex === null ? null : daily[activeIndex];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[#241718]">Page views per day</h3>
        <button
          type="button"
          onClick={() => setShowTable((current) => !current)}
          className="text-xs font-semibold text-[#7e1518] hover:underline"
        >
          {showTable ? 'Show chart' : 'Show as table'}
        </button>
      </div>

      {showTable ? (
        <div className="max-h-[260px] overflow-y-auto rounded-md border border-gray-100">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Date</th>
                <th className="px-3 py-2 text-right font-semibold">Page views</th>
                <th className="px-3 py-2 text-right font-semibold">Visits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 tabular-nums">
              {[...daily].reverse().map((day) => (
                <tr key={day.date}>
                  <td className="px-3 py-1.5 text-gray-700">{formatDay(day.date, true)}</td>
                  <td className="px-3 py-1.5 text-right text-gray-900">{formatFullCount(day.views)}</td>
                  <td className="px-3 py-1.5 text-right text-gray-600">{formatFullCount(day.visits)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          role="img"
          aria-label={`Page views per day: ${formatFullCount(total)} in total over ${daily.length} days.`}
          className="relative mt-5 pl-10"
        >
          {/* Recessive hairline grid with clean tick values */}
          <div className="absolute inset-y-0 left-0 right-0" style={{ height: CHART_HEIGHT }}>
            {ticks.map((tick) => (
              <div
                key={tick}
                className="absolute left-0 right-0 flex items-center"
                style={{ bottom: `${(tick / max) * 100}%` }}
              >
                <span className="w-8 -translate-y-1/2 pr-2 text-right text-[11px] tabular-nums text-gray-400">
                  {formatCount(tick)}
                </span>
                <span className="h-px flex-1 bg-gray-100" />
              </div>
            ))}
          </div>

          <div
            className="relative flex items-end gap-[2px]"
            style={{ height: CHART_HEIGHT }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {daily.map((day, index) => {
              const height = max ? (day.views / max) * 100 : 0;
              const isActive = activeIndex === index;

              return (
                <button
                  key={day.date}
                  type="button"
                  aria-label={`${formatDay(day.date, true)}: ${formatFullCount(day.views)} page views, ${formatFullCount(day.visits)} visits`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onBlur={() => setActiveIndex(null)}
                  className="group relative flex h-full min-w-0 flex-1 items-end justify-center outline-none"
                >
                  {isActive ? (
                    <span className="absolute inset-0 rounded-sm bg-[#7e1518]/[0.04]" />
                  ) : null}
                  <span
                    className={[
                      'relative w-full max-w-[24px] rounded-t-[4px] transition-colors',
                      isActive ? 'bg-[#5e1013]' : 'bg-[#7e1518]',
                      day.views === 0 ? 'bg-transparent' : '',
                    ].join(' ')}
                    style={{ height: `${height}%`, minHeight: day.views > 0 ? 2 : 0 }}
                  />
                </button>
              );
            })}

            {active && activeIndex !== null ? (
              <div
                role="status"
                className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg"
                style={{
                  left: `${((activeIndex + 0.5) / daily.length) * 100}%`,
                }}
              >
                <p className="font-semibold text-[#241718]">{formatDay(active.date, true)}</p>
                <p className="mt-1 flex items-center gap-2 text-gray-600">
                  <span className="h-2 w-2 rounded-sm bg-[#7e1518]" />
                  <span className="tabular-nums text-gray-900">{formatFullCount(active.views)}</span>
                  page views
                </p>
                <p className="mt-0.5 pl-4 text-gray-500">
                  <span className="tabular-nums">{formatFullCount(active.visits)}</span> visits
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-2 flex gap-[2px]">
            {daily.map((day, index) => (
              <span
                key={day.date}
                className="min-w-0 flex-1 overflow-visible whitespace-nowrap text-center text-[11px] text-gray-400"
              >
                {index % every === 0 || index === daily.length - 1 ? formatDay(day.date) : ''}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
