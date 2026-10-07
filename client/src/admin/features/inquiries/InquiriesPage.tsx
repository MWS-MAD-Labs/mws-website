import { useEffect, useRef, useState } from 'react';
import {
  adminApi,
  type ContactInquiry,
  type ContactInquiryList,
  type ContactInquiryStatus,
} from '@/admin/api/adminApi';
import AppShell from '@/admin/components/layout/AppShell';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';
import InquiryDetailModal from '@/admin/features/inquiries/components/InquiryDetailModal';
import InquiryListCard from '@/admin/features/inquiries/components/InquiryListCard';
import {
  EMPTY_INQUIRY_RESULT,
  INQUIRY_PAGE_SIZE,
  getInquiryStatusLabel,
} from '@/admin/features/inquiries/inquiryUtils';
import { getErrorMessage } from '@/admin/features/news/newsUtils';

export default function InquiriesPage() {
  const [result, setResult] = useState<ContactInquiryList>(EMPTY_INQUIRY_RESULT);
  const [status, setStatus] = useState<ContactInquiryStatus | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ContactInquiry | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [detailMessage, setDetailMessage] = useState<string | null>(null);
  const selectedIdRef = useRef<string | null>(null);

  const filters = { page, pageSize: INQUIRY_PAGE_SIZE, status, search };

  useEffect(() => {
    let isCurrent = true;

    const timer = window.setTimeout(
      () => {
        setIsLoading(true);
        setLoadError(null);

        adminApi
          .contactInquiries({ page, pageSize: INQUIRY_PAGE_SIZE, status, search })
          .then((nextResult) => {
            if (isCurrent) setResult(nextResult);
          })
          .catch((error) => {
            if (isCurrent) setLoadError(getErrorMessage(error, 'Failed to load inquiries.'));
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
  }, [page, refreshVersion, search, status]);

  function changeStatusFilter(nextStatus: ContactInquiryStatus | '') {
    setStatus(nextStatus);
    setPage(1);
  }

  function changeSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  async function openInquiry(inquiry: ContactInquiry) {
    selectedIdRef.current = inquiry.id;
    setSelected(inquiry);
    setDetailMessage(null);
    setIsDetailLoading(true);

    try {
      const fresh = await adminApi.contactInquiry(inquiry.id);
      if (selectedIdRef.current === inquiry.id) setSelected(fresh);
    } catch (error) {
      if (selectedIdRef.current === inquiry.id) {
        setDetailMessage(getErrorMessage(error, 'Failed to load the latest inquiry details.'));
      }
    } finally {
      if (selectedIdRef.current === inquiry.id) setIsDetailLoading(false);
    }
  }

  function closeInquiry() {
    if (isUpdating) return;
    selectedIdRef.current = null;
    setSelected(null);
    setDetailMessage(null);
  }

  async function updateStatus(inquiry: ContactInquiry, nextStatus: ContactInquiryStatus) {
    if (inquiry.status === nextStatus) return;

    if (nextStatus === 'SPAM') {
      const confirmed = window.confirm(
        `Mark the message from ${inquiry.name} as spam? It moves to the Spam tab.`,
      );
      if (!confirmed) return;
    }

    setIsUpdating(true);
    setDetailMessage(null);

    try {
      const updated = await adminApi.updateContactInquiryStatus(inquiry.id, nextStatus);
      if (selectedIdRef.current === updated.id) setSelected(updated);
      setDetailMessage(`Status updated to ${getInquiryStatusLabel(updated.status)}.`);

      // Refresh quietly so the row and the tab counts match without a loading flash.
      const nextResult = await adminApi.contactInquiries(filters);
      setResult(nextResult);
    } catch (error) {
      setDetailMessage(getErrorMessage(error, 'Failed to update the inquiry status.'));
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <AppShell title="Inquiries">
      <section className="space-y-5 p-6">
        <ContentPageHeader
          breadcrumbs={[{ label: 'Inbox' }, { label: 'Inquiries' }]}
          title="Inquiries"
          description="Messages sent from the public Contact form."
        />

        <InquiryListCard
          isLoading={isLoading}
          loadError={loadError}
          result={result}
          search={search}
          status={status}
          onOpen={(inquiry) => void openInquiry(inquiry)}
          onPageChange={setPage}
          onRetry={() => setRefreshVersion((current) => current + 1)}
          onSearchChange={changeSearch}
          onStatusChange={changeStatusFilter}
        />

        <InquiryDetailModal
          inquiry={selected}
          isLoading={isDetailLoading}
          isUpdating={isUpdating}
          message={detailMessage}
          onClose={closeInquiry}
          onStatusChange={(inquiry, nextStatus) => void updateStatus(inquiry, nextStatus)}
        />
      </section>
    </AppShell>
  );
}
