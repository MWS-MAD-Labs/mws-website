import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

import {
  diffAuditValues,
  formatAuditDate,
  formatAuditEntityType,
  stringifyAuditValue,
  type AuditLogItem,
} from '@/admin/features/audit/helpers/auditLogHelpers';
import { ActionBadge, AuditAvatar, CopyId, ValueText } from './AuditLogCells';

type AuditLogDetailDrawerProps = {
  log: AuditLogItem;
  onClose: () => void;
};

export default function AuditLogDetailDrawer({ log, onClose }: AuditLogDetailDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const extra = log as AuditLogItem & { ipAddress?: string | null; userAgent?: string | null };
  const changes = diffAuditValues(log.oldValues, log.newValues);

  useEffect(() => {
    closeRef.current?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      aria-labelledby="audit-drawer-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
    >
      <button
        aria-label="Close details"
        className="absolute inset-0 cursor-default bg-[#1C2434]/40"
        tabIndex={-1}
        type="button"
        onClick={onClose}
      />

      <aside className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-[#E2E8F0] px-6 py-5">
          <div className="min-w-0">
            <ActionBadge action={log.action} />
            <h2 className="mt-3 text-lg font-semibold text-[#1C2434]" id="audit-drawer-title">
              {formatAuditEntityType(log.entityType)}
            </h2>
            <p className="mt-0.5 text-sm text-[#64748B]">{formatAuditDate(log.createdAt)}</p>
          </div>
          <button
            ref={closeRef}
            aria-label="Close"
            className="rounded-md p-2 text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#1C2434] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3C50E0]"
            type="button"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">
          <dl className="grid grid-cols-[110px_1fr] gap-x-4 gap-y-4 text-sm">
            <dt className="text-[#64748B]">Actor</dt>
            <dd className="min-w-0">
              {log.actor ? (
                <span className="flex items-center gap-3">
                  <AuditAvatar name={log.actor.name} />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-[#1C2434]">
                      {log.actor.name}
                    </span>
                    <span className="block truncate text-xs text-[#64748B]">
                      {log.actor.email ?? '-'}
                    </span>
                  </span>
                </span>
              ) : (
                <span className="text-[#64748B]">System</span>
              )}
            </dd>

            <dt className="text-[#64748B]">Entity ID</dt>
            <dd className="flex min-w-0 items-center gap-1">
              <span className="break-all font-mono text-xs text-[#1C2434]">{log.entityId}</span>
              <CopyId value={log.entityId} />
            </dd>

            {extra.ipAddress ? (
              <>
                <dt className="text-[#64748B]">IP address</dt>
                <dd className="font-mono text-xs text-[#1C2434]">{extra.ipAddress}</dd>
              </>
            ) : null}

            {extra.userAgent ? (
              <>
                <dt className="text-[#64748B]">Device</dt>
                <dd className="break-words text-xs text-[#475569]">{extra.userAgent}</dd>
              </>
            ) : null}
          </dl>

          <div>
            <h3 className="text-sm font-semibold text-[#1C2434]">Changes</h3>

            {changes === null ? (
              <div className="mt-3 grid gap-3">
                {log.oldValues != null ? (
                  <RawBlock title="Before" value={stringifyAuditValue(log.oldValues)} />
                ) : null}
                {log.newValues != null ? (
                  <RawBlock title="After" value={stringifyAuditValue(log.newValues)} />
                ) : null}
                {log.oldValues == null && log.newValues == null ? (
                  <p className="text-sm text-[#64748B]">No details were recorded.</p>
                ) : null}
              </div>
            ) : changes.length ? (
              <div className="mt-3 overflow-hidden rounded-lg border border-[#E2E8F0]">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-[#F1F5F9] text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      <th className="px-3 py-2">Field</th>
                      <th className="px-3 py-2">Before</th>
                      <th className="px-3 py-2">After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {changes.map((change) => (
                      <tr key={change.key} className="align-top">
                        <td className="px-3 py-2.5 font-semibold text-[#1C2434]">
                          {change.key}
                        </td>
                        <td
                          className={`whitespace-pre-wrap px-3 py-2.5 ${
                            change.kind === 'added' ? '' : 'bg-[#EF4444]/5 text-[#B91C1C]'
                          }`}
                        >
                          {change.kind === 'added' ? (
                            <span className="text-[#94A3B8]">—</span>
                          ) : (
                            <ValueText field={change.key} value={change.before} />
                          )}
                        </td>
                        <td
                          className={`whitespace-pre-wrap px-3 py-2.5 ${
                            change.kind === 'removed' ? '' : 'bg-[#10B981]/5 text-[#047857]'
                          }`}
                        >
                          {change.kind === 'removed' ? (
                            <span className="text-[#94A3B8]">—</span>
                          ) : (
                            <ValueText field={change.key} value={change.after} />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-3 text-sm text-[#64748B]">
                No field changes. Only timestamps were updated.
              </p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

function RawBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#64748B]">{title}</p>
      <pre className="max-h-60 overflow-auto whitespace-pre-wrap break-words text-xs leading-relaxed text-[#1C2434]">
        {value}
      </pre>
    </div>
  );
}
