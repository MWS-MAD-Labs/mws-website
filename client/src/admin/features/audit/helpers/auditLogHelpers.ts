import type { AuditLogList } from '@/admin/api/adminApi';

export const AUDIT_LOG_PAGE_SIZE = 50;
export const AUDIT_LOG_SKELETON_ROWS = 8;

export type AuditLogItem = AuditLogList['items'][number];

export type FieldChange = {
  key: string;
  before: unknown;
  after: unknown;
  kind: 'added' | 'removed' | 'changed';
};

type Tone = 'create' | 'update' | 'delete' | 'warn' | 'neutral';

export const auditLogEmptyResult: AuditLogList = {
  items: [],
  filters: {
    actions: [],
    entityTypes: [],
  },
  pagination: {
    page: 1,
    pageSize: AUDIT_LOG_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  },
};

export const auditLogTableHeaderClass =
  'sticky top-0 z-10 bg-[#F1F5F9] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748B]';

export const auditLogSelectClass =
  'rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#1C2434] outline-none focus:border-[#3C50E0]';

const IGNORED_KEYS = new Set(['updatedAt']);
const SENSITIVE_KEY = /(password|secret|token|hash|authorization)/i;

export const auditLogToneClasses: Record<Tone, { badge: string; dot: string }> = {
  create: { badge: 'bg-[#10B981]/10 text-[#047857]', dot: 'bg-[#10B981]' },
  update: { badge: 'bg-[#3C50E0]/10 text-[#3C50E0]', dot: 'bg-[#3C50E0]' },
  delete: { badge: 'bg-[#EF4444]/10 text-[#B91C1C]', dot: 'bg-[#EF4444]' },
  warn: { badge: 'bg-[#F59E0B]/10 text-[#B45309]', dot: 'bg-[#F59E0B]' },
  neutral: { badge: 'bg-[#F1F5F9] text-[#475569]', dot: 'bg-[#94A3B8]' },
};

export function formatAuditDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatAuditRelative(value: string) {
  const seconds = (Date.now() - new Date(value).getTime()) / 1000;
  if (seconds < 45) return 'Just now';

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (seconds < 3600) return rtf.format(-Math.round(seconds / 60), 'minute');
  if (seconds < 86400) return rtf.format(-Math.round(seconds / 3600), 'hour');
  if (seconds < 604800) return rtf.format(-Math.round(seconds / 86400), 'day');
  return formatAuditDate(value);
}

export function formatAuditAction(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

export function formatAuditEntityType(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

/** The title or name of the changed item, when the entry recorded one. */
export function auditLogLabel(log: AuditLogItem) {
  const label = asRecord(log.newValues)?.label ?? asRecord(log.oldValues)?.label;
  return typeof label === 'string' && label ? label : null;
}

export function shortAuditId(value: string) {
  return value.length > 13 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
}

export function auditInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function auditLogActionTone(action: string): Tone {
  const value = action.toUpperCase();
  if (/(DELETE|REMOVE|REVOKE|DESTROY)/.test(value)) return 'delete';
  if (/(DEACTIVATE|DISABLE|SUSPEND|ARCHIVE|UNPUBLISH|REJECT)/.test(value)) return 'warn';
  if (/(CREATE|INVITE|ADD|ACTIVATE|ENABLE|PUBLISH|ACCEPT|RESTORE)/.test(value)) return 'create';
  if (/(UPDATE|EDIT|CHANGE|SYNC|ASSIGN|RENAME)/.test(value)) return 'update';
  return 'neutral';
}

export function diffAuditValues(oldValues: unknown, newValues: unknown): FieldChange[] | null {
  const before = asRecord(oldValues);
  const after = asRecord(newValues);

  if (!before && !after) return null;
  if ((oldValues && !before) || (newValues && !after)) return null;

  const keys = Array.from(new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]));

  return keys
    .filter((key) => !IGNORED_KEYS.has(key))
    .filter((key) => !sameValue(before?.[key], after?.[key]))
    .map((key) => {
      const hadBefore = before !== null && key in before && before[key] !== undefined;
      const hasAfter = after !== null && key in after && after[key] !== undefined;

      return {
        key,
        before: before?.[key],
        after: after?.[key],
        kind: !hadBefore ? 'added' : !hasAfter ? 'removed' : 'changed',
      };
    });
}

export function stringifyAuditValue(value: unknown) {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function displayAuditValue(key: string, value: unknown, max?: number) {
  if (SENSITIVE_KEY.test(key)) return '••••••';
  if (value === null || value === undefined || value === '') return null;

  const text = stringifyAuditValue(value);
  return max && text.length > max ? `${text.slice(0, max)}…` : text;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function sameValue(a: unknown, b: unknown) {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return a === b;
  }
}
