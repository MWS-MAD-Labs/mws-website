export const ADMIN_DATE_LOCALE = 'id-ID';
export const ADMIN_TIME_ZONE = 'Asia/Jakarta';

const defaultDateOptions: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
};

const defaultDateTimeOptions: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
};

const defaultDateOnlyOptions: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
};

function formatter(options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(ADMIN_DATE_LOCALE, {
    ...options,
    timeZone: ADMIN_TIME_ZONE,
  });
}

export function formatAdminDate(
  value: string | null,
  options: Intl.DateTimeFormatOptions = defaultDateOptions,
  fallback = '-',
) {
  if (!value) return fallback;
  return formatter(options).format(new Date(value));
}

export function formatAdminDateTime(value: string | null, fallback = '-') {
  return formatAdminDate(value, defaultDateTimeOptions, fallback);
}

export function formatAdminDateOnly(
  value: string | null,
  options: Intl.DateTimeFormatOptions = defaultDateOnlyOptions,
  fallback = '-',
) {
  if (!value) return fallback;
  return formatter(options).format(new Date(`${value}T00:00:00+07:00`));
}

export function formatAdminRelativeTime(value: string, now = Date.now()) {
  const seconds = Math.round((new Date(value).getTime() - now) / 1000);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ];
  const relativeFormatter = new Intl.RelativeTimeFormat(ADMIN_DATE_LOCALE, { numeric: 'auto' });

  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relativeFormatter.format(Math.round(seconds / size), unit);
  }

  return 'baru saja';
}
