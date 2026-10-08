import { useEffect, useMemo, useState } from "react";
import SubpageHero from "../components/ui/SubpageHero";
import { calendarApi, type AcademicCalendarEvent } from "@/api/calendarApi";
import { asset } from "../data/site";

const typeLabel: Record<'school' | 'holiday', string> = {
  school: "Event",
  holiday: "Holiday",
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function padZ(n: number) {
  return String(n).padStart(2, "0");
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${padZ(month + 1)}-${padZ(day)}`;
}

export default function SchoolCalendar() {
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [calendarEvents, setCalendarEvents] = useState<AcademicCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    calendarApi
      .academicEvents(controller.signal)
      .then(setCalendarEvents)
      .catch((error) => {
        if (error?.name !== "CanceledError" && error?.name !== "AbortError") {
          setLoadError(error instanceof Error ? error.message : "Calendar could not be loaded.");
        }
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, []);

  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const changeYear = (delta: number) => setViewYear((year) => year + delta);

  const monthGroups = useMemo(() => {
    const groups: Array<{ month: number; items: AcademicCalendarEvent[] }> = [];
    const sorted = calendarEvents
      .filter((event) => event.startDate.startsWith(`${viewYear}-`))
      .sort((a, b) => a.startDate.localeCompare(b.startDate));

    for (const event of sorted) {
      const month = Number(event.startDate.slice(5, 7)) - 1;
      const last = groups[groups.length - 1];
      if (last && last.month === month) last.items.push(event);
      else groups.push({ month, items: [event] });
    }
    return groups;
  }, [calendarEvents, viewYear]);

  const formatDay = (value: string) =>
    new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
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
           {/* Header */}
           <div className="mb-12 flex items-end justify-between gap-6 max-[680px]:mb-8 max-[680px]:flex-col max-[680px]:items-start">
             <div>
               <h2 className="m-0 text-[clamp(32px,3.5vw,44px)] font-bold leading-[1.15] text-[var(--charcoal)]">
                 Important Dates &amp; Events
               </h2>
               <p className="mb-0 mt-3 text-base leading-[1.8] text-[var(--charcoal-muted)]">
                 Academic events and holidays managed by the school.
               </p>
             </div>

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

           {loadError ? (
             <p className="mb-6 border border-[var(--border)] px-5 py-4 text-sm text-[var(--charcoal-muted)]">
               {loadError}
             </p>
           ) : null}

           {isLoading ? (
             <p className="m-0 py-10 text-base text-[var(--charcoal-muted)]">
               Loading calendar events...
             </p>
           ) : monthGroups.length ? (
             <div className="flex flex-col gap-12 max-[680px]:gap-9">
               {monthGroups.map((group) => (
                 <div key={group.month}>
                   <h3 className="m-0 border-b-2 border-[var(--burgundy)] pb-3 text-xl font-bold text-[var(--charcoal)]">
                     {monthNames[group.month]}
                   </h3>

                   <ul className="m-0 list-none p-0">
                     {group.items.map((event) => {
                       const isHoliday = event.type === 'HOLIDAY';
                       const isPast = (event.endDate ?? event.startDate) < todayKey;

                       return (
                         <li
                           key={event.id}
                           className={`grid grid-cols-[150px_minmax(0,1fr)_auto] items-baseline gap-6 border-b border-[var(--border)] py-5 max-[680px]:grid-cols-1 max-[680px]:gap-1 ${
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
                                 {[event.eventTime, event.location].filter(Boolean).join(' · ')}
                               </p>
                             )}
                           </div>

                           <span
                             className={`text-[11px] font-bold uppercase tracking-[1.2px] ${
                               isHoliday ? 'text-[var(--gold)]' : 'text-[var(--charcoal-muted)]'
                             }`}
                           >
                             {typeLabel[isHoliday ? 'holiday' : 'school']}
                           </span>
                         </li>
                       );
                     })}
                   </ul>
                 </div>
               ))}
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
