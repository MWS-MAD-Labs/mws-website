import { useState } from 'react';
import type { AnalyticsOverview } from '@/admin/api/adminApi';
import { formatCount, formatDay, formatFullCount } from './format';

type Day = AnalyticsOverview['daily'][number];

const CHART_HEIGHT = 280;
const CHART_MAX = 100;
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

  const max = CHART_MAX;
  const intervals = TICKS;
  const ticks = Array.from({ length: intervals + 1 }, (_, index) => (max / intervals) * index);
  const every = labelEvery(daily.length);
  const total = daily.reduce((sum, day) => sum + day.views, 0);
  const active = activeIndex === null ? null : daily[activeIndex];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[#1C2434]">Page views per day</h3>
        <button
          type="button"
          onClick={() => setShowTable((current) => !current)}
          className="text-xs font-semibold text-[#3C50E0] hover:underline"
        >
          {showTable ? 'Show chart' : 'Show as table'}
        </button>
      </div>

      {showTable ? (
        <div className="max-h-[260px] overflow-y-auto rounded-md border border-[#E2E8F0]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#F1F5F9] text-left text-xs text-[#64748B]">
              <tr>
                <th className="px-3 py-2 font-semibold">Date</th>
                <th className="px-3 py-2 text-right font-semibold">Page views</th>
                <th className="px-3 py-2 text-right font-semibold">Visits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] tabular-nums">
              {[...daily].reverse().map((day) => (
                <tr key={day.date}>
                  <td className="px-3 py-1.5 text-[#1C2434]">{formatDay(day.date, true)}</td>
                  <td className="px-3 py-1.5 text-right text-[#1C2434]">
                    {formatFullCount(day.views)}
                  </td>
                  <td className="px-3 py-1.5 text-right text-[#64748B]">
                    {formatFullCount(day.visits)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          role="img"
          aria-label={`Page views per day: ${formatFullCount(total)} in total over ${daily.length} days.`}
          className="relative mt-10 pl-10"
        >
          <div className="absolute inset-y-0 left-0 right-0" style={{ height: CHART_HEIGHT }}>
            {ticks.map((tick) => (
              <div
                key={tick}
                className="absolute left-0 right-0 flex items-center"
                style={{ bottom: `${(tick / max) * 100}%` }}
              >
                <span className="w-8 -translate-y-1/2 pr-2 text-right text-[11px] tabular-nums text-[#64748B]">
                  {formatCount(tick)}
                </span>
                <span className="h-px flex-1 bg-[#F1F5F9]" />
              </div>
            ))}
          </div>

          <div
            className="relative flex items-end gap-[2px]"
            style={{ height: CHART_HEIGHT }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {daily.map((day, index) => {
              const height = Math.min((day.views / max) * 100, 100);
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
                    <span className="absolute inset-0 rounded-sm bg-[#3C50E0]/[0.04]" />
                  ) : null}

                  <span
                    className={[
                      'relative w-full max-w-[24px] rounded-t-[4px] transition-colors',
                      isActive ? 'bg-[#2F3EC8]' : 'bg-[#3C50E0]',
                      day.views === 0 ? 'bg-transparent' : '',
                    ].join(' ')}
                    style={{
                      height: `${height}%`,
                      minHeight: day.views > 0 ? 2 : 0,
                    }}
                  />
                </button>
              );
            })}

            {active && activeIndex !== null ? (
              <div
                role="status"
                className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-xs shadow-lg"
                style={{
                  left: `${((activeIndex + 0.5) / daily.length) * 100}%`,
                }}
              >
                <p className="font-semibold text-[#1C2434]">{formatDay(active.date, true)}</p>

                <p className="mt-1 flex items-center gap-2 text-[#64748B]">
                  <span className="h-2 w-2 rounded-sm bg-[#3C50E0]" />
                  <span className="tabular-nums text-[#1C2434]">
                    {formatFullCount(active.views)}
                  </span>
                  page views
                </p>

                <p className="mt-0.5 pl-4 text-[#64748B]">
                  <span className="tabular-nums">{formatFullCount(active.visits)}</span> visits
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-2 flex gap-[2px]">
            {daily.map((day, index) => (
              <span
                key={day.date}
                className="min-w-0 flex-1 overflow-visible whitespace-nowrap text-center text-[11px] text-[#64748B]"
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
