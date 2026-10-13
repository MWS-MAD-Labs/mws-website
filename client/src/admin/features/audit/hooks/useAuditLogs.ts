import { useEffect, useState } from 'react';

import { adminApi, type AuditLogList } from '@/admin/api/adminApi';
import {
  AUDIT_LOG_PAGE_SIZE,
  auditLogEmptyResult,
} from '@/admin/features/audit/helpers/auditLogHelpers';

export function useAuditLogs() {
  const [result, setResult] = useState<AuditLogList>(auditLogEmptyResult);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    const timer = window.setTimeout(
      () => {
        setIsLoading(true);
        setMessage(null);

        adminApi
          .auditLogs({
            action,
            entityType,
            page,
            pageSize: AUDIT_LOG_PAGE_SIZE,
            search,
          })
          .then((data) => {
            if (isCurrent) setResult(data);
          })
          .catch((error) => {
            if (!isCurrent) return;
            setMessage(error instanceof Error ? error.message : 'Failed to load audit logs.');
          })
          .finally(() => {
            if (isCurrent) setIsLoading(false);
          });
      },
      search ? 300 : 0,
    );

    return () => {
      isCurrent = false;
      window.clearTimeout(timer);
    };
  }, [action, entityType, page, search]);

  function changeSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function changeAction(value: string) {
    setAction(value);
    setPage(1);
  }

  function changeEntityType(value: string) {
    setEntityType(value);
    setPage(1);
  }

  function resetFilters() {
    setSearch('');
    setAction('');
    setEntityType('');
    setPage(1);
  }

  return {
    result,
    search,
    action,
    entityType,
    page,
    isLoading,
    message,
    hasFilters: Boolean(search || action || entityType),
    changeSearch,
    changeAction,
    changeEntityType,
    resetFilters,
    setPage,
  };
}
