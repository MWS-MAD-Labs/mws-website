import { useMemo, useState } from "react";
import SubpageHero from "../components/ui/SubpageHero";
import { asset } from "../data/site";

type EventType = "academic" | "school" | "milestone" | "holiday" | "wellbeing";

type CalendarEvent = {
  type: EventType;
  title: string;
  desc: string;
  time?: string;
  location?: string;
};

const events: Record<string, CalendarEvent[]> = {
  "2026-07-14": [
    {
      type: "school",
      title: "First Day of Academic Year 2026/2027",
      desc: "Welcome back! Homeroom assemblies, material distribution, and whole-school orientation.",
      time: "07:30 AM",
      location: "Main Campus",
    },
  ],
  "2026-07-20": [
    {
      type: "wellbeing",
      title: "New Student & Family Welcome Breakfast",
      desc: "A warm community gathering for new families to meet homeroom teachers and student buddies.",
      time: "08:00 AM",
      location: "School Garden",
    },
  ],
  "2026-08-17": [
    {
      type: "school",
      title: "Independence Day Flag Ceremony",
      desc: "Annual national flag ceremony followed by traditional Indonesian games and cultural food bazaar.",
      time: "07:00 AM",
      location: "School Field",
    },
  ],
  "2026-09-07": [
    {
      type: "wellbeing",
      title: "Compassion Week Kickoff",
      desc: "Week-long school-wide activities promoting empathy, active listening, and community service.",
      time: "All Week",
      location: "All Classrooms",
    },
  ],
  "2026-09-21": [
    {
      type: "academic",
      title: "Mid-Term Assessments Begin",
      desc: "Formative project presentations and assessments across Elementary and High School pathway classes.",
      time: "08:00 AM",
      location: "Respective Classrooms",
    },
  ],
  "2026-09-25": [
    {
      type: "academic",
      title: "Mid-Term Assessments End",
      desc: "Final day of mid-term assessments. Results shared with parents within 5 business days.",
      time: "02:30 PM",
      location: "Respective Classrooms",
    },
  ],
  "2026-10-16": [
    {
      type: "milestone",
      title: "STEAM & Eco-Action Exhibition 2026",
      desc: "Students showcase cross-disciplinary science, technology, art, and environmental projects.",
      time: "09:00 AM - 12:00 PM",
      location: "Main Hall & Garden Studios",
    },
  ],
  "2026-11-01": [
    {
      type: "academic",
      title: "Academic Reports Distributed",
      desc: "Term 1 academic progress reports sent home. Parent consultation schedule opens.",
    },
  ],
  "2026-12-05": [
    {
      type: "academic",
      title: "End-of-Term Assessments Begin",
      desc: "Summative assessments across all grade levels for Term 1.",
      time: "08:00 AM",
      location: "Respective Classrooms",
    },
  ],
  "2026-12-19": [
    {
      type: "school",
      title: "Year-End Assembly & Awards",
      desc: "Annual celebration honoring student achievements, milestones, and community contributions.",
      time: "08:00 AM",
      location: "Main Hall",
    },
  ],
  "2026-12-21": [
    {
      type: "holiday",
      title: "Term 1 Break Begins",
      desc: "School campus closed for holiday break. Classes resume on January 5, 2027.",
    },
  ],
  "2027-01-05": [
    {
      type: "school",
      title: "Term 2 Begins",
      desc: "Welcome back for Term 2. Homeroom orientation and new unit introductions.",
      time: "07:30 AM",
      location: "Main Campus",
    },
  ],
};

const typeLabel: Record<EventType, string> = {
  academic: "Academic",
  school: "School Event",
  milestone: "Milestone",
  holiday: "Holiday",
  wellbeing: "Wellbeing / SEL",
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

function buildCells(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells: Array<{ day: number; key?: string; otherMonth?: boolean }> = [];

  for (let i = startOffset - 1; i >= 0; i -= 1) {
    cells.push({ day: daysInPrev - i, otherMonth: true });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, key: dateKey(year, month, day) });
  }

  const remaining = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= remaining; day += 1) {
    cells.push({ day, otherMonth: true });
  }

  return cells;
}

export default function SchoolCalendar() {
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const cells = buildCells(viewYear, viewMonth);
  const selectedEvents = selectedDate ? events[selectedDate] ?? [] : [];

  const changeMonth = (delta: number) => {
    setSelectedDate(null);
    setViewMonth((current) => {
      const next = current + delta;
      if (next < 0) {
        setViewYear((year) => year - 1);
        return 11;
      }
      if (next > 11) {
        setViewYear((year) => year + 1);
        return 0;
      }
      return next;
    });
  };

  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDate(null);
  };

  return (
    <main>
      <SubpageHero
        title="School Calendar"
        image={asset("DSC05350.jpg")}
        imageAlt="MWS Upcoming Events"
        breadcrumbs={[
          { label: "Home", path: "/" },
          { label: "School Calendar" },
        ]}
      />

      <section className="cal-page">
        <div className="wrap">
          <div className="cal-header">
            <h2>Important Dates & Events</h2>
            <p>
              Ipsum proident arcu do est irure duis exercitation elit sit eu
              pretium velit.
            </p>
          </div>

          <div className="cal-layout">
            <div>
              <div className="cal-grid-wrap">
                <div className="cal-nav">
                  <button
                    className="cal-nav-btn"
                    type="button"
                    aria-label="Previous month"
                    onClick={() => changeMonth(-1)}
                  >
                    &#8249;
                  </button>
                  <div style={{ alignItems: "center", display: "flex", gap: 16 }}>
                    <h3>{monthNames[viewMonth]} {viewYear}</h3>
                    <button className="cal-today-btn" type="button" onClick={goToday}>
                      Today
                    </button>
                  </div>
                  <button
                    className="cal-nav-btn"
                    type="button"
                    aria-label="Next month"
                    onClick={() => changeMonth(1)}
                  >
                    &#8250;
                  </button>
                </div>

                <div className="cal-dow">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>

                <div className="cal-days">
                  {cells.map((cell, index) => {
                    const dayEvents = cell.key ? events[cell.key] ?? [] : [];
                    const isToday =
                      cell.key ===
                      dateKey(today.getFullYear(), today.getMonth(), today.getDate());
                    const isSelected = selectedDate === cell.key;

                    return (
                      <button
                        className={[
                          "cal-day",
                          cell.otherMonth ? "other-month" : "",
                          isToday ? "today" : "",
                          dayEvents.length ? "has-event" : "",
                          isSelected ? "selected" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        disabled={!dayEvents.length}
                        key={`${cell.day}-${index}`}
                        type="button"
                        onClick={() => cell.key && setSelectedDate(cell.key)}
                      >
                        <span className="cal-day-num">{cell.day}</span>
                        {dayEvents.map((event) => (
                          <span
                            className={`cal-event-dot type-${event.type}`}
                            key={event.title}
                          >
                            {event.title}
                          </span>
                        ))}
                      </button>
                    );
                  })}
                </div>

                <div className="cal-legend">
                  {Object.entries(typeLabel).map(([type, label]) => (
                    <div className="cal-legend-item" key={type}>
                      <div className={`cal-legend-dot type-${type}`} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="cal-detail-panel">
              <div className="cal-detail-header">
                <h3>
                  {selectedDate
                    ? `${monthNames[viewMonth]} ${Number(selectedDate.slice(8, 10))}, ${viewYear}`
                    : "Select a date"}
                </h3>
              </div>
              <div className="cal-detail-body">
                {selectedEvents.length ? (
                  selectedEvents.map((event) => (
                    <div
                      className={`cal-event-card type-${event.type}`}
                      key={event.title}
                    >
                      <span className="cal-event-card-type">
                        {typeLabel[event.type]}
                      </span>
                      <h4>{event.title}</h4>
                      <p>{event.desc}</p>
                      {(event.time || event.location) && (
                        <div className="cal-event-card-meta">
                          {event.time && <span>{event.time}</span>}
                          {event.time && event.location && " · "}
                          {event.location && <span>{event.location}</span>}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="cal-detail-empty">
                    Click on a highlighted date to view event details.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
