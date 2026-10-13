import { ChevronRight } from 'lucide-react';

import {
  AUDIT_LOG_SKELETON_ROWS,
  auditLogTableHeaderClass,
  formatAuditDate,
  formatAuditEntityType,
  formatAuditRelative,
  auditLogLabel,
  shortAuditId,
  type AuditLogItem,
} from '@/admin/features/audit/helpers/auditLogHelpers';
import { ActionBadge, AuditAvatar, ChangeChips, CopyId } from './AuditLogCells';

type AuditLogTableProps = {
  items: AuditLogItem[];
  isLoading: boolean;
  hasFilters: boolean;
  onSelect: (log: AuditLogItem) => void;
};

export default function AuditLogTable({
  items,
  isLoading,
  hasFilters,
  onSelect,
}: AuditLogTableProps) {
  const showSkeleton = isLoading && !items.length;

  return (
    <div className="max-h-[68vh] overflow-auto">
      <table className="w-full min-w-[860px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[#E2E8F0]">
            <th className={auditLogTableHeaderClass}>Time</th>
            <th className={auditLogTableHeaderClass}>Actor</th>
            <th className={auditLogTableHeaderClass}>Action</th>
            <th className={auditLogTableHeaderClass}>Entity</th>
            <th className={auditLogTableHeaderClass}>Changes</th>
            <th className={`${auditLogTableHeaderClass} w-12`}>
              <span className="sr-only">Details</span>
            </th>
          </tr>
        </thead>

        <tbody
          aria-busy={isLoading}
          className={`divide-y divide-[#E2E8F0] transition-opacity ${
            isLoading && !showSkeleton ? 'opacity-50' : ''
          }`}
        >
          {showSkeleton
            ? Array.from({ length: AUDIT_LOG_SKELETON_ROWS }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-5 py-4">
                    <div className="h-3.5 w-20 rounded bg-[#E2E8F0]" />
                    <div className="mt-2 h-3 w-28 rounded bg-[#F1F5F9]" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#E2E8F0]" />
                      <div>
                        <div className="h-3.5 w-24 rounded bg-[#E2E8F0]" />
                        <div className="mt-2 h-3 w-32 rounded bg-[#F1F5F9]" />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-6 w-20 rounded-full bg-[#E2E8F0]" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-3.5 w-20 rounded bg-[#E2E8F0]" />
                    <div className="mt-2 h-3 w-24 rounded bg-[#F1F5F9]" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-6 w-48 rounded bg-[#F1F5F9]" />
                  </td>
                  <td className="px-5 py-4" />
                </tr>
              ))
            : null}

          {!isLoading && !items.length ? (
            <tr>
              <td className="px-5 py-14 text-center" colSpan={6}>
                <p className="font-medium text-[#1C2434]">No audit logs found.</p>
                <p className="mt-1 text-sm text-[#64748B]">
                  {hasFilters
                    ? 'Try adjusting your filters or search.'
                    : 'Activity will appear here as CMS users make changes.'}
                </p>
              </td>
            </tr>
          ) : null}

          {items.map((log) => (
            <tr
              key={log.id}
              className="cursor-pointer align-middle transition-colors hover:bg-[#F1F5F9]/60"
              onClick={() => onSelect(log)}
            >
              <td className="whitespace-nowrap px-5 py-4">
                <p className="text-sm font-medium text-[#1C2434]">
                  {formatAuditRelative(log.createdAt)}
                </p>
                <p className="mt-0.5 text-xs text-[#64748B]">
                  {formatAuditDate(log.createdAt)}
                </p>
              </td>

              <td className="px-5 py-4">
                {log.actor ? (
                  <div className="flex min-w-0 items-center gap-3">
                    <AuditAvatar name={log.actor.name} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#1C2434]">
                        {log.actor.name}
                      </p>
                      <p className="truncate text-xs text-[#64748B]">{log.actor.email ?? '-'}</p>
                    </div>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm text-[#64748B]">
                    <span
                      aria-hidden="true"
                      className="grid h-8 w-8 place-items-center rounded-full bg-[#F1F5F9] text-xs font-semibold text-[#94A3B8]"
                    >
                      S
                    </span>
                    System
                  </span>
                )}
              </td>

              <td className="px-5 py-4">
                <ActionBadge action={log.action} />
              </td>

              <td className="px-5 py-4">
                <p className="text-sm font-semibold text-[#1C2434]">
                  {formatAuditEntityType(log.entityType)}
                </p>
                {auditLogLabel(log) ? (
                  <p className="mt-0.5 max-w-[16rem] truncate text-xs text-[#1C2434]" title={auditLogLabel(log) ?? undefined}>
                    {auditLogLabel(log)}
                  </p>
                ) : null}
                {log.entityId ? (
                  <p className="mt-0.5 flex items-center gap-0.5 text-xs text-[#64748B]">
                    <span className="font-mono" title={log.entityId}>
                      {shortAuditId(log.entityId)}
                    </span>
                    <CopyId value={log.entityId} />
                  </p>
                ) : null}
              </td>

              <td className="px-5 py-4">
                <ChangeChips log={log} />
              </td>

              <td className="px-3 py-4 text-right">
                <button
                  aria-label="View details"
                  className="rounded-md p-1.5 text-[#94A3B8] transition-colors hover:bg-white hover:text-[#3C50E0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3C50E0]"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelect(log);
                  }}
                >
                  <ChevronRight size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
