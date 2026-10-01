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
    return <span className="text-xs text-[#64748B]">No earlier data to compare</span>;
  }

  const Icon = value > 0 ? ArrowUpRight : value < 0 ? ArrowDownRight : Minus;
  const tone = value > 0 ? 'text-[#047857]' : value < 0 ? 'text-[#B91C1C]' : 'text-[#64748B]';

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${tone}`}>
      <Icon size={14} aria-hidden="true" />
      {value > 0 ? '+' : ''}
      {value}%<span className="font-normal text-[#64748B]"> vs previous {days} days</span>
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
    <div className="min-w-0 bg-white px-4 py-3">
      <p className="text-xs font-medium text-[#64748B]" title={hint}>
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-[#1C2434]">{value}</p>
      <div className="mt-1 min-h-[18px]">{children}</div>
    </div>
  );
}

function ReferrersDevelopment() {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-[#1C2434]">Referrers</h3>
        <span className="rounded-md bg-[#F59E0B]/10 px-2 py-1 text-[11px] font-semibold text-[#D97706]">
          In Development
        </span>
      </div>

      <div className="rounded-md border border-dashed border-[#E2E8F0] px-4 py-6">
        <p className="text-sm font-medium text-[#1C2434]">
          Referral source tracking is currently being developed.
        </p>
        <p className="mt-1 text-sm text-[#64748B]">
          This panel will show where website visitors come from once tracking is active.
        </p>
      </div>
    </div>
  );
}

function EmptyChartState() {
  return (
    <div className="grid min-h-[280px] place-items-center rounded-lg border border-dashed border-[#E2E8F0] bg-[#F1F5F9]/60 px-5 py-10 text-center">
      <div>
        <p className="text-sm font-semibold text-[#1C2434]">
          No visits recorded in this period yet
        </p>
        <p className="mt-1 max-w-xl text-sm text-[#64748B]">
          Traffic is counted from the moment this dashboard was enabled. The chart will fill in as
          people visit the public website.
        </p>
      </div>
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
              requestError instanceof Error
                ? requestError.message
                : 'Traffic data could not be loaded.',
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
    <section aria-labelledby="traffic-title">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="traffic-title" className="text-base font-semibold text-[#1C2434]">
            Website Analytics
          </h2>
          <p className="mt-0.5 text-sm text-[#64748B]">
            Visits to the public website. A visit is one browsing session; no personal data is
            stored.
          </p>
        </div>

        <div
          role="group"
          aria-label="Time range"
          className="inline-flex rounded-lg border border-[#E2E8F0] bg-white p-0.5"
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
                  ? 'bg-[#F1F5F9] text-[#1C2434]'
                  : 'text-[#64748B] hover:text-[#1C2434]',
              ].join(' ')}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="mb-4">
          <Notice
            tone="error"
            action={{ label: 'Try again', onClick: () => setReloadKey((key) => key + 1) }}
          >
            {error}
          </Notice>
        </div>
      ) : null}

      {isLoading && !data ? (
        <div
          className="grid gap-px overflow-hidden rounded-lg border border-[#E2E8F0] bg-[#E2E8F0] sm:grid-cols-2 xl:grid-cols-4"
          aria-busy="true"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-[98px] animate-pulse bg-white" />
          ))}
        </div>
      ) : null}

      {data ? (
        <div className={isLoading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <div className="mb-4 grid gap-px overflow-hidden rounded-lg border border-[#E2E8F0] bg-[#E2E8F0] sm:grid-cols-2 xl:grid-cols-4">
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
              <span className="text-xs text-[#64748B]">Average pages viewed per visit</span>
            </StatTile>

            <StatTile label="On the site now" value={formatCount(data.totals.activeNow)}>
              <span className="text-xs text-[#64748B]">Visits in the last 30 minutes</span>
            </StatTile>
          </div>

          <div className="grid items-stretch gap-4 lg:grid-cols-3">
            <div className="min-w-0 rounded-lg border border-[#E2E8F0] bg-white p-5 lg:col-span-2">
              <h3 className="mb-4 text-sm font-semibold text-[#1C2434]">Daily Views</h3>

              {hasTraffic ? <DailyViewsChart daily={data.daily} /> : <EmptyChartState />}
            </div>

            <div className="min-w-0 rounded-lg border border-[#E2E8F0] bg-white p-5">
              <BarList
                title="Top Pages"
                unit="page views"
                emptyText="No page views yet."
                items={data.topPages.map((page) => ({
                  key: page.path,
                  label: pageLabel(page.path),
                  detail: pageLabel(page.path) === page.path ? undefined : page.path,
                  value: page.views,
                }))}
              />
            </div>
          </div>

          <div className="mt-4 grid items-stretch gap-4 lg:grid-cols-2">
            <div className="min-w-0 rounded-lg border border-[#E2E8F0] bg-white p-5">
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

            <div className="min-w-0 rounded-lg border border-[#E2E8F0] bg-white p-5">
              <ReferrersDevelopment />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
