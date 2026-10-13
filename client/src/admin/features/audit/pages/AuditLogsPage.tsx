import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

import AppShell from '@/admin/components/layout/AppShell';
import Button from '@/admin/components/ui/Button';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import AuditLogDetailDrawer from '@/admin/features/audit/components/AuditLogDetailDrawer';
import AuditLogFilters from '@/admin/features/audit/components/AuditLogFilters';
import AuditLogPagination from '@/admin/features/audit/components/AuditLogPagination';
import AuditLogTable from '@/admin/features/audit/components/AuditLogTable';
import type { AuditLogItem } from '@/admin/features/audit/helpers/auditLogHelpers';
import { useAuditLogs } from '@/admin/features/audit/hooks/useAuditLogs';

export default function AuditLogsPage() {
  const [selected, setSelected] = useState<AuditLogItem | null>(null);
  const {
    result,
    search,
    action,
    entityType,
    page,
    isLoading,
    message,
    hasFilters,
    changeSearch,
    changeAction,
    changeEntityType,
    resetFilters,
    setPage,
  } = useAuditLogs();

  const total = result.pagination.total;

  return (
    <AppShell title="Audit Logs">
      <section className="space-y-5 p-6">
        <ContentPageHeader
          breadcrumbs={[{ label: 'Admin' }, { label: 'Audit Logs' }]}
          title="Audit Logs"
          description="Review CMS user access and account-management activity."
        />

        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] px-5 py-4">
            <div>
              <h2 className="font-semibold text-[#1C2434]">Activity</h2>
              <p className="mt-0.5 text-sm text-[#64748B]">
                {total} {total === 1 ? 'entry' : 'entries'}
                {hasFilters ? ' match your filters' : ''}
              </p>
            </div>

            {hasFilters ? (
              <Button size="sm" type="button" variant="outline" onClick={resetFilters}>
                <RotateCcw aria-hidden="true" className="mr-1.5" size={14} />
                Reset filters
              </Button>
            ) : null}
          </div>

          <AuditLogFilters
            action={action}
            entityType={entityType}
            filters={result.filters}
            search={search}
            onActionChange={changeAction}
            onEntityTypeChange={changeEntityType}
            onSearchChange={changeSearch}
          />

          {message ? (
            <div className="border-b border-[#E2E8F0] px-5 py-3">
              <StatusMessage>{message}</StatusMessage>
            </div>
          ) : null}

          <AuditLogTable
            hasFilters={hasFilters}
            isLoading={isLoading}
            items={result.items}
            onSelect={setSelected}
          />

          <AuditLogPagination
            isLoading={isLoading}
            itemCount={result.items.length}
            page={page}
            pagination={result.pagination}
            onPageChange={setPage}
          />
        </div>
      </section>

      {selected ? <AuditLogDetailDrawer log={selected} onClose={() => setSelected(null)} /> : null}
    </AppShell>
  );
}
