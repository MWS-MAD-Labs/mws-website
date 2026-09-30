const compactNumber = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const fullNumber = new Intl.NumberFormat('en-US');

export function formatCount(value: number) {
  return value >= 10_000 ? compactNumber.format(value) : fullNumber.format(value);
}

export function formatFullCount(value: number) {
  return fullNumber.format(value);
}

/** "2026-09-30" -> "30 Sep" (dates are already calendar days in Jakarta time). */
export function formatDay(date: string, withWeekday = false) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(withWeekday ? { weekday: 'short' } : {}),
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatRelativeTime(value: string, now = Date.now()) {
  const seconds = Math.round((new Date(value).getTime() - now) / 1000);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ];
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return formatter.format(Math.round(seconds / size), unit);
  }

  return 'just now';
}

/** Round an axis maximum up to a clean number (5, 10, 20, 50, 100, …). */
export function niceMax(value: number) {
  if (value <= 5) return 5;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((candidate) => candidate * magnitude >= value) ?? 10;
  return step * magnitude;
}

const PAGE_LABELS: Record<string, string> = {
  '/': 'Home',
  '/our-school': 'Our School',
  '/admission': 'Admission',
  '/book-a-tour': 'Book a Tour',
  '/academic': 'Academic',
  '/academic/kindergarten': 'Kindergarten',
  '/academic/elementary': 'Elementary',
  '/academic/high-school': 'High School',
  '/academic/junior-high': 'Junior High',
  '/kurikulum': 'Kurikulum',
  '/school-calendar': 'School Calendar',
  '/news': 'School News',
  '/community-stories': 'Community Stories',
  '/contact': 'Contact',
};

export function pageLabel(path: string) {
  if (PAGE_LABELS[path]) return PAGE_LABELS[path];
  if (path.startsWith('/news/')) return 'News article';
  return path;
}
