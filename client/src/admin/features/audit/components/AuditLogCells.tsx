import { useState, type MouseEvent } from 'react';
import { ArrowRight, Check, Copy } from 'lucide-react';

import {
  auditInitials,
  auditLogActionTone,
  auditLogToneClasses,
  diffAuditValues,
  displayAuditValue,
  formatAuditAction,
  type AuditLogItem,
} from '@/admin/features/audit/helpers/auditLogHelpers';

export function ActionBadge({ action }: { action: string }) {
  const tone = auditLogToneClasses[auditLogActionTone(action)];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tone.badge}`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {formatAuditAction(action)}
    </span>
  );
}

export function CopyId({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: ignore */
    }
  }

  return (
    <button
      aria-label={copied ? 'Copied' : 'Copy ID'}
      className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-[#3C50E0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3C50E0]"
      title={copied ? 'Copied' : 'Copy ID'}
      type="button"
      onClick={copy}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

export function AuditAvatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#3C50E0]/10 text-xs font-semibold text-[#3C50E0]"
    >
      {auditInitials(name)}
    </span>
  );
}

export function ValueText({ field, value, max }: { field: string; value: unknown; max?: number }) {
  const text = displayAuditValue(field, value, max);
  if (text === null) return <span className="italic text-[#94A3B8]">empty</span>;
  return <span className="break-words">{text}</span>;
}

export function ChangeChips({ log }: { log: AuditLogItem }) {
  const hasAny = log.oldValues != null || log.newValues != null;
  if (!hasAny) return <span className="text-sm text-[#94A3B8]">No details</span>;

  const changes = diffAuditValues(log.oldValues, log.newValues);

  if (changes === null) return <span className="text-sm text-[#64748B]">See details</span>;
  if (!changes.length) return <span className="text-sm text-[#64748B]">No field changes</span>;

  const visible = changes.slice(0, 2);
  const rest = changes.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((change) => (
        <span
          key={change.key}
          className="inline-flex max-w-[260px] items-center gap-1 rounded-md bg-[#F1F5F9] px-2 py-1 text-xs text-[#475569]"
        >
          <span className="font-semibold text-[#1C2434]">{change.key}</span>
          {change.kind === 'changed' ? (
            <>
              <span className="truncate text-[#B91C1C]">
                <ValueText field={change.key} max={18} value={change.before} />
              </span>
              <ArrowRight aria-hidden="true" className="shrink-0 text-[#94A3B8]" size={12} />
              <span className="truncate text-[#047857]">
                <ValueText field={change.key} max={18} value={change.after} />
              </span>
            </>
          ) : change.kind === 'added' ? (
            <span className="truncate text-[#047857]">
              <ValueText field={change.key} max={22} value={change.after} />
            </span>
          ) : (
            <span className="truncate text-[#B91C1C] line-through">
              <ValueText field={change.key} max={22} value={change.before} />
            </span>
          )}
        </span>
      ))}
      {rest > 0 ? <span className="text-xs font-medium text-[#64748B]">+{rest} more</span> : null}
    </div>
  );
}
