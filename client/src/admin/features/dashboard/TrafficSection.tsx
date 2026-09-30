import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { adminApi, type AnalyticsOverview, type AnalyticsRange } from '@/admin/api/adminApi';
import Notice from '@/admin/components/ui/Notice';
import BarList from './BarList';
import DailyViewsChart from './DailyViewsChart';
import { formatCount, pageLabel } from './format';

const RANGES: Array<{ days: AnalyticsRange; label: string }> = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
];

const DEVICE_LABELS: Record<string, string> = {
  desktop: 'Desktop',
  mobile: 'Mobile',
  tablet: 'Tablet',
};

function Change({ value, days }: { value: number | null; days: number }) {
  if (value === null) {
    return <span className="text-xs text-gray-400">No earlier data to compare</span>;
  }

  const Icon = value > 0 ? ArrowUpRight : value < 0 ? ArrowDownRight : Minus;
  const tone = value > 0 ? 'text-emerald-700' : value < 0 ? 'text-red-700' : 'text-gray-500';

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${tone}`}>
      <Icon size={14} aria-hidden="true" />
      {value > 0 ? '+' : ''}
      {value}%<span className="font-normal text-gray-400"> vs previous {days} days</span>
    </span>
  );
}

function StatTile({
  label,
  value,
  hint,
  children,
}: {
  label: string;
  value: string;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium text-gray-500" title={hint}>
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-[#241718]">{value}</p>
      <div className="mt-1 min-h-[18px]">{children}</div>
    </div>
  );
}

export default function TrafficSection() {
  const [range, setRange] = useState<AnalyticsRange>(30);
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setIsLoading(true);
      setError(null);

      adminApi
        .analytics(range)
        .then((overview) => {
          if (!cancelled) setData(overview);
        })
        .catch((requestError) => {
          if (!cancelled) {
            setError(
              requestError instanceof Error ? requestError.message : 'Traffic data could not be loaded.',
            );
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [range, reloadKey]);

  const hasTraffic = Boolean(data && data.totals.views > 0);

  return (
    <section aria-labelledby="traffic-title" className="rounded-lg border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
        <div>
          <h2 id="traffic-title" className="text-base font-semibold text-[#241718]">
            Website traffic
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Visits to the public website. A visit is one browsing session; no personal data is stored.
          </p>
        </div>

        <div
          role="group"
          aria-label="Time range"
          className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5"
        >
          {RANGES.map((option) => (
            <button
              key={option.days}
              type="button"
              aria-pressed={range === option.days}
              onClick={() => setRange(option.days)}
              className={[
                'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                range === option.days
                  ? 'bg-white text-[#241718] shadow-sm'
                  : 'text-gray-500 hover:text-[#241718]',
              ].join(' ')}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6 p-5">
        {error ? (
          <Notice
            tone="error"
            action={{ label: 'Try again', onClick: () => setReloadKey((key) => key + 1) }}
          >
            {error}
          </Notice>
        ) : null}

        {isLoading && !data ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-[98px] animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : null}

        {data ? (
          <div className={isLoading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatTile label="Page views" value={formatCount(data.totals.views)}>
                <Change value={data.change.views} days={data.range} />
              </StatTile>
              <StatTile
                label="Visits"
                value={formatCount(data.totals.visits)}
                hint="Browsing sessions. One person opening the site twice counts as two visits."
              >
                <Change value={data.change.visits} days={data.range} />
              </StatTile>
              <StatTile label="Pages per visit" value={String(data.totals.pagesPerVisit)}>
                <span className="text-xs text-gray-400">Average pages viewed per visit</span>
              </StatTile>
              <StatTile label="On the site now" value={formatCount(data.totals.activeNow)}>
                <span className="text-xs text-gray-400">Visits in the last 30 minutes</span>
              </StatTile>
            </div>

            {hasTraffic ? (
              <>
                <div className="mt-6">
                  <DailyViewsChart daily={data.daily} />
                </div>

                <div className="mt-8 grid gap-8 lg:grid-cols-3">
                  <BarList
                    title="Most visited pages"
                    unit="page views"
                    emptyText="No page views yet."
                    items={data.topPages.map((page) => ({
                      key: page.path,
                      label: pageLabel(page.path),
                      detail: pageLabel(page.path) === page.path ? undefined : page.path,
                      value: page.views,
                    }))}
                  />
                  <BarList
                    title="Where visitors come from"
                    unit="visits"
                    emptyText="No visits yet."
                    items={data.referrers.map((row) => ({
                      key: row.source,
                      label: row.source,
                      value: row.visits,
                    }))}
                  />
                  <BarList
                    title="Devices"
                    unit="visits"
                    emptyText="No visits yet."
                    items={data.devices.map((row) => ({
                      key: row.device,
                      label: DEVICE_LABELS[row.device] ?? row.device,
                      value: row.visits,
                    }))}
                  />
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-lg border border-dashed border-gray-200 px-5 py-10 text-center">
                <p className="text-sm font-medium text-gray-700">No visits recorded in this period yet</p>
                <p className="mt-1 text-sm text-gray-500">
                  Traffic is counted from the moment this dashboard was enabled. Charts appear as
                  soon as people visit the public website.
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
