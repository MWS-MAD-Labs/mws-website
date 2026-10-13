import type { AuditLogList } from '@/admin/api/adminApi';
import SearchInput from '@/admin/components/ui/SearchInput';
import {
  auditLogSelectClass,
  formatAuditAction,
  formatAuditEntityType,
} from '@/admin/features/audit/helpers/auditLogHelpers';

type AuditLogFiltersProps = {
  filters: AuditLogList['filters'];
  search: string;
  action: string;
  entityType: string;
  onSearchChange: (value: string) => void;
  onActionChange: (value: string) => void;
  onEntityTypeChange: (value: string) => void;
};

export default function AuditLogFilters({
  filters,
  search,
  action,
  entityType,
  onSearchChange,
  onActionChange,
  onEntityTypeChange,
}: AuditLogFiltersProps) {
  return (
    <div className="grid gap-3 border-b border-[#E2E8F0] bg-[#F1F5F9]/60 px-5 py-4 md:grid-cols-[minmax(0,1fr)_220px_220px]">
      <SearchInput
        placeholder="Search actor, action, entity, or UUID..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      <select
        aria-label="Filter by action"
        className={auditLogSelectClass}
        value={action}
        onChange={(event) => onActionChange(event.target.value)}
      >
        <option value="">All actions</option>
        {filters.actions.map((item) => (
          <option key={item} value={item}>
            {formatAuditAction(item)}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by entity"
        className={auditLogSelectClass}
        value={entityType}
        onChange={(event) => onEntityTypeChange(event.target.value)}
      >
        <option value="">All entities</option>
        {filters.entityTypes.map((item) => (
          <option key={item} value={item}>
            {formatAuditEntityType(item)}
          </option>
        ))}
      </select>
    </div>
  );
}
