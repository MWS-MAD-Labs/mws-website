import { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, ChevronDown } from 'lucide-react';

import SubpageHero from '../components/ui/SubpageHero';
import { calendarApi, type GoogleCalendarEvent } from '@/api/calendarApi';
import { asset } from '../data/site';

const GOOGLE_CALENDAR_SHARE_URL =
  'https://calendar.google.com/calendar/u/0?cid=Y18xNjhlZmU5MzNiZWVjMmFmM2YzMThkZTU3MmRhOWI4MDk4OWRiNzhmZjJiYzlhOTNlZDA3ZjJlZTk0NmM3YWNjQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20';

const typeLabel: Record<'school' | 'holiday', string> = {
  school: 'Event',
  holiday: 'Holiday',
};

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const JAKARTA_TIME_ZONE = 'Asia/Jakarta';
const CALENDAR_PAGE_SIZE = 100;

function jakartaDateKey(value: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      day: '2-digit',
      month: '2-digit',
      timeZone: JAKARTA_TIME_ZONE,
      year: 'numeric',
    })
      .formatToParts(value)
      .map((part) => [part.type, part.value]),
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function monthKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

export default function SchoolCalendar() {
  const todayKey = useMemo(() => jakartaDateKey(new Date()), []);
  const currentYear = Number(todayKey.slice(0, 4));
  const currentMonth = Number(todayKey.slice(5, 7)) - 1;
  const defaultOpenMonths = (year: number) =>
    year === currentYear ? new Set([monthKey(currentYear, currentMonth)]) : new Set<string>();

  const [viewYear, setViewYear] = useState(currentYear);
  const [calendarEvents, setCalendarEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isConfigured, setIsConfigured] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [openMonths, setOpenMonths] = useState<Set<string>>(() =>
    defaultOpenMonths(currentYear),
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvents() {
      setIsLoading(true);
      setLoadError(null);
      setCalendarEvents([]);

      try {
        const events: GoogleCalendarEvent[] = [];
        let pageToken: string | undefined;
        let configured = true;

        do {
          const result = await calendarApi.events(
            {
              from: `${viewYear}-01-01`,
              to: `${viewYear}-12-31`,
              pageSize: CALENDAR_PAGE_SIZE,
              pageToken,
            },
            controller.signal,
          );
          configured = result.configured;
          events.push(...result.events);
          pageToken = result.pagination.nextPageToken ?? undefined;
        } while (pageToken && !controller.signal.aborted);

        if (!controller.signal.aborted) {
          setIsConfigured(configured);
          setCalendarEvents(events);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(error instanceof Error ? error.message : 'Calendar could not be loaded.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadEvents();
    return () => controller.abort();
  }, [reloadKey, viewYear]);

  const changeYear = (delta: number) => {
    const nextYear = viewYear + delta;
    setViewYear(nextYear);
    setOpenMonths(defaultOpenMonths(nextYear));
  };

  const toggleMonth = (month: number) => {
    const key = monthKey(viewYear, month);
    setOpenMonths((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const monthGroups = useMemo(() => {
    const groups: Array<{ month: number; items: GoogleCalendarEvent[] }> = [];
    const yearStart = `${viewYear}-01-01`;
    const yearEnd = `${viewYear}-12-31`;
    const sorted = calendarEvents
      .filter(
        (event) => event.startDate <= yearEnd && (event.endDate ?? event.startDate) >= yearStart,
      )
      .sort((a, b) => a.startDate.localeCompare(b.startDate));

    for (const event of sorted) {
      const groupDate = event.startDate < yearStart ? yearStart : event.startDate;
      const month = Number(groupDate.slice(5, 7)) - 1;
      const last = groups[groups.length - 1];
      if (last && last.month === month) last.items.push(event);
      else groups.push({ month, items: [event] });
    }

    return groups;
  }, [calendarEvents, viewYear]);

  const formatDay = (value: string) =>
    new Date(`${value}T00:00:00+07:00`).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      timeZone: JAKARTA_TIME_ZONE,
    });

  const formatRange = (start: string, end?: string | null) =>
    end && end !== start ? `${formatDay(start)} – ${formatDay(end)}` : formatDay(start);

  return (
    <main>
      <SubpageHero
        title="School Calendar"
        image={asset('DSC05350.jpg')}
        imageAlt="MWS Upcoming Events"
        breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'School Calendar' }]}
      />

      <section className="w-full bg-white px-6 py-[90px] max-[680px]:px-5 max-[680px]:py-[65px] md:px-10 md:py-[110px]">
        <div className="mx-auto w-full max-w-[900px]">
          <div className="mb-12 flex items-end justify-between gap-6 max-[680px]:mb-8 max-[680px]:flex-col max-[680px]:items-start">
            <div>
              <h2 className="m-0 text-[clamp(32px,3.5vw,44px)] font-bold leading-[1.15] text-[var(--charcoal)]">
                Important Dates &amp; Events
              </h2>
              <p className="mb-0 mt-3 text-base leading-[1.8] text-[var(--charcoal-muted)]">
                Academic events and holidays managed by the school.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 max-[680px]:justify-start">
              <a
                href={GOOGLE_CALENDAR_SHARE_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-[var(--burgundy)] px-4 py-2 text-sm font-semibold text-[var(--burgundy)] transition-colors duration-200 hover:bg-[var(--burgundy)] hover:text-white"
              >
                <CalendarPlus size={16} aria-hidden="true" />
                Add to Google Calendar
              </a>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Previous year"
                  onClick={() => changeYear(-1)}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center border border-[var(--border)] bg-transparent text-lg leading-none text-[var(--charcoal)] transition-colors duration-200 hover:bg-[var(--burgundy)] hover:text-white"
                >
                  &#8249;
                </button>
                <span className="min-w-[56px] text-center text-lg font-bold text-[var(--charcoal)]">
                  {viewYear}
                </span>
                <button
                  type="button"
                  aria-label="Next year"
                  onClick={() => changeYear(1)}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center border border-[var(--border)] bg-transparent text-lg leading-none text-[var(--charcoal)] transition-colors duration-200 hover:bg-[var(--burgundy)] hover:text-white"
                >
                  &#8250;
                </button>
              </div>
            </div>
          </div>

          {loadError ? (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-[var(--border)] px-5 py-4 text-sm text-[var(--charcoal-muted)]">
              <p className="m-0">{loadError}</p>
              <button
                type="button"
                className="border border-[var(--burgundy)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--burgundy)] transition-colors duration-200 hover:bg-[var(--burgundy)] hover:text-white"
                onClick={() => setReloadKey((key) => key + 1)}
              >
                Retry
              </button>
            </div>
          ) : null}

          {isLoading ? (
            <p className="m-0 py-10 text-base text-[var(--charcoal-muted)]">
              Loading calendar events...
            </p>
          ) : !isConfigured ? (
            <p className="m-0 py-10 text-base text-[var(--charcoal-muted)]">
              Calendar integration is not configured yet.
            </p>
          ) : monthGroups.length ? (
            <div className="flex flex-col gap-4">
              {monthGroups.map((group) => {
                const key = monthKey(viewYear, group.month);
                const isOpen = openMonths.has(key);
                const contentId = `calendar-month-${key}`;

                return (
                  <section key={key} className="border-b border-[var(--border)]">
                    <h3 className="m-0">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={contentId}
                        onClick={() => toggleMonth(group.month)}
                        className="flex w-full cursor-pointer items-center justify-between gap-4 border-b-2 border-[var(--burgundy)] py-4 text-left text-xl font-bold text-[var(--charcoal)] transition-colors hover:text-[var(--burgundy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--burgundy)]"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <ChevronDown
                            size={20}
                            aria-hidden="true"
                            className={`shrink-0 transition-transform duration-300 ease-out ${
                              isOpen ? 'rotate-0' : '-rotate-90'
                            }`}
                          />
                          <span>{monthNames[group.month]}</span>
                        </span>
                        <span className="shrink-0 text-sm font-medium text-[var(--charcoal-muted)]">
                          {group.items.length} {group.items.length === 1 ? 'event' : 'events'}
                        </span>
                      </button>
                    </h3>

                    <div
                      id={contentId}
                      aria-hidden={!isOpen}
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <ul
                          className={`m-0 list-none p-0 transition-transform duration-300 ease-out ${
                            isOpen ? 'translate-y-0' : '-translate-y-2'
                          }`}
                        >
                          {group.items.map((event) => {
                            const isHoliday = event.type === 'HOLIDAY';
                            const isPast = (event.endDate ?? event.startDate) < todayKey;

                            return (
                              <li
                                key={event.id}
                                className={`grid grid-cols-[150px_minmax(0,1fr)_auto] items-baseline gap-6 border-b border-[var(--border)] py-5 last:border-b-0 max-[680px]:grid-cols-1 max-[680px]:gap-1 ${
                                  isPast ? 'opacity-55' : ''
                                }`}
                              >
                                <span className="text-sm font-bold text-[var(--burgundy)]">
                                  {formatRange(event.startDate, event.endDate)}
                                </span>

                                <div>
                                  <h4 className="m-0 text-base font-semibold leading-snug text-[var(--charcoal)]">
                                    {event.title}
                                  </h4>
                                  {event.description && (
                                    <p className="mb-0 mt-1 text-sm leading-[1.7] text-[var(--charcoal-muted)]">
                                      {event.description}
                                    </p>
                                  )}
                                  {(event.eventTime || event.location) && (
                                    <p className="mb-0 mt-1 text-xs font-medium text-[var(--charcoal-muted)]">
                                      {[event.eventTime, event.location]
                                        .filter(Boolean)
                                        .join(' · ')}
                                    </p>
                                  )}
                                </div>

                                <span
                                  className={`text-[11px] font-bold uppercase tracking-[1.2px] ${
                                    isHoliday
                                      ? 'text-[var(--gold)]'
                                      : 'text-[var(--charcoal-muted)]'
                                  }`}
                                >
                                  {typeLabel[isHoliday ? 'holiday' : 'school']}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <p className="m-0 py-10 text-base text-[var(--charcoal-muted)]">
              No events scheduled for {viewYear}.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
