import { formatAdminDateOnly, formatAdminRelativeTime } from '@/admin/utils/dateFormat';

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
  return formatAdminDateOnly(date, {
    day: 'numeric',
    month: 'short',
    ...(withWeekday ? { weekday: 'short' } : {}),
  });
}

export function formatRelativeTime(value: string, now = Date.now()) {
  return formatAdminRelativeTime(value, now);
}

const PAGE_LABELS: Record<string, string> = {
  '/': 'Home',
  '/our-school': 'Our School',
  '/about-millennia': 'About MWS',
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
